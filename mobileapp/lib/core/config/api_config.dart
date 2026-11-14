class ApiConfig {
  // Base URL: can be changed easily when deploying to production or hosting
  // For macOS Desktop / iOS Simulator / Web: http://localhost:5001/api
  // For Android Emulator: http://10.0.2.2:5001/api
  // For Local Network / Device: http://<YOUR_IP>:5001/api
  static String baseUrl = 'http://localhost:5001/api';

  // Configurable base URL setter
  static void setBaseUrl(String newUrl) {
    baseUrl = newUrl;
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
}

