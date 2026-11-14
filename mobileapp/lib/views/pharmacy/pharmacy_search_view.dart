import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/config/api_config.dart';
import '../../core/theme/app_colors.dart';
import '../../models/pharmacy_model.dart';
import '../../services/api_service.dart';
import 'pharmacy_cart_view.dart';

class PharmacySearchView extends StatefulWidget {
  final String initialQuery;

  const PharmacySearchView({
    super.key,
    this.initialQuery = '',
  });

  @override
  State<PharmacySearchView> createState() => _PharmacySearchViewState();
}

class _PharmacySearchViewState extends State<PharmacySearchView> {
  final ApiService _api = ApiService();
  final TextEditingController _searchCtrl = TextEditingController();
  Timer? _debounceTimer;

  bool _isLoading = true;
  String _selectedSort = 'nearby'; // 'nearby' or 'cheapest'
  String _selectedCategory = 'الكل';
  List<MedicineModel> _medicines = [];

  // Local cart state
  final Map<String, PharmacyCartItem> _cart = {};

  final List<String> _categories = [
    'الكل',
    'مسكنات وخافضات حرارة',
    'مضادات حيوية',
    'فيتامينات ومكملات',
    'أمراض مزمنة',
    'أطفال ورضع',
    'عناية جلدية ومستحضرات',
  ];

  @override
  void initState() {
    super.initState();
    _searchCtrl.text = widget.initialQuery;
    _fetchMedicines();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    _debounceTimer?.cancel();
    super.dispose();
  }

  Future<void> _fetchMedicines() async {
    setState(() => _isLoading = true);
    try {
      final url = ApiConfig.searchMedicines(
        query: _searchCtrl.text.trim(),
        sort: _selectedSort,
        lat: 33.3683,
        lng: 6.8673,
      );

      final res = await _api.get(url);
      if (res != null && res['data'] is List) {
        final list = (res['data'] as List)
            .map((item) => MedicineModel.fromJson(item as Map<String, dynamic>))
            .toList();

        setState(() {
          _medicines = list;
          _isLoading = false;
        });
        return;
      }
    } catch (e) {
      debugPrint('Error searching medicines: $e');
    }

    setState(() => _isLoading = false);
  }

