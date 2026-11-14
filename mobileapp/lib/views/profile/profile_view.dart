import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../controllers/auth_controller.dart';
import '../../controllers/booking_controller.dart';
import '../../controllers/favorites_controller.dart';
import '../../controllers/home_controller.dart';
import '../../controllers/navigation_controller.dart';
import '../../controllers/notifications_controller.dart';
import '../../core/constants/app_assets.dart';
import '../auth/login_view.dart';
import '../auth/register_view.dart';

class ProfileView extends StatelessWidget {
  const ProfileView({super.key});

  void _showEditProfileDialog(BuildContext context, AuthController authCtrl) {
    final user = authCtrl.user;
    if (user == null) {
      Navigator.push(context, MaterialPageRoute(builder: (_) => const LoginView()));
      return;
    }

    final nameCtrl = TextEditingController(text: user.name);
    final phoneCtrl = TextEditingController(text: user.phone);
    String selectedCity = user.city;

    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('تعديل الملف الشخصي', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameCtrl,
              decoration: const InputDecoration(labelText: 'الاسم الكامل'),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: phoneCtrl,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(labelText: 'رقم الهاتف'),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('إلغاء'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0D6EFD)),
            onPressed: () async {
              await authCtrl.updateProfile(
                name: nameCtrl.text.trim(),
                phone: phoneCtrl.text.trim(),
                city: selectedCity,
              );
              if (context.mounted) Navigator.pop(context);
            },
            child: const Text('حفظ التعديلات'),
          ),
        ],
      ),
    );
  }

  void _showSupportDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('الدعم الفني وخدمة العملاء', style: TextStyle(fontWeight: FontWeight.bold)),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('نحن هنا لخدمتكم على مدار 24 ساعة في جميع الولايات:'),
            SizedBox(height: 12),
            Text('📞 الهاتف: 0661234567', style: TextStyle(fontWeight: FontWeight.bold)),
            SizedBox(height: 6),
            Text('✉️ البريد: support@dzly.com', style: TextStyle(fontWeight: FontWeight.bold)),
            SizedBox(height: 6),
            Text('📍 المقر: الجزائر العاصمة والوادي'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('إغلاق'),
          ),
        ],
      ),
    );
  }

  void _showProviderAdDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('أعلن عن مشروعك معنا', style: TextStyle(fontWeight: FontWeight.bold)),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('هل تملك قاعة أفراح، مزرعة، مسبح، أسطول سيارات، أو صالون تجميل؟'),
            SizedBox(height: 10),
            Text('سجل كشريك خدمة في احجزلي Dz واحصل على لوحة تحكم ذكية لإدارة حجوزاتك وزيادة أرباحك بمعدل 300%.'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('لاحقاً'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0D6EFD)),
            onPressed: () {
              Navigator.pop(context);
              Navigator.push(context, MaterialPageRoute(builder: (_) => const RegisterView()));
            },
            child: const Text('انضم كمزود خدمة'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authCtrl = context.watch<AuthController>();
    final homeCtrl = context.watch<HomeController>();
    final bookingCtrl = context.watch<BookingController>();
    final favCtrl = context.watch<FavoritesController>();
    final notifCtrl = context.watch<NotificationsController>();
    final navCtrl = context.read<NavigationController>();

    final user = authCtrl.user;
    final isLoggedIn = authCtrl.isAuthenticated;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        child: Column(
          children: [
            // الهيدر العلوي العصري للملف الشخصي
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(16, 52, 16, 24),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Color(0xFF0D6EFD),
                    Color(0xFF0B192C),
                  ],
                ),
                borderRadius: BorderRadius.vertical(bottom: Radius.circular(28)),
              ),
              child: Column(
                children: [
                  Stack(
                    alignment: Alignment.bottomRight,
                    children: [
                      Container(
                        width: 82,
                        height: 82,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 3),
                          color: Colors.white,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.2),
                              blurRadius: 10,
                            ),
                          ],
                        ),
                        child: ClipOval(
                          child: Image.asset(
                            AppAssets.appLogo,
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),
                      if (isLoggedIn)
                        Container(
                          padding: const EdgeInsets.all(4),
                          decoration: const BoxDecoration(
                            color: Color(0xFF10B981),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.check, color: Colors.white, size: 14),
                        ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    isLoggedIn ? user!.name : 'زائر كريم',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    isLoggedIn
                        ? 'ولاية ${user!.city} • ${user.phone}'
                        : 'سجل دخولك لتتمكن من حجز الخدمات ومتابعة طلباتك',
                    style: const TextStyle(color: Colors.white70, fontSize: 12.5),
                  ),
                  const SizedBox(height: 18),
                  // شريط الإحصائيات السريعة
                  Container(
                    padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _buildStatItem('الحجوزات', '${bookingCtrl.allBookings.length}', () => navCtrl.setIndex(1)),
                        Container(width: 1, height: 28, color: Colors.white24),
                        _buildStatItem('المفضلة', '${favCtrl.favoriteIds.length}', () => navCtrl.setIndex(2)),
                        Container(width: 1, height: 28, color: Colors.white24),
                        _buildStatItem('الإشعارات', '${notifCtrl.notifications.length}', () => navCtrl.setIndex(3)),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // قائمة الخيارات والإعدادات
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                children: [
                  if (!isLoggedIn)
                    Container(
                      margin: const EdgeInsets.only(bottom: 14),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF0D6EFD), Color(0xFF1E40AF)],
                        ),
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF0D6EFD).withOpacity(0.3),
                            blurRadius: 8,
                            offset: const Offset(0, 3),
                          ),
                        ],
                      ),
                      child: ListTile(
                        leading: const Icon(Icons.login_rounded, color: Colors.white, size: 26),
                        title: const Text(
                          'تسجيل الدخول / إنشاء حساب',
                          style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                        subtitle: const Text(
                          'ابدأ تجربة الحجز الكاملة الآن',
                          style: TextStyle(color: Colors.white70, fontSize: 11.5),
                        ),
                        trailing: const Icon(Icons.arrow_forward_ios_rounded, color: Colors.white, size: 16),
                        onTap: () {
                          Navigator.push(context, MaterialPageRoute(builder: (_) => const LoginView()));
                        },
                      ),
                    ),

                  _buildSettingsGroup([
                    _buildSettingsTile(
                      icon: Icons.person_outline_rounded,
                      title: 'تعديل الملف الشخصي',
                      subtitle: 'تحديث الاسم ورقم الهاتف والمدينة',
                      onTap: () => _showEditProfileDialog(context, authCtrl),
                    ),
                    _buildSettingsTile(
                      icon: Icons.location_city_rounded,
                      title: 'المدينة المختارة حالياً',
                      subtitle: homeCtrl.selectedCity,
                      onTap: () {},
                    ),
                  ]),

                  const SizedBox(height: 12),

                  _buildSettingsGroup([
                    _buildSettingsTile(
                      icon: Icons.campaign_rounded,
                      title: 'أعلن عن مشروعك معنا',
                      subtitle: 'انضم كشريك خدمة وزد أرباحك',
                      iconColor: const Color(0xFFF59E0B),
                      onTap: () => _showProviderAdDialog(context),
                    ),
                    _buildSettingsTile(
                      icon: Icons.support_agent_rounded,
                      title: 'الدعم الفني وخدمة العملاء',
                      subtitle: 'متاحون على مدار الساعة 24/7',
                      iconColor: const Color(0xFF0D6EFD),
                      onTap: () => _showSupportDialog(context),
                    ),
                  ]),

                  const SizedBox(height: 12),

                  if (isLoggedIn)
                    _buildSettingsGroup([
                      _buildSettingsTile(
                        icon: Icons.logout_rounded,
                        title: 'تسجيل الخروج',
                        subtitle: 'الخروج من الحساب الحالي',
                        iconColor: const Color(0xFFEF4444),
                        isDestructive: true,
                        onTap: () async {
                          await authCtrl.logout();
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('تم تسجيل الخروج بنجاح')),
                            );
                          }
                        },
                      ),
                    ]),

                  const SizedBox(height: 24),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(String label, String value, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: const TextStyle(
              color: Colors.white70,
              fontSize: 11.5,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSettingsGroup(List<Widget> children) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: children,
      ),
    );
  }

  Widget _buildSettingsTile({
    required IconData icon,
    required String title,
    required String subtitle,
    Color iconColor = const Color(0xFF0D6EFD),
    bool isDestructive = false,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Container(
        width: 38,
        height: 38,
        decoration: BoxDecoration(
          color: iconColor.withOpacity(0.1),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: iconColor, size: 20),
      ),
      title: Text(
        title,
        style: TextStyle(
          fontWeight: FontWeight.bold,
          fontSize: 14,
          color: isDestructive ? const Color(0xFFEF4444) : const Color(0xFF0F172A),
        ),
      ),
      subtitle: Text(
        subtitle,
        style: const TextStyle(
          color: Color(0xFF64748B),
          fontSize: 11.5,
        ),
      ),
      trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: Color(0xFFCBD5E1)),
      onTap: onTap,
    );
  }
}
