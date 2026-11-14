import 'package:flutter/material.dart';
import '../../core/config/api_config.dart';
import '../../core/theme/app_colors.dart';
import '../../models/pharmacy_model.dart';
import '../../services/api_service.dart';

class PharmacyCartView extends StatefulWidget {
  final List<PharmacyCartItem> cartItems;
  final Function(List<PharmacyCartItem>) onCartUpdated;

  const PharmacyCartView({
    super.key,
    required this.cartItems,
    required this.onCartUpdated,
  });

  @override
  State<PharmacyCartView> createState() => _PharmacyCartViewState();
}

class _PharmacyCartViewState extends State<PharmacyCartView> {
  final ApiService _api = ApiService();
  late List<PharmacyCartItem> _items;

  String _deliveryType = 'pickup'; // 'pickup' or 'delivery'
  final TextEditingController _addressCtrl = TextEditingController();
  final TextEditingController _nameCtrl = TextEditingController(text: 'كريم بلحاج');
  final TextEditingController _phoneCtrl = TextEditingController(text: '0661234567');
  final TextEditingController _notesCtrl = TextEditingController();

  String _prescriptionImage = '';
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _items = List.from(widget.cartItems);
  }

  @override
  void dispose() {
    _addressCtrl.dispose();
    _nameCtrl.dispose();
    _phoneCtrl.dispose();
    _notesCtrl.dispose();
    super.dispose();
  }

  bool get _requiresPrescription {
    return _items.any((item) => item.medicine.requiresPrescription);
  }

  double get _subtotal {
    return _items.fold(0.0, (sum, it) => sum + it.subtotal);
  }

  double get _deliveryFee => _deliveryType == 'delivery' ? 200.0 : 0.0;
  double get _grandTotal => _subtotal + _deliveryFee;

  void _updateQuantity(int index, int delta) {
    setState(() {
      final newQty = _items[index].quantity + delta;
      if (newQty > _items[index].medicine.stock) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('الكمية المتاحة بالمخزون هي ${_items[index].medicine.stock} علبة فقط'),
            duration: const Duration(seconds: 2),
          ),
        );
        return;
      }

      if (newQty > 0) {
        _items[index].quantity = newQty;
      } else {
        _items.removeAt(index);
      }
      widget.onCartUpdated(_items);
    });
  }

  void _removeItem(int index) {
    setState(() {
      _items.removeAt(index);
      widget.onCartUpdated(_items);
    });
  }

  Future<void> _submitOrder() async {
    if (_items.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('السلة فارغة')),
      );
      return;
    }

    if (_nameCtrl.text.trim().isEmpty || _phoneCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('يرجى كتابة الاسم ورقم الهاتف للتواصل')),
      );
      return;
    }

    if (_deliveryType == 'delivery' && _addressCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('يرجى تحديد عنوان التوصيل المنزلي')),
      );
      return;
    }

    if (_requiresPrescription && _prescriptionImage.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('تنبيه: بعض الأدوية في السلة تتطلب إرفاق صورة الروشتة الطبية 🩺'),
          backgroundColor: Color(0xFFB45309),
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final primaryPharmacyId = _items.first.medicine.pharmacyId;

      final body = {
        'pharmacyId': primaryPharmacyId,
        'items': _items
            .map((it) => {
                  'medicineId': it.medicine.id,
                  'name': it.medicine.name,
                  'quantity': it.quantity,
                  'unitPrice': it.medicine.price,
                })
            .toList(),
        'prescriptionImage': _prescriptionImage,
        'deliveryType': _deliveryType,
        'deliveryAddress': _addressCtrl.text.trim(),
        'customerName': _nameCtrl.text.trim(),
        'customerPhone': _phoneCtrl.text.trim(),
        'customerNotes': _notesCtrl.text.trim(),
      };

      final res = await _api.post(ApiConfig.pharmacyOrders, body);

      if (res != null && res['success'] == true) {
        final orderData = res['data'];
        final orderCode = orderData?['orderCode'] ?? 'PH-OK';

        // Clear cart
        setState(() => _items.clear());
        widget.onCartUpdated([]);

        if (!mounted) return;
        _showSuccessDialog(orderCode);
      } else {
        if (!mounted) return;
        final msg = res?['message'] ?? 'فشل إرسال الطلب، يرجى المحاولة مرة أخرى';
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(msg), backgroundColor: Colors.red),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('خطأ أثناء إرسال الطلب: $e'), backgroundColor: Colors.red),
      );
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  void _showSuccessDialog(String orderCode) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => Directionality(
        textDirection: TextDirection.rtl,
        child: AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          contentPadding: const EdgeInsets.all(20),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 64,
                height: 64,
                decoration: const BoxDecoration(
                  color: Color(0xFFECFDF5),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check_circle_rounded, color: Color(0xFF10B981), size: 40),
              ),
              const SizedBox(height: 14),
              const Text(
                'تم إرسال طلب الدواء بنجاح! 💊',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 6),
              Text(
                'كود الطلب: $orderCode',
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w900,
                  fontFamily: 'Courier',
                  color: AppColors.pharmacyTeal,
                ),
              ),
              const SizedBox(height: 10),
              const Text(
                'سيقوم الصيدلي بمراجعة الروشتة والأصناف وتجهيز طلبك فوراً، وستصلك إشعارات بحالة الطلب لحظة بلحظة.',
                style: TextStyle(fontSize: 12, color: Color(0xFF64748B), height: 1.4),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 18),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(ctx); // Close dialog
                    Navigator.pop(context); // Close cart view
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.pharmacyTeal,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  child: const Text(
                    'العودة للشاشة الرئيسية',
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final pharmacyName = _items.isNotEmpty ? _items.first.medicine.pharmacyName : 'الصيدلية';

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
          title: const Text(
            'سلة مشتريات الأدوية',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
          ),
        ),
        body: _items.isEmpty
            ? _buildEmptyCart()
            : ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Pharmacy Tag
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF0FDFA),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFFCCFBF1)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.storefront_rounded, color: AppColors.pharmacyTeal, size: 22),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                pharmacyName,
                                style: const TextStyle(
                                  fontSize: 13.5,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF0F766E),
                                ),
                              ),
                              const Text(
                                'الطلب مباشر من مخزون الصيدلية المعتمدة',
                                style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Prescription Required Warning
                  if (_requiresPrescription)
                    Container(
                      margin: const EdgeInsets.only(bottom: 16),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFFBEB),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFFFDE68A)),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.medical_services_rounded, color: Color(0xFFD97706), size: 24),
                          SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              'تحتوي السلة على أدوية ملزمة بروشتة طبية. يرجى إرفاق صورة الروشتة لإتمام الطلب.',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF92400E),
                                height: 1.3,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                  // Cart Items Card
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _items.length,
                      separatorBuilder: (_, __) => const Divider(height: 1, color: Color(0xFFF1F5F9)),
                      itemBuilder: (context, idx) {
                        final item = _items[idx];
                        return Padding(
                          padding: const EdgeInsets.all(12),
                          child: Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      item.medicine.name,
                                      style: const TextStyle(
                                        fontSize: 13.5,
                                        fontWeight: FontWeight.bold,
                                        color: Color(0xFF0F172A),
                                      ),
                                    ),
                                    if (item.medicine.dosage.isNotEmpty)
                                      Text(
                                        item.medicine.dosage,
                                        style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
                                      ),
                                    const SizedBox(height: 4),
                                    Text(
                                      '${item.medicine.price.toInt()} د.ج / علبة',
                                      style: const TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                        color: AppColors.pharmacyTeal,
                                      ),
                                    ),
                                  ],
                                ),
                              ),

                              // Quantity Controls
                              Container(
                                decoration: BoxDecoration(
                                  color: const Color(0xFFF8FAFC),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: const Color(0xFFE2E8F0)),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    IconButton(
                                      icon: const Icon(Icons.remove, size: 14),
                                      padding: EdgeInsets.zero,
                                      constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                                      onPressed: () => _updateQuantity(idx, -1),
                                    ),
                                    Text(
                                      '${item.quantity}',
                                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                                    ),
                                    IconButton(
                                      icon: const Icon(Icons.add, size: 14),
                                      padding: EdgeInsets.zero,
                                      constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                                      onPressed: () => _updateQuantity(idx, 1),
                                    ),
                                  ],
                                ),
                              ),

                              const SizedBox(width: 8),

                              IconButton(
                                icon: const Icon(Icons.delete_outline_rounded, color: Colors.redAccent, size: 20),
                                onPressed: () => _removeItem(idx),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Delivery Type Selector
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'طريقة استلام الدواء:',
                          style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            Expanded(
                              child: _buildDeliveryOption(
                                label: 'استلام بالصيدلية (مجاناً)',
                                icon: Icons.store_rounded,
                                value: 'pickup',
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: _buildDeliveryOption(
                                label: 'توصيل منزلي (+200 د.ج)',
                                icon: Icons.moped_rounded,
                                value: 'delivery',
                              ),
                            ),
                          ],
                        ),
                        if (_deliveryType == 'delivery') ...[
                          const SizedBox(height: 12),
                          TextField(
                            controller: _addressCtrl,
                            decoration: InputDecoration(
                              labelText: 'عنوان التوصيل بالوادي *',
                              labelStyle: const TextStyle(fontSize: 12),
                              hintText: 'الحي، الشارع، رقم الباب أو معلم قريب...',
                              hintStyle: const TextStyle(fontSize: 11, color: Colors.grey),
                              prefixIcon: const Icon(Icons.location_pin, color: AppColors.pharmacyTeal, size: 20),
                              filled: true,
                              fillColor: const Color(0xFFF8FAFC),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                              ),
                              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                            ),
                            style: const TextStyle(fontSize: 12.5),
                          ),
                        ],
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Prescription Upload Section
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Row(
                              children: [
                                Icon(Icons.camera_alt_rounded, color: AppColors.pharmacyTeal, size: 20),
                                SizedBox(width: 6),
                                Text(
                                  'صورة الروشتة الطبية (Ordonnance):',
                                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                                ),
                              ],
                            ),
                            if (_requiresPrescription)
                              const Text(
                                '* إجباري',
                                style: TextStyle(fontSize: 11, color: Colors.red, fontWeight: FontWeight.bold),
                              ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        if (_prescriptionImage.isEmpty)
                          GestureDetector(
                            onTap: () {
                              setState(() {
                                _prescriptionImage =
                                    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600';
                              });
                            },
                            child: Container(
                              height: 80,
                              decoration: BoxDecoration(
                                color: const Color(0xFFF8FAFC),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: const Color(0xFFCBD5E1),
                                  style: BorderStyle.solid,
                                ),
                              ),
                              child: const Center(
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(Icons.add_photo_alternate_rounded, color: AppColors.pharmacyTeal, size: 22),
                                    SizedBox(width: 8),
                                    Text(
                                      'اضغط هنا لالتقاط أو إرفاق صورة الروشتة',
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                        color: AppColors.pharmacyTeal,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          )
                        else
                          Stack(
                            children: [
                              Container(
                                height: 110,
                                width: double.infinity,
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(12),
                                  image: DecorationImage(
                                    image: NetworkImage(_prescriptionImage),
                                    fit: BoxFit.cover,
                                  ),
                                ),
                              ),
                              Positioned(
                                top: 6,
                                left: 6,
                                child: GestureDetector(
                                  onTap: () => setState(() => _prescriptionImage = ''),
                                  child: Container(
                                    padding: const EdgeInsets.all(4),
                                    decoration: const BoxDecoration(
                                      color: Colors.black54,
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(Icons.close, color: Colors.white, size: 16),
                                  ),
                                ),
                              ),
                            ],
                          ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Customer Details Form
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'معلومات المريض للتواصل:',
                          style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                        ),
                        const SizedBox(height: 10),
                        TextField(
                          controller: _nameCtrl,
                          decoration: InputDecoration(
                            labelText: 'الاسم الكامل *',
                            prefixIcon: const Icon(Icons.person_outline, size: 20),
                            filled: true,
                            fillColor: const Color(0xFFF8FAFC),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          ),
                          style: const TextStyle(fontSize: 12.5),
                        ),
                        const SizedBox(height: 10),
                        TextField(
                          controller: _phoneCtrl,
                          keyboardType: TextInputType.phone,
                          decoration: InputDecoration(
                            labelText: 'رقم الهاتف *',
                            prefixIcon: const Icon(Icons.phone_outlined, size: 20),
                            filled: true,
                            fillColor: const Color(0xFFF8FAFC),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          ),
                          style: const TextStyle(fontSize: 12.5),
                        ),
                        const SizedBox(height: 10),
                        TextField(
                          controller: _notesCtrl,
                          decoration: InputDecoration(
                            labelText: 'ملاحظات إضافية للصيدلي (اختياري)',
                            prefixIcon: const Icon(Icons.notes_rounded, size: 20),
                            filled: true,
                            fillColor: const Color(0xFFF8FAFC),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          ),
                          style: const TextStyle(fontSize: 12.5),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Price Breakdown
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('مجموع الأدوية:', style: TextStyle(fontSize: 12.5, color: Color(0xFF64748B))),
                            Text('${_subtotal.toInt()} د.ج',
                                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('رسوم التوصيل:', style: TextStyle(fontSize: 12.5, color: Color(0xFF64748B))),
                            Text(
                              _deliveryFee == 0 ? 'مجاناً (استلام)' : '${_deliveryFee.toInt()} د.ج',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: _deliveryFee == 0 ? Colors.green : const Color(0xFF0F172A),
                              ),
                            ),
                          ],
                        ),
                        const Divider(height: 16, color: Color(0xFFE2E8F0)),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'المبلغ الإجمالي للدفع:',
                              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                            ),
                            Text(
                              '${_grandTotal.toInt()} د.ج',
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w900,
                                color: Color(0xFF0F766E),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Submit Button
                  ElevatedButton(
                    onPressed: _isSubmitting ? null : _submitOrder,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.pharmacyTeal,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      elevation: 2,
                    ),
                    child: _isSubmitting
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                          )
                        : const Text(
                            'تأكيد وإرسال طلب الدواء للصيدلية 💊',
                            style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                  ),

                  const SizedBox(height: 30),
                ],
              ),
      ),
    );
  }

  Widget _buildDeliveryOption({
    required String label,
    required IconData icon,
    required String value,
  }) {
    final isSel = _deliveryType == value;
    return GestureDetector(
      onTap: () => setState(() => _deliveryType = value),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
        decoration: BoxDecoration(
          color: isSel ? const Color(0xFFCCFBF1) : const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSel ? AppColors.pharmacyTeal : const Color(0xFFCBD5E1),
            width: isSel ? 1.5 : 1,
          ),
        ),
        child: Column(
          children: [
            Icon(icon, size: 20, color: isSel ? AppColors.pharmacyTeal : Colors.grey),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: isSel ? FontWeight.bold : FontWeight.w500,
                color: isSel ? const Color(0xFF0F766E) : const Color(0xFF475569),
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyCart() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 70,
            height: 70,
            decoration: const BoxDecoration(
              color: Color(0xFFF1F5F9),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.shopping_bag_outlined, size: 36, color: Colors.grey),
          ),
          const SizedBox(height: 14),
          const Text(
            'سلة مشتريات الأدوية فارغة',
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF334155)),
          ),
          const SizedBox(height: 6),
          const Text(
            'تصفح الصيدليات وابحث عن الأدوية لإضافتها هنا',
            style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
          ),
        ],
      ),
    );
  }
}
