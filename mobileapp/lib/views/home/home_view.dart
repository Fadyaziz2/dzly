import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../controllers/home_controller.dart';
import '../../controllers/navigation_controller.dart';
import '../../controllers/notifications_controller.dart';
import '../../core/constants/app_assets.dart';
import '../../core/theme/app_colors.dart';
import '../../widgets/category_card.dart';
import '../../widgets/offer_card.dart';
import '../auth/register_view.dart';
import '../category/category_view.dart';
import '../service_details/service_details_view.dart';

class HomeView extends StatelessWidget {
  const HomeView({super.key});

  void _showCityPicker(BuildContext context, HomeController homeCtrl) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) {
        return Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'اختر ولايتك / مدينتك',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              ...homeCtrl.availableCities.map(
                (city) => ListTile(
                  leading: const Icon(Icons.location_on, color: AppColors.primaryBlue),
                  title: Text(city, style: const TextStyle(fontWeight: FontWeight.bold)),
                  trailing: homeCtrl.selectedCity == city
                      ? const Icon(Icons.check_circle, color: AppColors.primaryBlue)
                      : null,
                  onTap: () {
                    homeCtrl.changeCity(city);
                    Navigator.pop(context);
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final homeCtrl = context.watch<HomeController>();
    final navCtrl = context.read<NavigationController>();
    final unreadCount = context.watch<NotificationsController>().unreadCount;

    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. الهيدر العلوي المتطابق بالكامل مع التصميم المرفق
          Stack(
            children: [
              // صورة مدينة الوادي بالصحراء والمئذنة في الخلفية
              ClipRRect(
                borderRadius: const BorderRadius.vertical(bottom: Radius.circular(28)),
                child: Image.asset(
                  AppAssets.headerBg,
                  height: 250,
                  width: double.infinity,
                  fit: BoxFit.cover,
                ),
              ),
              // تدرج لوني أزرق احترافي للحفاظ على تباين النصوص وتطابق الصورة
              Container(
                height: 250,
                padding: const EdgeInsets.fromLTRB(16, 44, 16, 16),
                decoration: BoxDecoration(
                  borderRadius: const BorderRadius.vertical(bottom: Radius.circular(28)),
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      const Color(0xFF0D47A1).withOpacity(0.85),
                      const Color(0xFF1565C0).withOpacity(0.60),
                      Colors.transparent,
                    ],
                  ),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // الصف العلوي: الموقع، الشعار، الإشعارات والقائمة
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // محدد المدينة (الوادي)
                        GestureDetector(
                          onTap: () => _showCityPicker(context, homeCtrl),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                width: 34,
                                height: 34,
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.9),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(
                                  Icons.location_on,
                                  color: Color(0xFF0D6EFD),
                                  size: 20,
                                ),
                              ),
                              const SizedBox(width: 6),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Text(
                                        homeCtrl.selectedCity,
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 15,
                                        ),
                                      ),
                                      const Icon(
                                        Icons.keyboard_arrow_down,
                                        color: Colors.white,
                                        size: 18,
                                      ),
                                    ],
                                  ),
                                  const Text(
                                    'حدد مدينتك',
                                    style: TextStyle(
                                      color: Colors.white70,
                                      fontSize: 10,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),

                        // شعار "احجزلي Dz" بالمركز
                        Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            // أيقونة التقويم والموقع
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(4),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: const Icon(
                                    Icons.calendar_month_rounded,
                                    color: Color(0xFF0D6EFD),
                                    size: 20,
                                  ),
                                ),
                                const SizedBox(width: 4),
                                const Icon(
                                  Icons.location_on,
                                  color: AppColors.accentYellow,
                                  size: 22,
                                ),
                              ],
                            ),
                            const SizedBox(height: 2),
                            // عنوان الشعار
                            const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  'احجزلي',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 24,
                                    fontWeight: FontWeight.w900,
                                    letterSpacing: -0.5,
                                  ),
                                ),
                                SizedBox(width: 4),
                                Text(
                                  'Dz',
                                  style: TextStyle(
                                    color: AppColors.accentYellow,
                                    fontSize: 20,
                                    fontWeight: FontWeight.w900,
                                  ),
                                ),
                              ],
                            ),
                            const Text(
                              'كل خدماتك في مكان واحد',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 10.5,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),

                        // أيقونة الإشعارات والقائمة
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            // جرس الإشعارات بنقطة حمراء
                            GestureDetector(
                              onTap: () => navCtrl.setIndex(3),
                              child: Stack(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(6),
                                    child: const Icon(
                                      Icons.notifications_none_rounded,
                                      color: Colors.white,
                                      size: 26,
                                    ),
                                  ),
                                  if (unreadCount > 0)
                                    Positioned(
                                      top: 4,
                                      right: 6,
                                      child: Container(
                                        width: 9,
                                        height: 9,
                                        decoration: const BoxDecoration(
                                          color: Colors.redAccent,
                                          shape: BoxShape.circle,
                                        ),
                                      ),
                                    ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 4),
                            // أيقونة القائمة
                            GestureDetector(
                              onTap: () => navCtrl.setIndex(4),
                              child: Container(
                                padding: const EdgeInsets.all(6),
                                child: const Icon(
                                  Icons.menu_rounded,
                                  color: Colors.white,
                                  size: 26,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),

                    // شريط البحث الدائري (Capsule Pill)
                    Container(
                      height: 48,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(28),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.12),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.search,
                            color: Color(0xFF0F172A),
                            size: 22,
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: TextField(
                              onChanged: homeCtrl.updateSearchQuery,
                              style: const TextStyle(fontSize: 13),
                              decoration: const InputDecoration(
                                hintText: 'ابحث عن خدمة أو نشاط ...',
                                hintStyle: TextStyle(
                                  color: Color(0xFF94A3B8),
                                  fontSize: 13,
                                ),
                                border: InputBorder.none,
                                isDense: true,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // 2. شريط الفئات السريع الدائري المطابق تماماً
          SizedBox(
            height: 72,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 14),
              children: [
                _buildQuickChip(
                  title: 'كل الفئات',
                  icon: Icons.tune_rounded,
                  isSelected: homeCtrl.selectedQuickFilterId == null,
                  onTap: () => homeCtrl.toggleQuickFilter(null),
                ),
                _buildQuickChip(
                  title: 'أفراح',
                  icon: Icons.celebration_rounded,
                  isSelected: homeCtrl.selectedQuickFilterId == 'weddings',
                  onTap: () => homeCtrl.toggleQuickFilter('weddings'),
                ),
                _buildQuickChip(
                  title: 'مزارع',
                  icon: Icons.eco_rounded,
                  isSelected: homeCtrl.selectedQuickFilterId == 'farms',
                  onTap: () => homeCtrl.toggleQuickFilter('farms'),
                ),
                _buildQuickChip(
                  title: 'تجميل',
                  icon: Icons.face_retouching_natural,
                  isSelected: homeCtrl.selectedQuickFilterId == 'beauty',
                  onTap: () => homeCtrl.toggleQuickFilter('beauty'),
                ),
                _buildQuickChip(
                  title: 'كراء سيارات',
                  icon: Icons.directions_car_rounded,
                  isSelected: homeCtrl.selectedQuickFilterId == 'cars',
                  onTap: () => homeCtrl.toggleQuickFilter('cars'),
                ),
                _buildQuickChip(
                  title: 'كراء منازل',
                  icon: Icons.home_work_rounded,
                  isSelected: homeCtrl.selectedQuickFilterId == 'houses',
                  onTap: () => homeCtrl.toggleQuickFilter('houses'),
                ),
              ],
            ),
          ),

          const SizedBox(height: 14),

          // 3. قسم أهم التصنيفات (شبكة 4 أعمدة في صفين = 8 أقسام)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Icon(
                      Icons.grid_view_rounded,
                      color: Color(0xFF0F172A),
                      size: 20,
                    ),
                    SizedBox(width: 6),
                    Text(
                      'أهم التصنيفات',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF0F172A),
                      ),
                    ),
                  ],
                ),
                GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => const CategoryView(
                          categoryId: null,
                          title: 'جميع الأقسام والخدمات',
                          themeColor: AppColors.primaryBlue,
                        ),
                      ),
                    );
                  },
                  child: const Text(
                    'عرض الكل >',
                    style: TextStyle(
                      color: Color(0xFF0D6EFD),
                      fontSize: 12.5,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 10),

          // شبكة الـ 8 أقسام بأعلى دقة مطابقة للصورة (4 أعمدة)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14),
            child: GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: homeCtrl.categories.length,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 4,
                childAspectRatio: 0.67,
                crossAxisSpacing: 8,
                mainAxisSpacing: 10,
              ),
              itemBuilder: (context, index) {
                final cat = homeCtrl.categories[index];
                return CategoryCard(
                  category: cat,
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => CategoryView(
                          categoryId: cat.id,
                          title: cat.title,
                          themeColor: cat.color,
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),

          const SizedBox(height: 16),

          // 4. بانر أعلن عن مشروعك المطابق للصورة
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 14),
            height: 125,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              image: const DecorationImage(
                image: AssetImage(AppAssets.adBanner),
                fit: BoxFit.cover,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.12),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                gradient: LinearGradient(
                  colors: [
                    const Color(0xFF0B192C).withOpacity(0.92),
                    const Color(0xFF1E3E62).withOpacity(0.70),
                  ],
                ),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text(
                          'أعلن عن مشروعك',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 17,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 3),
                        const Text(
                          'معنا يصل إعلانك إلى آلاف المستخدمين',
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 11,
                          ),
                        ),
                        const SizedBox(height: 8),
                        SizedBox(
                          height: 32,
                          child: ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFFACC15),
                              foregroundColor: const Color(0xFF0F172A),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(20),
                              ),
                              padding: const EdgeInsets.symmetric(horizontal: 14),
                              elevation: 2,
                            ),
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => const RegisterView(),
                                ),
                              );
                            },
                            icon: const Icon(Icons.campaign_rounded, size: 16),
                            label: const Text(
                              'تواصل معنا',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 11.5,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Text(
                      'AD',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 9.5,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 18),

          // 5. قسم عروض وخصومات
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(
                        color: Color(0xFF0F172A),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.percent_rounded,
                        color: Colors.white,
                        size: 14,
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      'عروض وخصومات',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF0F172A),
                      ),
                    ),
                  ],
                ),
                GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => const CategoryView(
                          categoryId: null,
                          title: 'عروض وخصومات حصرية',
                          themeColor: AppColors.weddingsRed,
                          onlyOffers: true,
                        ),
                      ),
                    );
                  },
                  child: const Text(
                    'عرض الكل >',
                    style: TextStyle(
                      color: Color(0xFF0D6EFD),
                      fontSize: 12.5,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 10),

          // قائمة الكروت الأفقية للعروض
          SizedBox(
            height: 200,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 14),
              itemCount: homeCtrl.discountedOffers.length,
              itemBuilder: (context, index) {
                final offer = homeCtrl.discountedOffers[index];
                return OfferCard(
                  service: offer,
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => ServiceDetailsView(service: offer),
                      ),
                    );
                  },
                );
              },
            ),
          ),

          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildQuickChip({
    required String title,
    required IconData icon,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 78,
        margin: const EdgeInsets.only(left: 8),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF0D6EFD) : Colors.white,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              color: isSelected ? Colors.white : const Color(0xFF1E293B),
              size: 22,
            ),
            const SizedBox(height: 5),
            Text(
              title,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: isSelected ? Colors.white : const Color(0xFF1E293B),
                fontSize: 10.5,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
