import 'package:flutter/material.dart';
import '../core/config/api_config.dart';
import '../models/service_model.dart';
import '../services/api_service.dart';

class FavoritesController extends ChangeNotifier {
  final ApiService _api = ApiService();
  final Set<String> _favoriteIds = {};

  FavoritesController() {
    fetchFavorites();
  }

  bool isFavorite(String serviceId) => _favoriteIds.contains(serviceId);
  Set<String> get favoriteIds => _favoriteIds;

  Future<void> fetchFavorites() async {
    try {
      final response = await _api.get(ApiConfig.favorites);
      if (response != null && (response['favoriteIds'] != null || response['data'] != null)) {
        final List ids = (response['favoriteIds'] ?? response['data']) as List;
        _favoriteIds.clear();
        for (var id in ids) {
          _favoriteIds.add(id.toString());
        }
        notifyListeners();
      }
    } catch (_) {}
  }

  Future<void> toggleFavorite(String serviceId) async {
    if (_favoriteIds.contains(serviceId)) {
      _favoriteIds.remove(serviceId);
    } else {
      _favoriteIds.add(serviceId);
    }
    notifyListeners();

    try {
      await _api.post(ApiConfig.toggleFavorite(serviceId), {});
    } catch (_) {}
  }

  List<ServiceModel> getFavoriteServices(List<ServiceModel> allServices) {
    return allServices.where((s) => _favoriteIds.contains(s.id)).toList();
  }
}
