class MedicineModel {
  final String id;
  final String name;
  final String genericName;
  final String category;
  final String dosage;
  final double price;
  final int stock;
  final bool requiresPrescription;
  final String image;
  final String description;
  final String pharmacyId;
  final String pharmacyName;
  final String pharmacyPhone;
  final String pharmacyAddress;
  final String pharmacyCity;
  final bool pharmacyIsOpen;
  final double distanceKm;

  const MedicineModel({
    required this.id,
    required this.name,
    this.genericName = '',
    this.category = 'مسكنات وخافضات حرارة',
    this.dosage = '',
    required this.price,
    required this.stock,
    this.requiresPrescription = false,
    this.image = '',
    this.description = '',
    required this.pharmacyId,
    required this.pharmacyName,
    this.pharmacyPhone = '',
    this.pharmacyAddress = '',
    this.pharmacyCity = 'الوادي',
    this.pharmacyIsOpen = true,
    this.distanceKm = 0.0,
  });

  factory MedicineModel.fromJson(Map<String, dynamic> json) {
    return MedicineModel(
      id: json['id'] ?? json['_id'] ?? '',
      name: json['name'] ?? '',
      genericName: json['genericName'] ?? '',
      category: json['category'] ?? 'مسكنات وخافضات حرارة',
      dosage: json['dosage'] ?? '',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      stock: (json['stock'] as num?)?.toInt() ?? 0,
      requiresPrescription: json['requiresPrescription'] ?? false,
      image: json['image'] ?? '',
      description: json['description'] ?? '',
      pharmacyId: json['pharmacyId'] ?? '',
      pharmacyName: json['pharmacyName'] ?? 'صيدلية معتمدة',
      pharmacyPhone: json['pharmacyPhone'] ?? '',
      pharmacyAddress: json['pharmacyAddress'] ?? '',
      pharmacyCity: json['pharmacyCity'] ?? 'الوادي',
      pharmacyIsOpen: json['pharmacyIsOpen'] ?? true,
      distanceKm: (json['distanceKm'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

class PharmacyCartItem {
  final MedicineModel medicine;
  int quantity;

  PharmacyCartItem({
    required this.medicine,
    this.quantity = 1,
  });

  double get subtotal => medicine.price * quantity;
}

class PharmacyOrderItemModel {
  final String medicineId;
  final String name;
  final String dosage;
  final int quantity;
  final double unitPrice;
  final double subtotal;

  const PharmacyOrderItemModel({
    required this.medicineId,
    required this.name,
    this.dosage = '',
    required this.quantity,
    required this.unitPrice,
    required this.subtotal,
  });

  factory PharmacyOrderItemModel.fromJson(Map<String, dynamic> json) {
    return PharmacyOrderItemModel(
      medicineId: json['medicine']?['_id'] ?? json['medicine'] ?? '',
      name: json['name'] ?? '',
      dosage: json['dosage'] ?? '',
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
      unitPrice: (json['unitPrice'] as num?)?.toDouble() ?? 0.0,
      subtotal: (json['subtotal'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

class PharmacyOrderModel {
  final String id;
  final String orderCode;
  final String pharmacyId;
  final String pharmacyName;
  final String pharmacyPhone;
  final String pharmacyAddress;
  final List<PharmacyOrderItemModel> items;
  final String prescriptionImage;
  final String deliveryType;
  final String deliveryAddress;
  final String customerName;
  final String customerPhone;
  final String customerNotes;
  final double totalPrice;
  final double platformCommission;
  final double pharmacyNetEarnings;
  final String status;
  final String rejectionReason;
  final DateTime createdAt;

  const PharmacyOrderModel({
    required this.id,
    required this.orderCode,
    required this.pharmacyId,
    required this.pharmacyName,
    this.pharmacyPhone = '',
    this.pharmacyAddress = '',
    this.items = const [],
    this.prescriptionImage = '',
    this.deliveryType = 'pickup',
    this.deliveryAddress = '',
    required this.customerName,
    required this.customerPhone,
    this.customerNotes = '',
    required this.totalPrice,
    this.platformCommission = 0.0,
    this.pharmacyNetEarnings = 0.0,
    required this.status,
    this.rejectionReason = '',
    required this.createdAt,
  });

  factory PharmacyOrderModel.fromJson(Map<String, dynamic> json) {
    return PharmacyOrderModel(
      id: json['_id'] ?? json['id'] ?? '',
      orderCode: json['orderCode'] ?? 'PH-0000',
      pharmacyId: json['pharmacy']?['_id'] ?? json['pharmacy'] ?? '',
      pharmacyName: json['pharmacyName'] ?? 'صيدلية معتمدة',
      pharmacyPhone: json['pharmacyPhone'] ?? '',
      pharmacyAddress: json['pharmacyAddress'] ?? '',
      items: (json['items'] as List<dynamic>?)
              ?.map((item) => PharmacyOrderItemModel.fromJson(item as Map<String, dynamic>))
              .toList() ??
          [],
      prescriptionImage: json['prescriptionImage'] ?? '',
      deliveryType: json['deliveryType'] ?? 'pickup',
      deliveryAddress: json['deliveryAddress'] ?? '',
      customerName: json['customerName'] ?? '',
      customerPhone: json['customerPhone'] ?? '',
      customerNotes: json['customerNotes'] ?? '',
      totalPrice: (json['totalPrice'] as num?)?.toDouble() ?? 0.0,
      platformCommission: (json['platformCommission'] as num?)?.toDouble() ?? 0.0,
      pharmacyNetEarnings: (json['pharmacyNetEarnings'] as num?)?.toDouble() ?? 0.0,
      status: json['status'] ?? 'pending',
      rejectionReason: json['rejectionReason'] ?? '',
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt']) ?? DateTime.now()
          : DateTime.now(),
    );
  }
}
