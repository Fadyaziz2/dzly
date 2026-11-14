import 'package:flutter/material.dart';
import '../core/config/api_config.dart';
import '../core/theme/app_colors.dart';
import '../models/service_model.dart';

class OfferCard extends StatelessWidget {
  final ServiceModel service;
  final VoidCallback onTap;

  const OfferCard({
    super.key,
    required this.service,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 170,
        margin: const EdgeInsets.only(left: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.06),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // صورة العرض مع شارة "خصم خاص" أو "عرض"
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
              child: Stack(
                children: [
                  service.imageUrl.isNotEmpty
                      ? Image.network(
                          ApiConfig.resolveUrl(service.imageUrl),
                          height: 94,
                          width: double.infinity,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Image.asset(
                            service.imageAsset,
                            height: 94,
                            width: double.infinity,
                            fit: BoxFit.cover,
                          ),
                        )
                      : Image.asset(
                          service.imageAsset,
                          height: 94,
                          width: double.infinity,
                          fit: BoxFit.cover,
                        ),
                  Positioned(
                    top: 6,
                    right: 6,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: service.badgeLabel == 'خصم خاص'
                            ? const Color(0xFFE53935)
                            : service.accentColor,
                        borderRadius: BorderRadius.circular(8),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.15),
                            blurRadius: 4,
                          ),
                        ],
                      ),
                      child: Text(
                        service.badgeLabel,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 9.5,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // تفاصيل العرض
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 6, 8, 8),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    service.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                      color: AppColors.textDark,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    service.subtitle,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: AppColors.textGrey,
                      fontSize: 9.5,
                    ),
                  ),
                  const SizedBox(height: 6),
                  // كبسولة نسبة الخصم بالألوان المتناسقة
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 3),
                    decoration: BoxDecoration(
                      color: service.accentColor,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      '-${service.discountPercent}%',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 11,
                      ),
                    ),
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
