import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../controllers/notifications_controller.dart';
import '../../core/theme/app_colors.dart';

class NotificationsView extends StatelessWidget {
  const NotificationsView({super.key});

  @override
  Widget build(BuildContext context) {
    final notifCtrl = context.watch<NotificationsController>();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0D6EFD),
        elevation: 0,
        centerTitle: true,
        title: const Text(
          'الإشعارات',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
        actions: [
          if (notifCtrl.unreadCount > 0)
            TextButton(
              onPressed: notifCtrl.markAllAsRead,
              child: const Text(
                'تحديد كـ مقروء',
                style: TextStyle(
                  color: AppColors.accentYellow,
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                ),
              ),
            ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => notifCtrl.fetchNotifications(),
        child: notifCtrl.notifications.isEmpty
            ? Center(
                child: ListView(
                  shrinkWrap: true,
                  physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
                  children: [
                    Icon(Icons.notifications_off_outlined, size: 72, color: Colors.grey.shade300),
                    const SizedBox(height: 14),
                    const Text(
                      'لا توجد إشعارات جديدة حالياً',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF64748B),
                      ),
                    ),
                  ],
                ),
              )
            : ListView.builder(
                physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
              padding: const EdgeInsets.all(16),
              itemCount: notifCtrl.notifications.length,
              itemBuilder: (context, index) {
                final n = notifCtrl.notifications[index];
                return GestureDetector(
                  onTap: () => notifCtrl.markAsRead(n.id),
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: n.isRead ? Colors.white : const Color(0xFFF0F7FF),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: n.isRead ? Colors.transparent : const Color(0xFFBFDBFE),
                        width: 1,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.03),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: n.isOffer
                                ? const Color(0xFF0D6EFD).withOpacity(0.12)
                                : const Color(0xFF10B981).withOpacity(0.12),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            n.isOffer ? Icons.local_offer_rounded : Icons.check_circle_rounded,
                            color: n.isOffer ? const Color(0xFF0D6EFD) : const Color(0xFF10B981),
                            size: 22,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(
                                      n.title,
                                      style: TextStyle(
                                        fontWeight: n.isRead ? FontWeight.bold : FontWeight.w900,
                                        fontSize: 14.5,
                                        color: const Color(0xFF0F172A),
                                      ),
                                    ),
                                  ),
                                  if (!n.isRead)
                                    Container(
                                      width: 8,
                                      height: 8,
                                      decoration: const BoxDecoration(
                                        color: Color(0xFF0D6EFD),
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                n.body,
                                style: const TextStyle(
                                  color: Color(0xFF475569),
                                  fontSize: 12.5,
                                  height: 1.4,
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                n.timeAgo,
                                style: const TextStyle(
                                  color: Color(0xFF94A3B8),
                                  fontSize: 11,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
      ),
    );
  }
}
