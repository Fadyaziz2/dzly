import 'dart:math';
import 'package:flutter/material.dart';
import '../core/config/api_config.dart';
import '../models/booking_model.dart';
import '../models/pharmacy_model.dart';
import '../models/service_model.dart';
import '../services/api_service.dart';

class BookingController extends ChangeNotifier {
  final ApiService _api = ApiService();

  List<PharmacyOrderModel> _pharmacyOrders = [];
  List<PharmacyOrderModel> get pharmacyOrders => _pharmacyOrders;

  List<BookingModel> _bookings = [
    const BookingModel(
      id: 'DZ-8492',
      bookingCode: 'DZ-8492',
      serviceTitle: 'قاعة الأفق - الوادي',
      city: 'الوادي',
      date: '2026-11-25',
      timeSlot: 'الفترة المسائية',
      totalPrice: 68000,
      customerName: 'أحمد بن علي',
      customerPhone: '0661234567',
      status: BookingStatus.confirmed,
    ),
    const BookingModel(
      id: 'DZ-7310',
      bookingCode: 'DZ-7310',
      serviceTitle: 'مزرعة النخيل',
      city: 'الوادي',
      date: '2026-10-14',
      timeSlot: 'يوم كامل',
      totalPrice: 24500,
      customerName: 'أحمد بن علي',
      customerPhone: '0661234567',
      status: BookingStatus.completed,
    ),
  ];

  bool _isLoading = false;
  bool get isLoading => _isLoading;
  List<BookingModel> get allBookings => _bookings;

  BookingController() {
    fetchMyBookings();
  }

  List<BookingModel> get activeBookings => _bookings
      .where((b) =>
          b.status == BookingStatus.confirmed ||
          b.status == BookingStatus.pending)
      .toList();

  List<BookingModel> get pastBookings => _bookings
      .where((b) =>
          b.status == BookingStatus.completed ||
          b.status == BookingStatus.cancelled ||
          b.status == BookingStatus.rejected)
      .toList();

  Future<void> fetchMyBookings() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _api.get(ApiConfig.myBookings);
      if (response is Map && response['bookings'] != null) {
        final List list = response['bookings'];
        if (list.isNotEmpty) {
          _bookings = list.map((b) => BookingModel.fromJson(b)).toList();
        }
      }

      // Also fetch pharmacy orders
      try {
        final pharmRes = await _api.get(ApiConfig.pharmacyOrders);
        if (pharmRes is Map && pharmRes['data'] is List) {
          _pharmacyOrders = (pharmRes['data'] as List)
              .map((item) => PharmacyOrderModel.fromJson(item as Map<String, dynamic>))
              .toList();
        }
      } catch (_) {}
    } catch (_) {
      // Use fallback initial bookings when offline or guest
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<BookingModel> submitDynamicBooking({
    required ServiceModel service,
    required String date,
    required String timeSlot,
    required String customerName,
    required String customerPhone,
    String customerNotes = '',
    Map<String, dynamic> dynamicFields = const {},
    double? customPrice,
  }) async {
    _isLoading = true;
    notifyListeners();

    try {
      final payload = {
        'serviceId': service.id,
        'date': date,
        'timeSlot': timeSlot,
        'customerName': customerName,
        'customerPhone': customerPhone,
        'customerNotes': customerNotes,
        'dynamicFields': dynamicFields,
      };
      if (customPrice != null) {
        payload['customPrice'] = customPrice;
      }

      final response = await _api.post(ApiConfig.createBooking, payload);
      final newBooking = BookingModel.fromJson(response['booking']);
      _bookings.insert(0, newBooking);
      _isLoading = false;
      notifyListeners();
      return newBooking;
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      // If API error or offline, fallback to local creation
      final randomCode = 1000 + Random().nextInt(8999);
      final fallbackBooking = BookingModel(
        id: 'DZ-$randomCode',
        bookingCode: 'DZ-$randomCode',
        serviceTitle: service.title,
        city: service.city,
        date: date,
        timeSlot: timeSlot,
        totalPrice: customPrice ?? service.discountedPrice,
        customerName: customerName,
        customerPhone: customerPhone,
        status: BookingStatus.confirmed,
        dynamicFields: dynamicFields,
      );
      _bookings.insert(0, fallbackBooking);
      notifyListeners();
      return fallbackBooking;
    }
  }

  BookingModel createBooking({
    required ServiceModel service,
    required String date,
    required String timeSlot,
    required String customerName,
    required String customerPhone,
  }) {
    final randomCode = 1000 + Random().nextInt(8999);
    final newBooking = BookingModel(
      id: 'DZ-$randomCode',
      bookingCode: 'DZ-$randomCode',
      serviceTitle: service.title,
      city: service.city,
      date: date,
      timeSlot: timeSlot,
      totalPrice: service.discountedPrice,
      customerName: customerName,
      customerPhone: customerPhone,
      status: BookingStatus.confirmed,
    );
    _bookings.insert(0, newBooking);
    notifyListeners();
    return newBooking;
  }

  Future<void> cancelBooking(String bookingId) async {
    final index = _bookings.indexWhere((b) => b.id == bookingId || b.bookingCode == bookingId);
    if (index != -1) {
      final old = _bookings[index];
      try {
        await _api.put(ApiConfig.cancelBooking(old.id), {
          'cancellationReason': 'إلغاء من قبل العميل عبر التطبيق',
        });
      } catch (e) {
        debugPrint('Cancel error: $e');
      }

      _bookings[index] = BookingModel(
        id: old.id,
        bookingCode: old.bookingCode,
        serviceTitle: old.serviceTitle,
        city: old.city,
        date: old.date,
        timeSlot: old.timeSlot,
        totalPrice: old.totalPrice,
        customerName: old.customerName,
        customerPhone: old.customerPhone,
        status: BookingStatus.cancelled,
        dynamicFields: old.dynamicFields,
      );
      notifyListeners();
    }
  }
}