  void _onSearchChanged(String value) {
    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 350), () {
      _fetchMedicines();
    });
  }

  void _addToCart(MedicineModel med) {
    setState(() {
      if (_cart.containsKey(med.id)) {
        if (_cart[med.id]!.quantity < med.stock) {
          _cart[med.id]!.quantity++;
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('عذراً، أقصى كمية متاحة بالمخزون هي ${med.stock} علبة'),
              duration: const Duration(seconds: 2),
            ),
          );
        }
      } else {
        _cart[med.id] = PharmacyCartItem(medicine: med, quantity: 1);
      }
    });
  }

  void _removeFromCart(MedicineModel med) {
    setState(() {
      if (_cart.containsKey(med.id)) {
        if (_cart[med.id]!.quantity > 1) {
          _cart[med.id]!.quantity--;
        } else {
          _cart.remove(med.id);
        }
      }
    });
  }

  double get _cartTotal {
    return _cart.values.fold(0.0, (sum, item) => sum + item.subtotal);
  }

  int get _cartItemCount {
    return _cart.values.fold(0, (sum, item) => sum + item.quantity);
  }

  List<MedicineModel> get _filteredMedicines {
    if (_selectedCategory == 'الكل') return _medicines;
    return _medicines.where((m) => m.category == _selectedCategory).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: const Color(0xFFF8FAFC),
        appBar: AppBar(
          backgroundColor: AppColors.pharmacyTeal,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 20),
            onPressed: () => Navigator.pop(context),
          ),
          title: const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'الصيدليات وطلب الأدوية',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
              ),
              Text(
                'مقارنة الأسعار وتوفر المخزون فورياً في الوادي',
                style: TextStyle(color: Colors.white70, fontSize: 11),
              ),
            ],
          ),
          actions: [
            Stack(
              alignment: Alignment.center,
              children: [
                IconButton(
                  icon: const Icon(Icons.shopping_bag_outlined, color: Colors.white, size: 26),
                  onPressed: () {
                    if (_cart.isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('سلة الأدوية فارغة، اختر الأدوية المطلوبة أولاً'),
                          duration: Duration(seconds: 2),
                        ),
                      );
                      return;
                    }
                    _openCart();
                  },
                ),
                if (_cartItemCount > 0)
                  Positioned(
                    top: 8,
                    left: 8,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(
                        color: AppColors.accentYellow,
                        shape: BoxShape.circle,
                      ),
                      constraints: const BoxConstraints(minWidth: 18, minHeight: 18),
                      child: Text(
                        '$_cartItemCount',
                        style: const TextStyle(
                          color: AppColors.darkNavy,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
              ],
            ),
          ],
        ),
        body: Column(
          children: [
            // Search & Sort Header
            Container(
              color: Colors.white,
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
              child: Column(
                children: [
                  // Search Bar
                  Container(
                    height: 46,
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    child: Row(
                      children: [
                        const Icon(Icons.search_rounded, color: AppColors.pharmacyTeal, size: 22),
                        const SizedBox(width: 10),
                        Expanded(
                          child: TextField(
                            controller: _searchCtrl,
                            onChanged: _onSearchChanged,
                            decoration: const InputDecoration(
                              hintText: 'ابحث باسم الدواء التجاري أو العلمي (مثال: Doliprane)...',
                              hintStyle: TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
                              border: InputBorder.none,
                              isDense: true,
                            ),
                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                          ),
                        ),
                        if (_searchCtrl.text.isNotEmpty)
                          GestureDetector(
                            onTap: () {
                              _searchCtrl.clear();
                              _fetchMedicines();
                            },
                            child: const Icon(Icons.close_rounded, color: Colors.grey, size: 18),
                          ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 10),

                  // Sort Buttons: Nearest vs Cheapest
                  Row(
                    children: [
                      const Text(
                        'الترتيب حسب: ',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF64748B)),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Row(
                          children: [
                            Expanded(
                              child: _buildSortButton(
                                label: '📍 الأقرب مسافة',
                                value: 'nearby',
                                isSelected: _selectedSort == 'nearby',
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: _buildSortButton(
                                label: '💰 الأرخص سعراً',
                                value: 'cheapest',
                                isSelected: _selectedSort == 'cheapest',
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Category Chips Row
            Container(
              height: 48,
              color: Colors.white,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                itemCount: _categories.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (context, idx) {
                  final cat = _categories[idx];
                  final isSel = _selectedCategory == cat;
                  return GestureDetector(
                    onTap: () => setState(() => _selectedCategory = cat),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14),
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: isSel ? AppColors.pharmacyTeal : const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: isSel ? AppColors.pharmacyTeal : const Color(0xFFE2E8F0),
                        ),
                      ),
                      child: Text(
                        cat,
                        style: TextStyle(
                          fontSize: 11.5,
                          fontWeight: isSel ? FontWeight.bold : FontWeight.w500,
                          color: isSel ? Colors.white : const Color(0xFF475569),
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),

            const Divider(height: 1, thickness: 1, color: Color(0xFFE2E8F0)),

            // Medicine Search Results List
            Expanded(
              child: _isLoading
                  ? const Center(
                      child: CircularProgressIndicator(color: AppColors.pharmacyTeal),
                    )
                  : _filteredMedicines.isEmpty
                      ? _buildEmptyState()
                      : ListView.separated(
                          padding: const EdgeInsets.all(14),
                          itemCount: _filteredMedicines.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 12),
                          itemBuilder: (context, idx) {
                            final med = _filteredMedicines[idx];
                            final cartItem = _cart[med.id];
                            return _buildMedicineCard(med, cartItem);
                          },
                        ),
            ),

            // Persistent Bottom Cart Bar
            if (_cart.isNotEmpty) _buildBottomCartBar(),
          ],
        ),
      ),
    );
  }

  Widget _buildSortButton({
    required String label,
    required String value,
    required bool isSelected,
  }) {
    return GestureDetector(
      onTap: () {
        if (_selectedSort != value) {
          setState(() => _selectedSort = value);
          _fetchMedicines();
        }
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 7),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFCCFBF1) : const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSelected ? AppColors.pharmacyTeal : const Color(0xFFE2E8F0),
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
            color: isSelected ? const Color(0xFF0F766E) : const Color(0xFF475569),
          ),
        ),
      ),
    );
  }

  Widget _buildMedicineCard(MedicineModel med, PharmacyCartItem? cartItem) {
    final hasStock = med.stock > 0;
    final qtyInCart = cartItem?.quantity ?? 0;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Row 1: Name, Category badge, Price
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: const Color(0xFFF0FDFA),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFCCFBF1)),
                ),
                child: const Icon(Icons.medication_rounded, color: AppColors.pharmacyTeal, size: 24),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      med.name,
                      style: const TextStyle(
                        fontSize: 14.5,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF0F172A),
                      ),
                    ),
                    if (med.genericName.isNotEmpty)
                      Text(
                        med.genericName,
                        style: const TextStyle(
                          fontSize: 11.5,
                          fontFamily: 'Courier',
                          color: Color(0xFF64748B),
                        ),
                      ),
                    if (med.dosage.isNotEmpty)
                      Text(
                        med.dosage,
                        style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
                      ),
                  ],
                ),
              ),

              // Price & Prescription
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '${med.price.toInt()} د.ج',
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF0F766E),
                    ),
                  ),
                  if (med.requiresPrescription)
                    Container(
                      margin: const EdgeInsets.only(top: 4),
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEF3C7),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text(
                        'روشتة طبية 🩺',
                        style: TextStyle(
                          fontSize: 9.5,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF92400E),
                        ),
                      ),
                    ),
                ],
              ),
            ],
          ),

          const SizedBox(height: 10),
          const Divider(height: 1, color: Color(0xFFF1F5F9)),
          const SizedBox(height: 10),

          // Row 2: Pharmacy Details & Distance
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              children: [
                const Icon(Icons.local_pharmacy_rounded, size: 16, color: AppColors.pharmacyTeal),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    med.pharmacyName,
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1E293B),
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                // Distance badge
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE0F2FE),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.near_me_rounded, size: 11, color: Color(0xFF0284C7)),
                      const SizedBox(width: 3),
                      Text(
                        '${med.distanceKm.toStringAsFixed(1)} كم',
                        style: const TextStyle(
                          fontSize: 10.5,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF0369A1),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 12),

          // Row 3: Stock status & Cart Action
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Stock info
              Row(
                children: [
                  Icon(
                    hasStock ? Icons.check_circle_rounded : Icons.cancel_rounded,
                    size: 15,
                    color: hasStock ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    hasStock ? 'متوفر بالمخزون (${med.stock} علبة)' : 'غير متوفر حالياً',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: hasStock ? const Color(0xFF059669) : const Color(0xFFDC2626),
                    ),
                  ),
                ],
              ),

              // Add / Quantity controls
              if (hasStock)
                qtyInCart > 0
                    ? Container(
                        decoration: BoxDecoration(
                          color: const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: const Color(0xFFCBD5E1)),
                        ),
                        child: Row(
                          children: [
                            IconButton(
                              icon: const Icon(Icons.remove, size: 16),
                              padding: EdgeInsets.zero,
                              constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                              onPressed: () => _removeFromCart(med),
                            ),
                            Text(
                              '$qtyInCart',
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF0F172A),
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.add, size: 16),
                              padding: EdgeInsets.zero,
                              constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                              onPressed: () => _addToCart(med),
                            ),
                          ],
                        ),
                      )
                    : ElevatedButton.icon(
                        onPressed: () => _addToCart(med),
                        icon: const Icon(Icons.add_shopping_cart_rounded, size: 16, color: Colors.white),
                        label: const Text(
                          'أضف للسلة',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.pharmacyTeal,
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                      ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              color: const Color(0xFFF0FDFA),
              shape: BoxShape.circle,
              border: Border.all(color: const Color(0xFFCCFBF1)),
            ),
            child: const Icon(Icons.search_off_rounded, color: AppColors.pharmacyTeal, size: 36),
          ),
          const SizedBox(height: 14),
          const Text(
            'لم نجد أدوية مطابقة لبحثك',
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF334155)),
          ),
          const SizedBox(height: 6),
          const Text(
            'تأكد من كتابة اسم الدواء بشكل صحيح أو جرّب اسماً آخر',
            style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomCartBar() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 12,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  '$_cartItemCount صنف في السلة',
                  style: const TextStyle(fontSize: 11.5, color: Color(0xFF64748B), fontWeight: FontWeight.w600),
                ),
                Text(
                  '${_cartTotal.toInt()} د.ج',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF0F766E),
                  ),
                ),
              ],
            ),
            const SizedBox(width: 18),
            Expanded(
              child: ElevatedButton(
                onPressed: _openCart,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.pharmacyTeal,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  elevation: 2,
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'معاينة السلة وإتمام الطلب',
                      style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                    SizedBox(width: 6),
                    Icon(Icons.arrow_forward_ios_rounded, size: 14, color: Colors.white),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _openCart() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => PharmacyCartView(
          cartItems: _cart.values.toList(),
          onCartUpdated: (updatedList) {
            setState(() {
              _cart.clear();
              for (final item in updatedList) {
                _cart[item.medicine.id] = item;
              }
            });
          },
        ),
      ),
    );
  }
}
