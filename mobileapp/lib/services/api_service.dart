import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  static const String tokenKey = 'ihjizli_client_jwt_token';
  static const String userKey = 'ihjizli_client_user_data';

  String? _cachedToken;

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _cachedToken = prefs.getString(tokenKey);
  }

  void setToken(String token) {
    _cachedToken = token;
  }

  void clearToken() {
    _cachedToken = null;
  }

  Map<String, String> _buildHeaders() {
    final headers = {
      'Content-Type': 'application/json; charset=UTF-8',
      'Accept': 'application/json',
    };
    if (_cachedToken != null && _cachedToken!.isNotEmpty) {
      headers['Authorization'] = 'Bearer $_cachedToken';
    }
    return headers;
  }

  Future<dynamic> get(String url) async {
    final uri = Uri.parse(url);
    final response = await http.get(uri, headers: _buildHeaders());
    return _processResponse(response);
  }

  Future<dynamic> post(String url, Map<String, dynamic> body) async {
    final uri = Uri.parse(url);
    final response = await http.post(
      uri,
      headers: _buildHeaders(),
      body: jsonEncode(body),
    );
    return _processResponse(response);
  }

  Future<dynamic> put(String url, Map<String, dynamic> body) async {
    final uri = Uri.parse(url);
    final response = await http.put(
      uri,
      headers: _buildHeaders(),
      body: jsonEncode(body),
    );
    return _processResponse(response);
  }

  Future<dynamic> patch(String url, Map<String, dynamic> body) async {
    final uri = Uri.parse(url);
    final response = await http.patch(
      uri,
      headers: _buildHeaders(),
      body: jsonEncode(body),
    );
    return _processResponse(response);
  }

  dynamic _processResponse(http.Response response) {
    final utf8Body = utf8.decode(response.bodyBytes);
    final decoded = jsonDecode(utf8Body);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return decoded;
    } else {
      final message = decoded is Map && decoded['message'] != null
          ? decoded['message']
          : 'حدث خطأ في الاتصال بالخادم (${response.statusCode})';
      throw Exception(message);
    }
  }
}

