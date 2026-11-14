import 'package:flutter/material.dart';
import '../core/config/api_config.dart';
import '../core/constants/app_assets.dart';
import '../models/category_model.dart';
import '../models/service_model.dart';
import '../services/api_service.dart';

class HomeController extends ChangeNotifier {
  final ApiService _api = ApiService();

  String _selectedCity = 'الوادي';
  String _searchQuery = '';
  String? _selectedQuickFilterId;
  bool _isLoading = false;

  final List<String> availableCities = [
    'الوادي',
    'الجزائر العاصمة',
    'وهران',
    'قسنطينة',
    'سطيف',
    'ورقلة',
    'بسكرة',
  ];

  static const List<CategoryModel> _defaultCategories = [
    CategoryModel(
      id: 'cars',
      title: 'كراء السيارات',
      titleEn: 'Car Rental',
      color: Color(0xFF0D6EFD),
      icon: Icons.directions_car_rounded,
      imageAsset: AppAssets.catCars,
    ),
    CategoryModel(
      id: 'beauty',
      title: 'التجميل والحلاقة',
      titleEn: 'Beauty & Spa',
      color: Color(0xFFE91E63),
      icon: Icons.face_retouching_natural,
      imageAsset: AppAssets.catBeauty,
    ),
    CategoryModel(
      id: 'farms',
      title: 'المزارع',
      titleEn: 'Farms',
      color: Color(0xFF2E7D32),
      icon: Icons.eco_rounded,
      imageAsset: AppAssets.catFarms,
    ),
    CategoryModel(
      id: 'weddings',
      title: 'قاعات الأفراح',
      titleEn: 'Wedding Halls',
      color: Color(0xFFC2185B),
      icon: Icons.celebration_rounded,
      imageAsset: AppAssets.catWeddings,
    ),
    CategoryModel(
      id: 'pools',
      title: 'مسابح',
      titleEn: 'Pools',
      color: Color(0xFF00ACC1),
      icon: Icons.pool_rounded,
      imageAsset: AppAssets.catPools,
    ),
    CategoryModel(
      id: 'hotels',
      title: 'فنادق',
      titleEn: 'Hotels',
      color: Color(0xFF1976D2),
      icon: Icons.hotel_rounded,
      imageAsset: AppAssets.catHotels,
    ),
    CategoryModel(
      id: 'farms_halls',
      title: 'المزارع والقاعات',
      titleEn: 'Farms & Halls',
      color: Color(0xFF6A1B9A),
      icon: Icons.villa_rounded,
      imageAsset: AppAssets.catFarmsHalls,
    ),
    CategoryModel(
      id: 'houses',
      title: 'كراء المنازل',
      titleEn: 'Houses & Apartments',
      color: Color(0xFF00897B),
      icon: Icons.home_work_rounded,
      imageAsset: AppAssets.catHouses,
    ),
  ];

