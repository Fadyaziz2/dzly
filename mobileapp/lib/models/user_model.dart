class UserModel {
  final String id;
  final String name;
  final String email;
  final String phone;
  final String role;
  final String city;
  final String status;
  final String avatar;
  final String businessName;
  final String token;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.role,
    required this.city,
    this.status = 'active',
    this.avatar = '',
    this.businessName = '',
    this.token = '',
  });

  factory UserModel.fromJson(Map<String, dynamic> json, {String token = ''}) {
    return UserModel(
      id: json['id'] ?? json['_id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      role: json['role'] ?? 'client',
      city: json['city'] ?? 'الوادي',
      status: json['status'] ?? 'active',
      avatar: json['avatar'] ?? '',
      businessName: json['businessName'] ?? '',
      token: token.isNotEmpty ? token : (json['token'] ?? ''),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'role': role,
      'city': city,
      'status': status,
      'avatar': avatar,
      'businessName': businessName,
      'token': token,
    };
  }

  UserModel copyWith({
    String? name,
    String? phone,
    String? city,
    String? avatar,
    String? businessName,
  }) {
    return UserModel(
      id: id,
      name: name ?? this.name,
      email: email,
      phone: phone ?? this.phone,
      role: role,
      city: city ?? this.city,
      status: status,
      avatar: avatar ?? this.avatar,
      businessName: businessName ?? this.businessName,
      token: token,
    );
  }
}

