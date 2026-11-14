import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../controllers/favorites_controller.dart';
import '../../core/config/api_config.dart';
import '../../models/service_model.dart';
import '../booking/booking_view.dart';

class ServiceDetailsView extends StatelessWidget {
  final ServiceModel service;

  const ServiceDetailsView({super.key, required this.service});

  @override
  Widget build(BuildContext context) {
    final favCtrl = context.watch<FavoritesController>();
    final isFav = favCtrl.isFavorite(service.id);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          // 1. هيرو إيميج كامل مع أزرار الإجراءات العائمة
          SliverAppBar(
            expandedHeight: 280,
            pinned: true,
            backgroundColor: service.accentColor,
            elevation: 0,
            leading: Padding(
              padding: const EdgeInsets.all(8.0),
              child: CircleAvatar(
                backgroundColor: Colors.black.withOpacity(0.4),
                child: IconButton(
                  icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 18),
                  onPressed: () => Navigator.pop(context),
                ),
              ),
            ),
            actions: [
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: CircleAvatar(
                  backgroundColor: Colors.black.withOpacity(0.4),
                  child: IconButton(
                    icon: Icon(
                      isFav ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                      color: isFav ? Colors.redAccent : Colors.white,
                      size: 20,
                    ),
                    onPressed: () => favCtrl.toggleFavorite(service.id),
                  ),
                ),
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  service.imageUrl.isNotEmpty
                      ? Image.network(
                          ApiConfig.resolveUrl(service.imageUrl),
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Image.asset(
                            service.imageAsset,
                            fit: BoxFit.cover,
                          ),
                        )
                      : Image.asset(
                          service.imageAsset,
                          fit: BoxFit.cover,
                        ),
                  // تدرج لوني لتسهيل قراءة الأزرار
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.black.withOpacity(0.4),
                          Colors.transparent,
                          Colors.black.withOpacity(0.7),
                        ],
                      ),
                    ),
                  ),
                  // شارة الخصم وموقع الخدمة أسفل الصورة
                  Positioned(
                    bottom: 16,
                    right: 16,
                    left: 16,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        if (service.discountPercent > 0)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: service.accentColor,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              'خصم خاص -${service.discountPercent}%',
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                              ),
                            ),
                          )
                        else
                          const SizedBox(),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.6),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.star, color: Color(0xFFFACC15), size: 16),
                              const SizedBox(width: 4),
                              Text(
                                '${service.rating} (${service.reviewsCount} تقييم)',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
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
            ),
          ),

          // 2. المحتوى والتفاصيل الكاملة
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // بطاقة العنوان والموقع
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.04),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          service.title,
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF0F172A),
                          ),
                        ),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            const Icon(Icons.location_on, color: Color(0xFF0D6EFD), size: 18),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                service.address,
                                style: const TextStyle(
                                  color: Color(0xFF64748B),
                                  fontSize: 13,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // كروت الضمانات والمزايا السريعة
                  Row(
                    children: [
                      Expanded(
                        child: _buildGuaranteeCard(
                          icon: Icons.verified_user_rounded,
                          title: 'حجز موثوق',
                          subtitle: 'ضمان تأكيد 100%',
                          color: const Color(0xFF10B981),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _buildGuaranteeCard(
                          icon: Icons.support_agent_rounded,
                          title: 'دعم مباشر',
                          subtitle: 'خدمة 24/7',
                          color: const Color(0xFF0D6EFD),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _buildGuaranteeCard(
                          icon: Icons.cancel_outlined,
                          title: 'إلغاء مرن',
                          subtitle: 'حسب الشروط',
                          color: const Color(0xFFF59E0B),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  // تفاصيل الوصف
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.04),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'عن الخدمة والمكان',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF0F172A),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '${service.subtitle}. يقع هذا النشاط في ولاية ${service.city} وهو مصمم لتقديم أعلى مستويات الجودة والراحة للمستخدمين. احجز الآن عبر منصة احجزلي Dz واستمتع بتجربة حجز مريحة ومضمونة بالكامل.',
                          style: const TextStyle(
                            color: Color(0xFF475569),
                            fontSize: 13.5,
                            height: 1.6,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // الميزات والخدمات المشمولة
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.04),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'المميزات والخدمات المشمولة',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF0F172A),
                          ),
                        ),
                        const SizedBox(height: 12),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: service.features.map((f) {
                            return Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                              decoration: BoxDecoration(
                                color: service.accentColor.withOpacity(0.08),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: service.accentColor.withOpacity(0.2)),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.check_circle_rounded, color: service.accentColor, size: 16),
                                  const SizedBox(width: 6),
                                  Text(
                                    f,
                                    style: TextStyle(
                                      color: service.accentColor,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12,
                                    ),
                                  ),
                                ],
                              ),
                            );
                          }).toList(),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ],
      ),

      // 3. شريط الحجز السفلي الثابت
      bottomNavigationBar: Container(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.08),
              blurRadius: 10,
              offset: const Offset(0, -3),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (service.discountPercent > 0)
                  Text(
                    '${service.price.toStringAsFixed(0)} د.ج',
                    style: const TextStyle(
                      fontSize: 12,
                      decoration: TextDecoration.lineThrough,
                      color: Color(0xFF94A3B8),
                    ),
                  ),
                Row(
                  children: [
                    Text(
                      service.discountedPrice.toStringAsFixed(0),
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: service.accentColor,
                      ),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      service.priceUnit,
                      style: const TextStyle(
                        fontSize: 12,
                        color: Color(0xFF64748B),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            SizedBox(
              height: 48,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0D6EFD),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 32),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                  elevation: 2,
                ),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => BookingView(service: service),
                    ),
                  );
                },
                child: const Text(
                  'احجز الآن',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildGuaranteeCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 22),
          const SizedBox(height: 4),
          Text(
            title,
            style: const TextStyle(
              fontSize: 11.5,
              fontWeight: FontWeight.bold,
              color: Color(0xFF0F172A),
            ),
          ),
          Text(
            subtitle,
            style: const TextStyle(
              fontSize: 9.5,
              color: Color(0xFF64748B),
            ),
          ),
        ],
      ),
    );
  }
}