  static const List<ServiceModel> _fallbackServices = [
    ServiceModel(
      id: 'srv_4',
      categoryId: 'cars',
      title: 'كراء سيارات الفخامة',
      subtitle: 'تشكيلة واسعة من السيارات',
      city: 'الوادي',
      address: 'شارع الاستقلال - الوادي',
      price: 10000,
      priceUnit: 'د.ج / اليوم',
      discountPercent: 20,
      badgeLabel: 'عرض',
      rating: 4.8,
      reviewsCount: 88,
      accentColor: Color(0xFF0D6EFD),
      imageAsset: AppAssets.offerCar,
      features: ['تأمين شامل', 'سيارات جديدة 2024', 'خيار مع سائق أو بدون', 'كيلومترات مفتوحة'],
    ),
    ServiceModel(
      id: 'srv_3',
      categoryId: 'farms',
      title: 'مزرعة النخيل',
      subtitle: 'تنظيم حفلات ومناسبات',
      city: 'الوادي',
      address: 'منطقة تكسبت السياحية - الوادي',
      price: 35000,
      priceUnit: 'د.ج / لليوم',
      discountPercent: 30,
      badgeLabel: 'عرض',
      rating: 4.9,
      reviewsCount: 210,
      accentColor: Color(0xFF2E7D32),
      imageAsset: AppAssets.offerFarm,
      features: ['مسبح خاص', 'مساحات خضراء', 'منطقة شواء', 'واي فاي مجاني'],
    ),
    ServiceModel(
      id: 'srv_2',
      categoryId: 'beauty',
      title: 'صالون الجمال',
      subtitle: 'عناية كاملة بالبشرة والشعر',
      city: 'الوادي',
      address: 'وسط المدينة، شارع فلسطين - الوادي',
      price: 12000,
      priceUnit: 'د.ج / باقة',
      discountPercent: 15,
      badgeLabel: 'عرض',
      rating: 4.8,
      reviewsCount: 98,
      accentColor: Color(0xFF6A1B9A),
      imageAsset: AppAssets.offerSalon,
      features: ['منتجات عالمية', 'غرف VIP خاصة', 'حجز مسبق بدون انتظار'],
    ),
    ServiceModel(
      id: 'srv_1',
      categoryId: 'weddings',
      title: 'قاعة الأفق - الوادي',
      subtitle: 'لجميع المناسبات',
      city: 'الوادي',
      address: 'حي الرمال، طريق المطار - الوادي',
      price: 85000,
      priceUnit: 'د.ج / لليلة',
      discountPercent: 20,
      badgeLabel: 'خصم خاص',
      rating: 4.9,
      reviewsCount: 142,
      accentColor: Color(0xFFE53935),
      imageAsset: AppAssets.offerHall,
      features: ['تكييف مركزي', 'موقف سيارات واسع', 'نظام صوتي حديث', 'طاقم ضيافة'],
    ),
  ];

  List<CategoryModel> _categories = _defaultCategories;
  List<ServiceModel> _allServices = _fallbackServices;

  HomeController() {
    loadData();
  }

  String get selectedCity => _selectedCity;
  String get searchQuery => _searchQuery;
  String? get selectedQuickFilterId => _selectedQuickFilterId;
  bool get isLoading => _isLoading;

  List<CategoryModel> get categories => _categories;

  List<ServiceModel> get allServices {
    return _allServices.where((s) {
      final matchCity = _selectedCity.isEmpty || s.city.contains(_selectedCity);
      final matchSearch = _searchQuery.isEmpty ||
          s.title.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          s.subtitle.toLowerCase().contains(_searchQuery.toLowerCase());
      final matchCategory = _selectedQuickFilterId == null || s.categoryId == _selectedQuickFilterId;
      return matchCity && matchSearch && matchCategory;
    }).toList();
  }

  List<ServiceModel> get discountedOffers {
    return _allServices.where((s) => s.discountPercent > 0).toList();
  }

  List<ServiceModel> getServicesByCategory(String categoryId) {
    return _allServices.where((s) => s.categoryId == categoryId).toList();
  }

  void changeCity(String city) {
    _selectedCity = city;
    notifyListeners();
  }

  void updateSearchQuery(String query) {
    _searchQuery = query.trim();
    notifyListeners();
  }

  void toggleQuickFilter(String? categoryId) {
    if (_selectedQuickFilterId == categoryId) {
      _selectedQuickFilterId = null;
    } else {
      _selectedQuickFilterId = categoryId;
    }
    notifyListeners();
  }

  Future<void> loadData() async {
    _isLoading = true;
    notifyListeners();

    try {
      final res = await _api.get(ApiConfig.categories);
      if (res['success'] == true && res['data'] != null) {
        final list = (res['data'] as List<dynamic>)
            .map((e) => CategoryModel.fromJson(e as Map<String, dynamic>))
            .toList();
        if (list.isNotEmpty) {
          _categories = list;
        }
      }
    } catch (_) {
      // Fallback already assigned
    }

    try {
      final srvRes = await _api.get(ApiConfig.services);
      if (srvRes['success'] == true && srvRes['data'] != null) {
        final list = (srvRes['data'] as List<dynamic>)
            .map((e) => ServiceModel.fromJson(e as Map<String, dynamic>))
            .toList();
        if (list.isNotEmpty) {
          _allServices = list;
        }
      }
    } catch (_) {
      // Fallback already assigned
    }

    _isLoading = false;
    notifyListeners();
  }
}
