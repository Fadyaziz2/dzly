import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../controllers/home_controller.dart';
import '../../controllers/navigation_controller.dart';
import '../../controllers/notifications_controller.dart';
import '../../core/config/api_config.dart';
import '../../core/constants/app_assets.dart';
import '../../core/theme/app_colors.dart';
import '../../widgets/category_card.dart';
import '../../widgets/offer_card.dart';
import '../auth/register_view.dart';
import '../category/category_view.dart';
import '../pharmacy/pharmacy_search_view.dart';
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
          // 1. الهيدر العلوي المتطابق بالكامل مع التصميم المرجعي
          Stack(
            children: [
              // صورة مدينة الوادي بالغروب الدافئ (ديناميكية من الداش بورد أو الأصول كاحتياطي)
              ClipRRect(
                borderRadius: const BorderRadius.vertical(bottom: Radius.circular(28)),
                child: homeCtrl.headerBannerUrl.isNotEmpty
                    ? Image.network(
                        ApiConfig.resolveUrl(homeCtrl.headerBannerUrl),
                        height: 250,
                        width: double.infinity,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) => Image.asset(
                          AppAssets.headerElOued,
                          height: 250,
                          width: double.infinity,
                          fit: BoxFit.cover,
                        ),
                      )
                    : Image.asset(
                        AppAssets.headerElOued,
                        height: 250,
                        width: double.infinity,
                        fit: BoxFit.cover,
                      ),
              ),
              // طبقة تدرج لوني أزرق (#0A66C2) من الأعلى تتلاشى لشفاف في الأسفل
              Container(
                height: 250,
                padding: const EdgeInsets.fromLTRB(16, 44, 16, 16),
                decoration: BoxDecoration(
                  borderRadius: const BorderRadius.vertical(bottom: Radius.circular(28)),
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      AppColors.primaryBlue.withOpacity(0.88),
                      AppColors.primaryBlue.withOpacity(0.55),
                      Colors.transparent,
                    ],
                  ),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // الصف العلوي: يمين الهيدر القائمة والجرس، المنتصف الشعار، يسار الهيدر محدد المدينة
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // يمين الهيدر: أيقونة القائمة الجانبية (≡) وأيقونة الجرس بنقطة حمراء
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
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
                            const SizedBox(width: 4),
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
                          ],
                        ),

                        // منتصف الهيدر: شعار التطبيق (تقويم + موقع أصفر وأبيض، احجزلي Dz، كل خدماتك في مكان واحد)
                        Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
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
                                    color: AppColors.primaryBlue,
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

                        // يسار الهيدر: دائرة بيضاء بداخلها دبوس موقع أزرق وبجانبها "الوادي ⌄" وتحتها "حدد مدينتك"
                        GestureDetector(
                          onTap: () => _showCityPicker(context, homeCtrl),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                width: 34,
                                height: 34,
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.95),
                                  shape: BoxShape.circle,
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.1),
                                      blurRadius: 4,
                                    ),
                                  ],
                                ),
                                child: const Icon(
                                  Icons.location_on,
                                  color: AppColors.primaryBlue,
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
                      ],
                    ),

                    // أسفل الهيدر: شريط بحث أبيض دائري الحواف (BorderRadius.circular(30))
                    Container(
                      height: 48,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(30),
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
                            color: AppColors.textDark,
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

          // 2. شريط الفئات السريع (Quick Filter Chips)
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
                _buildQuickChip(
                  title: 'صيدليات 💊',
                  icon: Icons.local_pharmacy_rounded,
                  isSelected: homeCtrl.selectedQuickFilterId == 'pharmacy',
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const PharmacySearchView()),
                    );
                  },
                ),
              ],
            ),
          ),

          const SizedBox(height: 14),

          // 3. قسم "أهم التصنيفات" (شبكة 4 أعمدة × صفين = 8 كروت)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Icon(
                      Icons.grid_view_rounded,
                      color: AppColors.textDark,
                      size: 20,
                    ),
                    SizedBox(width: 6),
                    Text(
                      'أهم التصنيفات',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textDark,
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
                    'عرض الكل <',
                    style: TextStyle(
                      color: AppColors.primaryBlue,
                      fontSize: 12.5,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 10),

          // شبكة الـ 8 تصنيفات (4 أعمدة × صفين)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14),
            child: GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: homeCtrl.categories.length,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 4,
                childAspectRatio: 0.63,
                crossAxisSpacing: 8,
                mainAxisSpacing: 10,
              ),
              itemBuilder: (context, index) {
                final cat = homeCtrl.categories[index];
                return CategoryCard(
                  category: cat,
                  onTap: () {
                    if (cat.id == 'pharmacy') {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const PharmacySearchView(),
                        ),
                      );
                    } else {
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
                    }
                  },
                );
              },
            ),
          ),

          const SizedBox(height: 16),

          // 4. بانر "أعلن عن مشروعك" (ديناميكي من الداش بورد أو من أصول التطبيق كاحتياطي)
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 14),
            height: 125,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              image: DecorationImage(
                image: homeCtrl.homeAdBannerUrl.isNotEmpty
                    ? NetworkImage(ApiConfig.resolveUrl(homeCtrl.homeAdBannerUrl)) as ImageProvider
                    : const AssetImage(AppAssets.adBannerBg),
                fit: BoxFit.cover,
                onError: (exception, stackTrace) {
                  // Fallback safely handled
                },
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
                    AppColors.darkNavy.withOpacity(0.92),
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
                        Text(
                          homeCtrl.homeAdBannerTitle,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 17,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          homeCtrl.homeAdBannerSubtitle,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: Colors.white70,
                            fontSize: 11,
                          ),
                        ),
                        const SizedBox(height: 8),
                        SizedBox(
                          height: 32,
                          child: ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.accentYellow,
                              foregroundColor: AppColors.textDark,
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
                            label: Text(
                              homeCtrl.homeAdBannerActionText,
                              style: const TextStyle(
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

          // 5. قسم "عروض وخصومات" (4 كروت أفقية)
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
                        color: AppColors.textDark,
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
                        color: AppColors.textDark,
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
                    'عرض الكل <',
                    style: TextStyle(
                      color: AppColors.primaryBlue,
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
            height: 215,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 14),
              itemCount: homeCtrl.discountedOffers.length,
              itemBuilder: (context, index) {
                final offer = homeCtrl.discountedOffers[index];
                return OfferCard(
                  service: offer,
                  onTap: () {
                    if (offer.categoryId == 'pharmacy') {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const PharmacySearchView(),
                        ),
                      );
                    } else {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => ServiceDetailsView(service: offer),
                        ),
                      );
                    }
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
          color: isSelected ? AppColors.primaryBlue : const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            if (isSelected)
              BoxShadow(
                color: AppColors.primaryBlue.withOpacity(0.3),
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
              color: isSelected ? Colors.white : AppColors.textDark,
              size: 22,
            ),
            const SizedBox(height: 5),
            Text(
              title,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: isSelected ? Colors.white : AppColors.textDark,
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
