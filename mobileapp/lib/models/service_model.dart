import 'package:flutter/material.dart';
import '../core/constants/app_assets.dart';
import '../core/theme/app_colors.dart';

class ServiceModel {
  final String id;
  final String categoryId;
  final String title;
  final String subtitle;
  final String city;
  final String address;
  final double price;
  final String priceUnit;
  final int discountPercent;
  final String badgeLabel;
  final double rating;
  final int reviewsCount;
  final Color accentColor;
  final String imageAsset;
  final String imageUrl;
  final List<String> images;
  final List<String> features;

  const ServiceModel({
    required this.id,
    required this.categoryId,
    required this.title,
    required this.subtitle,
    required this.city,
    required this.address,
    required this.price,
    required this.priceUnit,
    this.discountPercent = 0,
    this.badgeLabel = 'عرض',
    required this.rating,
    required this.reviewsCount,
    required this.accentColor,
    required this.imageAsset,
    this.imageUrl = '',
    this.images = const [],
    required this.features,
  });

  double get discountedPrice =>
      discountPercent > 0 ? price * (1 - discountPercent / 100) : price;

  factory ServiceModel.fromJson(Map<String, dynamic> json) {
    final catId = json['categoryId'] ?? '';
    final id = json['_id'] ?? json['id'] ?? '';
    final p = (json['price'] is num) ? (json['price'] as num).toDouble() : 0.0;
    final r = (json['rating'] is num) ? (json['rating'] as num).toDouble() : 5.0;
    final rev = (json['reviewsCount'] is num) ? (json['reviewsCount'] as num).toInt() : 0;
    final d = (json['discountPercent'] is num) ? (json['discountPercent'] as num).toInt() : 0;

    final imgs = (json['images'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [];
    String imgUrl = json['imageUrl'] ?? '';
    if (imgUrl.isEmpty && imgs.isNotEmpty) {
      imgUrl = imgs.first;
    }

    return ServiceModel(
      id: id,
      categoryId: catId,
      title: json['title'] ?? '',
      subtitle: json['subtitle'] ?? json['description'] ?? '',
      city: json['city'] ?? 'الوادي',
      address: json['address'] ?? '',
      price: p,
      priceUnit: json['priceUnit'] ?? 'د.ج',
      discountPercent: d,
      badgeLabel: json['badgeLabel'] ?? 'عرض',
      rating: r,
      reviewsCount: rev,
      accentColor: _parseColor(json['accentColor'], catId),
      imageAsset: _resolveAsset(catId, json['imageAsset']),
      imageUrl: imgUrl,
      images: imgs,
      features: (json['features'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
    );
  }

  static Color _parseColor(dynamic hex, String categoryId) {
    if (hex is String && hex.startsWith('#')) {
      final clean = hex.replaceFirst('#', '');
      return Color(int.parse('FF$clean', radix: 16));
    }
    switch (categoryId) {
      case 'cars':
        return AppColors.carsBlue;
      case 'beauty':
        return AppColors.beautyPink;
      case 'farms':
        return AppColors.farmsGreen;
      case 'weddings':
        return AppColors.weddingsRed;
      case 'pools':
        return AppColors.poolsCyan;
      case 'hotels':
        return AppColors.hotelsBlue;
      case 'farms_halls':
        return AppColors.farmsHallsPurple;
      case 'houses':
        return AppColors.housesTeal;
      default:
        return AppColors.primaryBlue;
    }
  }

  static String _resolveAsset(String catId, String? assetPath) {
    if (assetPath != null && assetPath.isNotEmpty && assetPath.startsWith('assets/')) {
      return assetPath;
    }
    switch (catId) {
      case 'cars':
        return AppAssets.offerCar;
      case 'beauty':
        return AppAssets.offerSalon;
      case 'farms':
        return AppAssets.offerFarm;
      case 'weddings':
        return AppAssets.offerHall;
      case 'pools':
        return AppAssets.catPools;
      case 'hotels':
        return AppAssets.catHotels;
      case 'farms_halls':
        return AppAssets.catFarmsHalls;
      case 'houses':
        return AppAssets.catHouses;
      default:
        return AppAssets.offerHall;
    }
  }
}
