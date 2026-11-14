import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/config/api_config.dart';
import '../models/user_model.dart';
import 'api_service.dart';

class AuthService {
  final ApiService _api = ApiService();

  Future<UserModel> login(String emailOrPhone, String password) async {
    final response = await _api.post(ApiConfig.login, {
      'emailOrPhone': emailOrPhone,
      'password': password,
    });

    final token = response['token'] ?? '';
    final userJson = response['user'] as Map<String, dynamic>;
    final user = UserModel.fromJson(userJson, token: token);

    // Save to SharedPreferences
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(ApiService.tokenKey, token);
    await prefs.setString(ApiService.userKey, jsonEncode(user.toJson()));
    _api.setToken(token);

    return user;
  }

  Future<UserModel> register({
    required String name,
    required String email,
    required String phone,
    required String password,
    required String city,
    String role = 'client',
  }) async {
    final response = await _api.post(ApiConfig.register, {
      'name': name,
      'email': email,
      'phone': phone,
      'password': password,
      'city': city,
      'role': role,
    });

    final token = response['token'] ?? '';
    final userJson = response['user'] as Map<String, dynamic>;
    final user = UserModel.fromJson(userJson, token: token);

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(ApiService.tokenKey, token);
    await prefs.setString(ApiService.userKey, jsonEncode(user.toJson()));
    _api.setToken(token);

    return user;
  }

  Future<UserModel?> getSavedUser() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(ApiService.tokenKey);
    final userString = prefs.getString(ApiService.userKey);

    if (token != null && token.isNotEmpty && userString != null) {
      _api.setToken(token);
      try {
        final decoded = jsonDecode(userString) as Map<String, dynamic>;
        return UserModel.fromJson(decoded, token: token);
      } catch (_) {
        return null;
      }
    }
    return null;
  }

  Future<UserModel?> fetchRemoteProfile() async {
    try {
      final response = await _api.get(ApiConfig.profile);
      if (response['user'] != null) {
        final prefs = await SharedPreferences.getInstance();
        final token = prefs.getString(ApiService.tokenKey) ?? '';
        final user = UserModel.fromJson(response['user'], token: token);
        await prefs.setString(ApiService.userKey, jsonEncode(user.toJson()));
        return user;
      }
    } catch (_) {}
    return null;
  }

  Future<UserModel> updateProfile({
    required String name,
    required String phone,
    required String city,
  }) async {
    final response = await _api.put(ApiConfig.updateProfile, {
      'name': name,
      'phone': phone,
      'city': city,
    });

    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(ApiService.tokenKey) ?? '';
    final user = UserModel.fromJson(response['user'], token: token);
    await prefs.setString(ApiService.userKey, jsonEncode(user.toJson()));
    return user;
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(ApiService.tokenKey);
    await prefs.remove(ApiService.userKey);
    _api.clearToken();
  }
}

