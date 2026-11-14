class ApiConfig {
  // Base URL: configured for remote server
  // Remote Server IP: http://169.58.109.98:7001/api
  static String baseUrl = 'http://169.58.109.98:7001/api';

  // Configurable base URL setter (safely ensures /api suffix)
  static void setBaseUrl(String newUrl) {
    var formatted = newUrl.trim();
    if (formatted.endsWith('/')) {
      formatted = formatted.substring(0, formatted.length - 1);
    }
    if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
      formatted = 'http://$formatted';
    }
    if (!formatted.endsWith('/api')) {
      formatted = '$formatted/api';
    }
    baseUrl = formatted;
  }

  // Resolve media / banner URLs relative to server host
  static String resolveUrl(String? path) {
    if (path == null || path.trim().isEmpty) return '';
    final trimmed = path.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    final host = baseUrl.endsWith('/api')
        ? baseUrl.substring(0, baseUrl.length - 4)
        : baseUrl;
    if (trimmed.startsWith('/')) {
      return '$host$trimmed';
    }
    return '$host/$trimmed';
  }

  // Endpoints
  static String get login => '$baseUrl/auth/login';
  static String get register => '$baseUrl/auth/register';
  static String get profile => '$baseUrl/auth/me';
  static String get updateProfile => '$baseUrl/auth/profile';

  static String get categories => '$baseUrl/categories';
  static String get services => '$baseUrl/services';

  static String get createBooking => '$baseUrl/bookings';
  static String get myBookings => '$baseUrl/bookings/my-bookings';
  static String cancelBooking(String id) => '$baseUrl/bookings/$id/cancel';

  static String get favorites => '$baseUrl/favorites';
  static String toggleFavorite(String serviceId) => '$baseUrl/favorites/toggle/$serviceId';

  static String get notifications => '$baseUrl/notifications';
  static String get markNotificationsRead => '$baseUrl/notifications/mark-read';

  static String get settings => '$baseUrl/settings';

  // Pharmacy Module Endpoints
  static String searchMedicines({String query = '', String sort = 'nearby', double? lat, double? lng}) {
    final params = <String>[];
    if (query.isNotEmpty) params.add('q=${Uri.encodeComponent(query)}');
    if (sort.isNotEmpty) params.add('sort=${Uri.encodeComponent(sort)}');
    if (lat != null && lng != null) {
      params.add('lat=$lat');
      params.add('lng=$lng');
    }
    final qs = params.isNotEmpty ? '?${params.join('&')}' : '';
    return '$baseUrl/pharmacy/search$qs';
  }

  static String nearbyPharmacies({double? lat, double? lng}) {
    final params = <String>[];
    if (lat != null && lng != null) {
      params.add('lat=$lat');
      params.add('lng=$lng');
    }
    final qs = params.isNotEmpty ? '?${params.join('&')}' : '';
    return '$baseUrl/pharmacy/nearby$qs';
  }

  static String get pharmacyOrders => '$baseUrl/pharmacy/orders';
}

