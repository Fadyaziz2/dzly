enum BookingStatus { confirmed, pending, completed, cancelled, rejected }

class BookingModel {
  final String id;
  final String bookingCode;
  final String serviceId;
  final String categoryId;
  final String serviceTitle;
  final String city;
  final String date;
  final String timeSlot;
  final double totalPrice;
  final double commissionAmount;
  final double providerNet;
  final String customerName;
  final String customerPhone;
  final BookingStatus status;
  final Map<String, dynamic> dynamicFields;
  final String rejectionReason;

  const BookingModel({
    required this.id,
    required this.bookingCode,
    this.serviceId = '',
    this.categoryId = '',
    required this.serviceTitle,
    required this.city,
    required this.date,
    required this.timeSlot,
    required this.totalPrice,
    this.commissionAmount = 0.0,
    this.providerNet = 0.0,
    required this.customerName,
    required this.customerPhone,
    required this.status,
    this.dynamicFields = const {},
    this.rejectionReason = '',
  });

  factory BookingModel.fromJson(Map<String, dynamic> json) {
    final statusStr = (json['status'] ?? 'pending').toString().toLowerCase();
    BookingStatus status = BookingStatus.pending;
    if (statusStr == 'confirmed') {
      status = BookingStatus.confirmed;
    } else if (statusStr == 'completed') {
      status = BookingStatus.completed;
    } else if (statusStr == 'cancelled') {
      status = BookingStatus.cancelled;
    } else if (statusStr == 'rejected') {
      status = BookingStatus.rejected;
    }

    final price = (json['totalPrice'] is num) ? (json['totalPrice'] as num).toDouble() : 0.0;
    final commission = (json['commissionAmount'] is num) ? (json['commissionAmount'] as num).toDouble() : 0.0;
    final net = (json['providerNet'] is num) ? (json['providerNet'] as num).toDouble() : 0.0;

    String sTitle = json['serviceTitle'] ?? '';
    if (sTitle.isEmpty && json['service'] != null && json['service'] is Map) {
      sTitle = json['service']['title'] ?? '';
    }

    String sId = '';
    if (json['service'] is Map) {
      sId = json['service']['_id'] ?? json['service']['id'] ?? '';
    } else if (json['service'] is String) {
      sId = json['service'];
    }

    return BookingModel(
      id: json['_id'] ?? json['id'] ?? '',
      bookingCode: json['bookingCode'] ?? json['id'] ?? '',
      serviceId: sId,
      categoryId: json['categoryId'] ?? '',
      serviceTitle: sTitle,
      city: json['city'] ?? 'الوادي',
      date: json['date'] ?? '',
      timeSlot: json['timeSlot'] ?? '',
      totalPrice: price,
      commissionAmount: commission,
      providerNet: net,
      customerName: json['customerName'] ?? '',
      customerPhone: json['customerPhone'] ?? '',
      status: status,
      dynamicFields: (json['dynamicFields'] as Map<String, dynamic>?) ?? {},
      rejectionReason: json['rejectionReason'] ?? '',
    );
  }
}
