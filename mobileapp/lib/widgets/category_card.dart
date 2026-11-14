import 'package:flutter/material.dart';
import '../core/config/api_config.dart';
import '../models/category_model.dart';

class CategoryCard extends StatelessWidget {
  final CategoryModel category;
  final VoidCallback onTap;

  const CategoryCard({
    super.key,
    required this.category,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: category.color.withOpacity(0.2),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(14),
          child: Column(
            children: [
              // 1. صورة النشاط الحقيقية في النصف العلوي (سحابية من الداش بورد أو من الأصول كاحتياطي)
              Expanded(
                flex: 50,
                child: SizedBox(
                  width: double.infinity,
                  child: category.imageUrl.isNotEmpty
                      ? Image.network(
                          ApiConfig.resolveUrl(category.imageUrl),
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) => Image.asset(
                            category.imageAsset,
                            fit: BoxFit.cover,
                          ),
                        )
                      : Image.asset(
                          category.imageAsset,
                          fit: BoxFit.cover,
                        ),
                ),
              ),

              // 2. النصف السفلي: قاعدة لونية صلبة متدرجة للأعلى
              Expanded(
                flex: 50,
                child: Stack(
                  clipBehavior: Clip.none,
                  alignment: Alignment.center,
                  children: [
                    // خلفية اللون الصلب المتدرج للقسم
                    Container(
                      width: double.infinity,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            category.color,
                            category.color.withOpacity(0.92),
                          ],
                        ),
                      ),
                      padding: const EdgeInsets.fromLTRB(2, 12, 2, 4),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          // اسم القسم باللون الأبيض العريض مع ملاءمة مرنة لعدم التجاوز إطلاقاً
                          Flexible(
                            child: FittedBox(
                              fit: BoxFit.scaleDown,
                              child: Text(
                                category.title,
                                textAlign: TextAlign.center,
                                maxLines: 1,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 10.5,
                                  letterSpacing: -0.3,
                                ),
                              ),
                            ),
                          ),
                          // دائرة بيضاء صغيرة بداخلها سهم صغير
                          Container(
                            width: 15,
                            height: 15,
                            decoration: const BoxDecoration(
                              color: Colors.white,
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              Icons.arrow_forward_rounded,
                              size: 10,
                              color: category.color,
                            ),
                          ),
                        ],
                      ),
                    ),

                    // دائرة بيضاء بداخلها أيقونة القسم بنفس لون الكارت على الحد الفاصل
                    Positioned(
                      top: -14,
                      child: Container(
                        width: 28,
                        height: 28,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.18),
                              blurRadius: 5,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Icon(
                          category.icon,
                          color: category.color,
                          size: 16,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
