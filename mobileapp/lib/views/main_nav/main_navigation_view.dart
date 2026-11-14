import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../controllers/home_controller.dart';
import '../../controllers/navigation_controller.dart';
import '../../controllers/notifications_controller.dart';
import '../home/home_view.dart';
import '../bookings_history/bookings_history_view.dart';
import '../favorites/favorites_view.dart';
import '../notifications/notifications_view.dart';
import '../profile/profile_view.dart';

class MainNavigationView extends StatelessWidget {
  const MainNavigationView({super.key});

  final List<Widget> _screens = const [
    HomeView(),
    BookingsHistoryView(),
    FavoritesView(),
    NotificationsView(),
    ProfileView(),
  ];

  @override
  Widget build(BuildContext context) {
    final navCtrl = context.watch<NavigationController>();
    final unreadCount = context.watch<NotificationsController>().unreadCount;

    return Scaffold(
      body: IndexedStack(
        index: navCtrl.currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        height: 72,
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.06),
              blurRadius: 10,
              offset: const Offset(0, -3),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildNavItem(
              index: 0,
              icon: Icons.home_rounded,
              label: 'الرئيسية',
              isSelected: navCtrl.currentIndex == 0,
              onTap: () {
                if (navCtrl.currentIndex == 0) {
                  context.read<HomeController>().loadData();
                }
                navCtrl.setIndex(0);
              },
            ),
            _buildNavItem(
              index: 1,
              icon: Icons.calendar_month_outlined,
              label: 'الحجوزات',
              isSelected: navCtrl.currentIndex == 1,
              onTap: () => navCtrl.setIndex(1),
            ),
            _buildNavItem(
              index: 2,
              icon: Icons.favorite_border_rounded,
              label: 'المفضلة',
              isSelected: navCtrl.currentIndex == 2,
              onTap: () => navCtrl.setIndex(2),
            ),
            _buildNavItem(
              index: 3,
              icon: Icons.chat_bubble_outline_rounded,
              label: 'الإشعارات',
              hasBadge: unreadCount > 0,
              isSelected: navCtrl.currentIndex == 3,
              onTap: () => navCtrl.setIndex(3),
            ),
            _buildNavItem(
              index: 4,
              icon: Icons.person_outline_rounded,
              label: 'حسابي',
              isSelected: navCtrl.currentIndex == 4,
              onTap: () => navCtrl.setIndex(4),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required int index,
    required IconData icon,
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
    bool hasBadge = false,
  }) {
    final color = isSelected ? const Color(0xFF0D6EFD) : const Color(0xFF64748B);

    return InkWell(
      onTap: onTap,
      splashColor: Colors.transparent,
      highlightColor: Colors.transparent,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Stack(
            clipBehavior: Clip.none,
            children: [
              Icon(icon, color: color, size: 24),
              if (hasBadge)
                Positioned(
                  top: -2,
                  right: -3,
                  child: Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: Colors.redAccent,
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              color: color,
              fontSize: 11,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
            ),
          ),
          const SizedBox(height: 3),
          // الخط الأزرق السفلي عند التحديد المطابق للتصميم
          Container(
            height: 3,
            width: isSelected ? 22 : 0,
            decoration: BoxDecoration(
              color: const Color(0xFF0D6EFD),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
        ],
      ),
    );
  }
}
