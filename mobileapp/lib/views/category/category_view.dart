import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../controllers/favorites_controller.dart';
import '../../controllers/home_controller.dart';
import '../../models/service_model.dart';
import '../booking/booking_view.dart';
import '../service_details/service_details_view.dart';

class CategoryView extends StatefulWidget {
  final String? categoryId;
  final String title;
  final Color themeColor;
  final bool onlyOffers;

  const CategoryView({
    super.key,
    required this.categoryId,
    required this.title,
    required this.themeColor,
    this.onlyOffers = false,
  });

  @override
  State<CategoryView> createState() => _CategoryViewState();
}

class _CategoryViewState extends State<CategoryView> {
  String _localSearch = '';
  String _activeFilter = 'all'; // all, topRated, lowestPrice, offers

  @override
  Widget build(BuildContext context) {
    final homeCtrl = context.watch<HomeController>();
    final favCtrl = context.watch<FavoritesController>();

    var services = widget.categoryId != null
        ? homeCtrl.getServicesByCategory(widget.categoryId!)
        : homeCtrl.allServices;

    if (widget.onlyOffers) {
      services = services.where((s) => s.discountPercent > 0).toList();
    }

    if (_localSearch.isNotEmpty) {
      final q = _localSearch.toLowerCase();
      services = services
          .where((s) =>
              s.title.toLowerCase().contains(q) ||
              s.subtitle.toLowerCase().contains(q) ||
              s.city.toLowerCase().contains(q))
          .toList();
    }

    if (_activeFilter == 'topRated') {
      services = List.from(services)..sort((a, b) => b.rating.compareTo(a.rating));
    } else if (_activeFilter == 'lowestPrice') {
      services = List.from(services)
        ..sort((a, b) => a.discountedPrice.compareTo(b.discountedPrice));
    } else if (_activeFilter == 'offers') {
      services = services.where((s) => s.discountPercent > 0).toList();
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          // AppBar علوي عصري مع تدرج لوني وبحث
          SliverAppBar(
            expandedHeight: 140,
            pinned: true,
            backgroundColor: widget.themeColor,
            elevation: 0,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 20),
              onPressed: () => Navigator.pop(context),
            ),
            flexibleSpace: FlexibleSpaceBar(
              titlePadding: const EdgeInsets.only(bottom: 58, right: 20, left: 20),
              title: Text(
                widget.title,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
              background: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topRight,
                    end: Alignment.bottomLeft,
                    colors: [
                      widget.themeColor,
                      widget.themeColor.withOpacity(0.85),
                    ],
                  ),
                ),
              ),
            ),
            bottom: PreferredSize(
              preferredSize: const Size.fromHeight(56),
              child: Container(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                child: Container(
                  height: 44,
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(22),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.08),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.search, color: Color(0xFF94A3B8), size: 20),
                      const SizedBox(width: 8),
                      Expanded(
                        child: TextField(
                          onChanged: (val) => setState(() => _localSearch = val),
                          style: const TextStyle(fontSize: 13),
                          decoration: const InputDecoration(
                            hintText: 'ابحث في هذا القسم بالاسم أو الولاية...',
                            hintStyle: TextStyle(color: Color(0xFF94A3B8), fontSize: 12.5),
                            border: InputBorder.none,
                            isDense: true,
                          ),
                        ),
                      ),
                      if (_localSearch.isNotEmpty)
                        GestureDetector(
                          onTap: () => setState(() => _localSearch = ''),
                          child: const Icon(Icons.close, color: Colors.grey, size: 18),
                        ),
                    ],
                  ),
                ),
              ),
            ),
          ),

          // شرائح الفلترة السريعة
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 8),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildFilterChip('الكل', 'all'),
                    const SizedBox(width: 8),
                    _buildFilterChip('الأعلى تقييماً ⭐', 'topRated'),
                    const SizedBox(width: 8),
                    _buildFilterChip('الأقل سعراً 💰', 'lowestPrice'),
                    const SizedBox(width: 8),
                    _buildFilterChip('العروض الخاصة 🎁', 'offers'),
                  ],
                ),
              ),
            ),
          ),

          // قائمة الخدمات
          services.isEmpty
              ? SliverFillRemaining(
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.search_off_rounded, size: 64, color: Colors.grey.shade400),
                        const SizedBox(height: 12),
                        const Text(
                          'لا توجد خدمات مطابقة لبحثك',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF64748B),
                          ),
                        ),
                      ],
                    ),
                  ),
                )
              : SliverPadding(
                  padding: const EdgeInsets.fromLTRB(16, 6, 16, 24),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        final srv = services[index];
                        final isFav = favCtrl.isFavorite(srv.id);
                        return _buildServiceCard(context, srv, isFav, favCtrl);
                      },
                      childCount: services.length,
                    ),
                  ),
                ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, String value) {
    final isSelected = _activeFilter == value;
    return GestureDetector(
      onTap: () => setState(() => _activeFilter = value),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: isSelected ? widget.themeColor : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? widget.themeColor : const Color(0xFFE2E8F0),
          ),
          boxShadow: [
            if (isSelected)
              BoxShadow(
                color: widget.themeColor.withOpacity(0.25),
                blurRadius: 6,
                offset: const Offset(0, 2),
              ),
          ],
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : const Color(0xFF475569),
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
          ),
        ),
      ),
    );
  }

  Widget _buildServiceCard(
    BuildContext context,
    ServiceModel srv,
    bool isFav,
    FavoritesController favCtrl,
  ) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => ServiceDetailsView(service: srv),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // صورة الخدمة مع الشارات العائمة
            Stack(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
                  child: Image.asset(
                    srv.imageAsset,
                    height: 160,
                    width: double.infinity,
                    fit: BoxFit.cover,
                  ),
                ),
                // شارة الخصم
                if (srv.discountPercent > 0)
                  Positioned(
                    top: 12,
                    right: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: srv.accentColor,
                        borderRadius: BorderRadius.circular(10),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.2),
                            blurRadius: 4,
                          ),
                        ],
                      ),
                      child: Text(
                        'خصم -${srv.discountPercent}%',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                // شارة التقييم
                Positioned(
                  bottom: 12,
                  right: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.7),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.star, color: Color(0xFFFACC15), size: 14),
                        const SizedBox(width: 4),
                        Text(
                          '${srv.rating}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          ' (${srv.reviewsCount})',
                          style: const TextStyle(
                            color: Colors.white70,
                            fontSize: 10,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                // زر المفضلة
                Positioned(
                  top: 12,
                  left: 12,
                  child: GestureDetector(
                    onTap: () => favCtrl.toggleFavorite(srv.id),
                    child: Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.9),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.15),
                            blurRadius: 4,
                          ),
                        ],
                      ),
                      child: Icon(
                        isFav ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                        color: isFav ? Colors.redAccent : const Color(0xFF64748B),
                        size: 20,
                      ),
                    ),
                  ),
                ),
              ],
            ),

            // محتوى البطاقة
            Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          srv.title,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF0F172A),
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.location_on, size: 12, color: Color(0xFF0D6EFD)),
                            const SizedBox(width: 2),
                            Text(
                              srv.city,
                              style: const TextStyle(fontSize: 11, color: Color(0xFF475569)),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    srv.subtitle,
                    style: const TextStyle(
                      fontSize: 12,
                      color: Color(0xFF64748B),
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 10),
                  // المميزات
                  Wrap(
                    spacing: 6,
                    runSpacing: 4,
                    children: srv.features.take(3).map((f) {
                      return Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                        decoration: BoxDecoration(
                          color: srv.accentColor.withOpacity(0.08),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          f,
                          style: TextStyle(
                            fontSize: 10.5,
                            color: srv.accentColor,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 12),
                  const Divider(height: 1, color: Color(0xFFF1F5F9)),
                  const SizedBox(height: 10),
                  // السعر وزر الحجز
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (srv.discountPercent > 0)
                            Text(
                              '${srv.price.toStringAsFixed(0)} د.ج',
                              style: const TextStyle(
                                fontSize: 11,
                                decoration: TextDecoration.lineThrough,
                                color: Color(0xFF94A3B8),
                              ),
                            ),
                          Row(
                            children: [
                              Text(
                                srv.discountedPrice.toStringAsFixed(0),
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: srv.accentColor,
                                ),
                              ),
                              const SizedBox(width: 4),
                              Text(
                                srv.priceUnit,
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: Color(0xFF64748B),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF0D6EFD),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          elevation: 0,
                        ),
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => BookingView(service: srv),
                            ),
                          );
                        },
                        child: const Text(
                          'احجز الآن',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
