import 'package:flutter/material.dart';
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
              color: category.color.withOpacity(0.18),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(14),
          child: Column(
            children: [
              // 1. صورة النشاط في النصف العلوي
              Expanded(
                flex: 55,
                child: SizedBox(
                  width: double.infinity,
                  child: Image.asset(
                    category.imageAsset,
                    fit: BoxFit.cover,
                  ),
                ),
              ),

              // 2. الجزء السفلي الملون بالمنحنى ومسمى القسم
              Expanded(
                flex: 52,
                child: Stack(
                  clipBehavior: Clip.none,
                  alignment: Alignment.center,
                  children: [
                    // خلفية التدرج اللوني للقسم مع انحناء خفيف بالأعلى
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
                      padding: const EdgeInsets.fromLTRB(4, 14, 4, 6),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const SizedBox(height: 2),
                          // اسم القسم بالخط العريض
                          Text(
                            category.title,
                            textAlign: TextAlign.center,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 10.5,
                              letterSpacing: -0.2,
                            ),
                          ),
                          // زر السهم الدائري الأبيض الصغير
                          Container(
                            width: 17,
                            height: 17,
                            decoration: const BoxDecoration(
                              color: Colors.white,
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              Icons.arrow_forward_rounded,
                              size: 11,
                              color: category.color,
                            ),
                          ),
                        ],
                      ),
                    ),

                    // الأيقونة الدائرية العائمة الفاصلة بين الصورة واللون
                    Positioned(
                      top: -16,
                      child: Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          color: category.color,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 2.2),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.15),
                              blurRadius: 4,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Icon(
                          category.icon,
                          color: Colors.white,
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
