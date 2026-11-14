class NotificationModel {
  final String id;
  final String title;
  final String body;
  final String timeAgo;
  final bool isOffer;
  bool isRead;

  NotificationModel({
    required this.id,
    required this.title,
    required this.body,
    required this.timeAgo,
    this.isOffer = false,
    this.isRead = false,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['_id'] ?? json['id'] ?? '',
      title: json['title'] ?? '',
      body: json['body'] ?? '',
      timeAgo: json['createdAt'] != null
          ? _formatDate(json['createdAt'])
          : (json['timeAgo'] ?? 'الآن'),
      isOffer: json['isOffer'] ?? false,
      isRead: json['isRead'] ?? false,
    );
  }

  static String _formatDate(String isoString) {
    try {
      final date = DateTime.parse(isoString);
      final diff = DateTime.now().difference(date);
      if (diff.inMinutes < 60) {
        return 'منذ ${diff.inMinutes} دقيقة';
      } else if (diff.inHours < 24) {
        return 'منذ ${diff.inHours} ساعة';
      } else {
        return 'منذ ${diff.inDays} يوم';
      }
    } catch (_) {
      return 'مؤخراً';
    }
  }
}
