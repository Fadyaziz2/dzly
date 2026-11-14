import 'package:flutter/material.dart';
import '../core/constants/app_assets.dart';
import '../core/theme/app_colors.dart';

class DynamicFieldModel {
  final String name;
  final String label;
  final String type; // text, number, boolean, select, date, time, file, multiselect
  final bool required;
  final List<String> options;
  final dynamic defaultValue;
  final String helperText;

  const DynamicFieldModel({
    required this.name,
    required this.label,
    required this.type,
    this.required = false,
    this.options = const [],
    this.defaultValue,
    this.helperText = '',
  });

  factory DynamicFieldModel.fromJson(Map<String, dynamic> json) {
    return DynamicFieldModel(
      name: json['name'] ?? '',
      label: json['label'] ?? '',
      type: json['type'] ?? 'text',
      required: json['required'] ?? false,
      options: (json['options'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      defaultValue: json['defaultValue'],
      helperText: json['helperText'] ?? '',
    );
  }
}

class CategoryModel {
  final String id;
  final String title;
  final String titleEn;
  final Color color;
  final IconData icon;
  final String imageAsset;
  final String description;
  final List<DynamicFieldModel> bookingFields;

  const CategoryModel({
    required this.id,
    required this.title,
    this.titleEn = '',
    required this.color,
    required this.icon,
    required this.imageAsset,
    this.description = '',
    this.bookingFields = const [],
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    final catId = json['id'] ?? '';
    return CategoryModel(
      id: catId,
      title: json['title'] ?? '',
      titleEn: json['titleEn'] ?? '',
      color: _parseColor(json['color']),
      icon: _parseIcon(json['icon'] ?? catId),
      imageAsset: _mapAsset(catId, json['imageAsset']),
      description: json['description'] ?? '',
      bookingFields: (json['bookingFieldsSpecification'] as List<dynamic>?)
              ?.map((f) => DynamicFieldModel.fromJson(f as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  static Color _parseColor(dynamic colorValue) {
    if (colorValue is String && colorValue.startsWith('#')) {
      final hex = colorValue.replaceFirst('#', '');
      return Color(int.parse('FF$hex', radix: 16));
    }
    return AppColors.primaryBlue;
  }

  static IconData _parseIcon(String name) {
    switch (name) {
      case 'directions_car_rounded':
      case 'cars':
        return Icons.directions_car_rounded;
      case 'face_retouching_natural':
      case 'beauty':
        return Icons.face_retouching_natural;
      case 'eco_rounded':
      case 'farms':
        return Icons.eco_rounded;
      case 'celebration_rounded':
      case 'weddings':
        return Icons.celebration_rounded;
      case 'pool_rounded':
      case 'pools':
        return Icons.pool_rounded;
      case 'hotel_rounded':
      case 'hotels':
        return Icons.hotel_rounded;
      case 'villa_rounded':
      case 'farms_halls':
        return Icons.villa_rounded;
      case 'home_work_rounded':
      case 'houses':
        return Icons.home_work_rounded;
      default:
        return Icons.grid_view_rounded;
    }
  }

  static String _mapAsset(String id, String? fallback) {
    switch (id) {
      case 'cars':
        return AppAssets.catCars;
      case 'beauty':
        return AppAssets.catBeauty;
      case 'farms':
        return AppAssets.catFarms;
      case 'weddings':
        return AppAssets.catWeddings;
      case 'pools':
        return AppAssets.catPools;
      case 'hotels':
        return AppAssets.catHotels;
      case 'farms_halls':
        return AppAssets.catFarmsHalls;
      case 'houses':
        return AppAssets.catHouses;
      default:
        return fallback?.isNotEmpty == true ? fallback! : AppAssets.catWeddings;
    }
  }
}
