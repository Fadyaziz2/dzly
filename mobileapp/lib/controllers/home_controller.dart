import 'package:flutter/material.dart';
import '../core/config/api_config.dart';
import '../core/constants/app_assets.dart';
import '../core/theme/app_colors.dart';
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
      color: AppColors.carsBlue,
      icon: Icons.directions_car_rounded,
      imageAsset: AppAssets.catCars,
    ),
    CategoryModel(
      id: 'beauty',
      title: 'التجميل والحلاقة',
      titleEn: 'Beauty & Spa',
      color: AppColors.beautyPink,
      icon: Icons.face_retouching_natural,
      imageAsset: AppAssets.catBeauty,
    ),
    CategoryModel(
      id: 'farms',
      title: 'المزارع',
      titleEn: 'Farms',
      color: AppColors.farmsGreen,
      icon: Icons.eco_rounded,
      imageAsset: AppAssets.catFarms,
    ),
    CategoryModel(
      id: 'weddings',
      title: 'قاعات الأفراح',
      titleEn: 'Wedding Halls',
      color: AppColors.weddingsRed,
      icon: Icons.celebration_rounded,
      imageAsset: AppAssets.catWeddings,
    ),
    CategoryModel(
      id: 'pools',
      title: 'مسابح',
      titleEn: 'Pools',
      color: AppColors.poolsCyan,
      icon: Icons.pool_rounded,
      imageAsset: AppAssets.catPools,
    ),
    CategoryModel(
      id: 'hotels',
      title: 'فنادق',
      titleEn: 'Hotels',
      color: AppColors.hotelsBlue,
      icon: Icons.hotel_rounded,
      imageAsset: AppAssets.catHotels,
    ),
    CategoryModel(
      id: 'farms_halls',
      title: 'المزارع والقاعات',
      titleEn: 'Farms & Halls',
      color: AppColors.farmsHallsPurple,
      icon: Icons.villa_rounded,
      imageAsset: AppAssets.catFarmsHalls,
    ),
    CategoryModel(
      id: 'houses',
      title: 'كراء المنازل',
      titleEn: 'Houses & Apartments',
      color: AppColors.housesTeal,
      icon: Icons.home_work_rounded,
      imageAsset: AppAssets.catHouses,
    ),
    CategoryModel(
      id: 'pharmacy',
      title: 'الصيدليات والأدوية',
      titleEn: 'Pharmacies & Medicines',
      color: AppColors.pharmacyTeal,
      icon: Icons.local_pharmacy_rounded,
      imageAsset: AppAssets.catPharmacy,
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
      accentColor: AppColors.carsBlue,
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
      accentColor: AppColors.farmsGreen,
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
      accentColor: AppColors.beautyPink,
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
      accentColor: AppColors.weddingsRed,
      imageAsset: AppAssets.offerHall,
      features: ['تكييف مركزي', 'موقف سيارات واسع', 'نظام صوتي حديث', 'طاقم ضيافة'],
    ),
    ServiceModel(
      id: 'srv_pharmacy',
      categoryId: 'pharmacy',
      title: 'صيدلية الشفاء المركزية',
      subtitle: 'مناوبة 24 ساعة وطلب أدوية',
      city: 'الوادي',
      address: 'شارع فلسطين، وسط المدينة - الوادي',
      price: 205,
      priceUnit: 'د.ج',
      discountPercent: 15,
      badgeLabel: 'خصم أدوية',
      rating: 4.9,
      reviewsCount: 142,
      accentColor: AppColors.pharmacyTeal,
      imageAsset: AppAssets.offerPharmacy,
      features: ['مناوبة ليلية 24 ساعة', 'توفير أدوية حرة ومقيدة', 'استلام فوري أو توصيل', 'مقارنة أفضل الأسعار'],
    ),
  ];

  List<CategoryModel> _categories = [];
  List<ServiceModel> _allServices = [];
  bool _isOffline = false;

  // Dynamic Banners
  String _headerBannerUrl = '';
  String _homeAdBannerUrl = '';
  String _homeAdBannerTitle = 'أعلن عن مشروعك';
  String _homeAdBannerSubtitle = 'معنا يصل إعلانك إلى آلاف المستخدمين';
  String _homeAdBannerActionText = 'تواصل معنا';
  String _homeAdBannerActionUrl = '';

  HomeController() {
    loadData();
  }

  String get selectedCity => _selectedCity;
  String get searchQuery => _searchQuery;
  String? get selectedQuickFilterId => _selectedQuickFilterId;
  bool get isLoading => _isLoading;
  bool get isOffline => _isOffline;

  String get headerBannerUrl => _headerBannerUrl;
  String get homeAdBannerUrl => _homeAdBannerUrl;
  String get homeAdBannerTitle => _homeAdBannerTitle;
  String get homeAdBannerSubtitle => _homeAdBannerSubtitle;
  String get homeAdBannerActionText => _homeAdBannerActionText;
  String get homeAdBannerActionUrl => _homeAdBannerActionUrl;

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

    bool hasNetworkError = false;

    // 1. Fetch Dynamic Banners & Global Settings
    try {
      final setRes = await _api.get(ApiConfig.settings);
      if (setRes['success'] == true) {
        final d = (setRes['data'] ?? setRes['settings']) as Map<String, dynamic>?;
        if (d != null) {
          _headerBannerUrl = d['headerBannerUrl'] ?? '';
          _homeAdBannerUrl = d['homeAdBannerUrl'] ?? '';
          if (d['homeAdBannerTitle'] != null && (d['homeAdBannerTitle'] as String).trim().isNotEmpty) {
            _homeAdBannerTitle = (d['homeAdBannerTitle'] as String).trim();
          }
          if (d['homeAdBannerSubtitle'] != null && (d['homeAdBannerSubtitle'] as String).trim().isNotEmpty) {
            _homeAdBannerSubtitle = (d['homeAdBannerSubtitle'] as String).trim();
          }
          if (d['homeAdBannerActionText'] != null && (d['homeAdBannerActionText'] as String).trim().isNotEmpty) {
            _homeAdBannerActionText = (d['homeAdBannerActionText'] as String).trim();
          }
          _homeAdBannerActionUrl = d['homeAdBannerActionUrl'] ?? '';
        }
      } else {
        hasNetworkError = true;
      }
    } catch (_) {
      hasNetworkError = true;
    }

    // 2. Fetch Categories (Live from database)
    try {
      final res = await _api.get(ApiConfig.categories);
      if (res['success'] == true) {
        final rawList = (res['data'] ?? res['categories']) as List<dynamic>?;
        if (rawList != null) {
          final list = rawList
              .map((e) => CategoryModel.fromJson(e as Map<String, dynamic>))
              .toList();
          _categories = list;
        }
      } else {
        hasNetworkError = true;
      }
    } catch (_) {
      hasNetworkError = true;
    }

    // 3. Fetch Services (Live from database)
    try {
      final srvRes = await _api.get(ApiConfig.services);
      if (srvRes['success'] == true) {
        final rawList = (srvRes['data'] ?? srvRes['services']) as List<dynamic>?;
        if (rawList != null) {
          final list = rawList
              .map((e) => ServiceModel.fromJson(e as Map<String, dynamic>))
              .toList();
          _allServices = list;
        }
      } else {
        hasNetworkError = true;
      }
    } catch (_) {
      hasNetworkError = true;
    }

    _isOffline = hasNetworkError;

    // Temporary/Fallback Data is ONLY shown when there is no connection (offline mode)
    if (_isOffline) {
      if (_categories.isEmpty) {
        _categories = List.from(_defaultCategories);
      }
      if (_allServices.isEmpty) {
        _allServices = List.from(_fallbackServices);
      }
    }

    _isLoading = false;
    notifyListeners();
  }
}
