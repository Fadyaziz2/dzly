import 'package:flutter/material.dart';
import '../core/config/api_config.dart';
import '../models/notification_model.dart';
import '../services/api_service.dart';

class NotificationsController extends ChangeNotifier {
  final ApiService _api = ApiService();

  static List<NotificationModel> get _defaultFallbackNotifications => [
    NotificationModel(
      id: 'n1',
      title: 'خصم 30% على مزرعة النخيل!',
      body: 'استفد من العرض الحصري لنهاية الأسبوع في ولاية الوادي.',
      timeAgo: 'منذ ساعتين',
      isOffer: true,
    ),
    NotificationModel(
      id: 'n2',
      title: 'تم تأكيد حجزك بنجاح (#DZ-8492)',
      body: 'حجزك في قاعة الأفق - الوادي مؤكد في الموعد المحدد.',
      timeAgo: 'أمس',
      isOffer: false,
      isRead: true,
    ),
  ];

  List<NotificationModel> _notifications = [];

  NotificationsController() {
    fetchNotifications();
  }

  List<NotificationModel> get notifications => _notifications;

  int get unreadCount => _notifications.where((n) => !n.isRead).length;

  Future<void> fetchNotifications() async {
    try {
      final response = await _api.get(ApiConfig.notifications);
      if (response != null && (response['notifications'] != null || response['data'] != null)) {
        final List list = (response['notifications'] ?? response['data']) as List;
        _notifications = list.map((n) => NotificationModel.fromJson(n)).toList();
        notifyListeners();
      }
    } catch (_) {
      if (_notifications.isEmpty) {
        _notifications = List.from(_defaultFallbackNotifications);
        notifyListeners();
      }
    }
  }

  Future<void> markAsRead(String id) async {
    final idx = _notifications.indexWhere((n) => n.id == id);
    if (idx != -1 && !_notifications[idx].isRead) {
      _notifications[idx].isRead = true;
      notifyListeners();
      try {
        await _api.put(ApiConfig.markNotificationsRead, {'id': id});
      } catch (_) {}
    }
  }

  Future<void> markAllAsRead() async {
    for (var n in _notifications) {
      n.isRead = true;
    }
    notifyListeners();

    try {
      await _api.put(ApiConfig.markNotificationsRead, {});
    } catch (_) {}
  }
}
