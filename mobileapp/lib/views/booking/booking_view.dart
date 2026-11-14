import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../controllers/auth_controller.dart';
import '../../controllers/booking_controller.dart';
import '../../controllers/navigation_controller.dart';
import '../../core/theme/app_colors.dart';
import '../../models/service_model.dart';

class BookingView extends StatefulWidget {
  final ServiceModel service;

  const BookingView({super.key, required this.service});

  @override
  State<BookingView> createState() => _BookingViewState();
}

class _BookingViewState extends State<BookingView> {
  final _formKey = GlobalKey<FormState>();

  late TextEditingController _nameCtrl;
  late TextEditingController _phoneCtrl;
  final TextEditingController _notesCtrl = TextEditingController();

  // General Date & Time
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 2));
  final String _selectedSlot = 'الفترة المسائية';

  // CARS Dynamic Fields
  String _carModel = 'سيدان سياحية (Renault Symbol / Dacia Logan)';
  int _rentalDays = 2;
  bool _withDriver = false;
  final TextEditingController _pickupLocationCtrl =
      TextEditingController(text: 'مطار الجزائر أو مقر الوكالة');
  final TextEditingController _dropoffLocationCtrl =
      TextEditingController(text: 'مقر الوكالة أو المطار');
  bool _licenseAttached = true;

  // BEAUTY Dynamic Fields
  String _beautySubService = 'باقة تجهيز عرائس ملكية';
  final TextEditingController _specialistCtrl =
      TextEditingController(text: 'أي خبير متاح');
  TimeOfDay _beautyTime = const TimeOfDay(hour: 11, minute: 0);
  int _personsCount = 1;

  // FARMS & POOLS Dynamic Fields
  String _farmBookingType = 'عائلي حصراً (Families Only)';
  int _guestCount = 12;
  String _farmPeriod = 'يوم كامل مع مبيت (24 ساعة)';
  final List<String> _additionalServices = ['تجهيز عتاد وموقد الشواء والفحم'];

  // WEDDINGS & HALLS Dynamic Fields
  String _eventType = 'حفل زفاف ملكي (عرس)';
  int _approximateGuests = 250;
  String _cateringPackage =
      'باقة العشاء الكاملة (طواجن، كسكسي، مشويات، سلطات، فواكه)';
  final String _hallPeriod = 'فترة المساء والسهرة (19:00 إلى 01:00)';

  // HOTELS & HOUSES Dynamic Fields
  DateTime _checkInDate = DateTime.now().add(const Duration(days: 2));
  DateTime _checkOutDate = DateTime.now().add(const Duration(days: 5));
  int _adultsCount = 2;
  int _childrenCount = 1;
  String _roomType = 'جناح عائلي Family Suite';

  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    final authUser = context.read<AuthController>().user;
    _nameCtrl = TextEditingController(text: authUser?.name ?? 'أحمد بن علي');
    _phoneCtrl = TextEditingController(text: authUser?.phone ?? '0661234567');
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _phoneCtrl.dispose();
    _notesCtrl.dispose();
    _pickupLocationCtrl.dispose();
    _dropoffLocationCtrl.dispose();
    _specialistCtrl.dispose();
    super.dispose();
  }

  // Live Price Calculation based on section dynamic fields
  double get _calculatedTotalPrice {
    final cat = widget.service.categoryId;
    final basePrice = widget.service.discountedPrice;

    if (cat == 'cars') {
      final daily = basePrice + (_withDriver ? 3000 : 0);
      return daily * _rentalDays;
    } else if (cat == 'hotels' || cat == 'houses') {
      final nights = _checkOutDate.difference(_checkInDate).inDays;
      return basePrice * (nights > 0 ? nights : 1);
    } else if (cat == 'beauty') {
      return basePrice * _personsCount;
    } else if (cat == 'farms' || cat == 'pools') {
      double extra = _additionalServices.length * 3000;
      return basePrice + extra;
    } else if (cat == 'weddings' || cat == 'farms_halls') {
      return basePrice;
    }
    return basePrice;
  }

  Map<String, dynamic> _collectDynamicFields() {
    final cat = widget.service.categoryId;
    if (cat == 'cars') {
      return {
        'carModel': _carModel,
        'rentalDays': _rentalDays,
        'withDriver': _withDriver,
        'pickupLocation': _pickupLocationCtrl.text.trim(),
        'dropoffLocation': _dropoffLocationCtrl.text.trim(),
        'licenseDocument': _licenseAttached ? 'license_uploaded.pdf' : '',
      };
    } else if (cat == 'beauty') {
      return {
        'subService': _beautySubService,
        'specialistName': _specialistCtrl.text.trim(),
        'timeSlot':
            '${_beautyTime.hour.toString().padLeft(2, '0')}:${_beautyTime.minute.toString().padLeft(2, '0')}',
        'personsCount': _personsCount,
      };
    } else if (cat == 'farms' || cat == 'pools') {
      return {
        'bookingType': _farmBookingType,
        'guestCount': _guestCount,
        'period': _farmPeriod,
        'additionalServices': _additionalServices,
      };
    } else if (cat == 'weddings' || cat == 'farms_halls') {
      return {
        'eventType': _eventType,
        'approximateGuests': _approximateGuests,
        'cateringPackage': _cateringPackage,
        'period': _hallPeriod,
      };
    } else if (cat == 'hotels' || cat == 'houses') {
      return {
        'checkInDate':
            '${_checkInDate.year}-${_checkInDate.month.toString().padLeft(2, '0')}-${_checkInDate.day.toString().padLeft(2, '0')}',
        'checkOutDate':
            '${_checkOutDate.year}-${_checkOutDate.month.toString().padLeft(2, '0')}-${_checkOutDate.day.toString().padLeft(2, '0')}',
        'adultsCount': _adultsCount,
        'childrenCount': _childrenCount,
        'unitOrRoomType': _roomType,
      };
    }
    return {};
  }

  Future<void> _pickGeneralDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked != null) setState(() => _selectedDate = picked);
  }

  Future<void> _pickHotelDates() async {
    final pickedRange = await showDateRangePicker(
      context: context,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      initialDateRange: DateTimeRange(start: _checkInDate, end: _checkOutDate),
    );
    if (pickedRange != null) {
      setState(() {
        _checkInDate = pickedRange.start;
        _checkOutDate = pickedRange.end;
      });
    }
  }

  Future<void> _pickBeautyTime() async {
    final picked = await showTimePicker(
      context: context,
      initialTime: _beautyTime,
    );
    if (picked != null) setState(() => _beautyTime = picked);
  }

  Future<void> _submitBooking() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);

    final formattedDate = (widget.service.categoryId == 'hotels' ||
            widget.service.categoryId == 'houses')
        ? '${_checkInDate.year}-${_checkInDate.month.toString().padLeft(2, '0')}-${_checkInDate.day.toString().padLeft(2, '0')}'
        : '${_selectedDate.year}-${_selectedDate.month.toString().padLeft(2, '0')}-${_selectedDate.day.toString().padLeft(2, '0')}';

    final dynamicFields = _collectDynamicFields();

    final booking = await context.read<BookingController>().submitDynamicBooking(
          service: widget.service,
          date: formattedDate,
          timeSlot: _selectedSlot,
          customerName: _nameCtrl.text.trim(),
          customerPhone: _phoneCtrl.text.trim(),
          customerNotes: _notesCtrl.text.trim(),
          dynamicFields: dynamicFields,
          customPrice: _calculatedTotalPrice,
        );

    setState(() => _isSubmitting = false);

    if (!mounted) return;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.green.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.check_circle_rounded, color: Colors.green, size: 54),
            ),
            const SizedBox(height: 12),
            const Text(
              'تم إرسال طلب الحجز بنجاح!',
              textAlign: TextAlign.center,
              style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('رقم الحجز: #${booking.bookingCode}',
                      style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primaryBlue)),
                  const SizedBox(height: 4),
                  Text('الخدمة: ${booking.serviceTitle}'),
                  Text('المبلغ الإجمالي: ${booking.totalPrice.toStringAsFixed(0)} د.ج'),
                  Text('القسم: ${widget.service.categoryId}'),
                ],
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              'طلبك قيد المراجعة الفورية من قبل مزود الخدمة لتأكيد الموعد.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 12, color: AppColors.textGrey),
            ),
          ],
        ),
        actions: [
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryBlue,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              onPressed: () {
                Navigator.of(context).popUntil((route) => route.isFirst);
                context.read<NavigationController>().setIndex(1);
              },
              child: const Text('الذهاب إلى حجوزاتي',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: widget.service.accentColor,
        elevation: 0,
        title: Text(
          'حجز: ${widget.service.title}',
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Service Summary Banner
              _buildServiceSummaryCard(),
              const SizedBox(height: 16),

              if (widget.service.categoryId != 'hotels' &&
                  widget.service.categoryId != 'houses') ...[
                _buildGeneralDateCard(),
                const SizedBox(height: 16),
              ],

              // SECTION-SPECIFIC DYNAMIC FORM BUILDER
              _buildSectionSpecificFields(),
              const SizedBox(height: 20),

              // Contact Information
              _buildContactFields(),
              const SizedBox(height: 20),

              // Price Summary Card
              _buildPriceSummaryCard(),
              const SizedBox(height: 24),

              // Submit Button
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: widget.service.accentColor,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  onPressed: _isSubmitting ? null : _submitBooking,
                  child: _isSubmitting
                      ? const CircularProgressIndicator(color: Colors.white)
                      : Text(
                          'تأكيد وإرسال الحجز (${_calculatedTotalPrice.toStringAsFixed(0)} د.ج)',
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                ),
              ),
              const SizedBox(height: 30),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildGeneralDateCard() {
    return ListTile(
      tileColor: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      leading: const Icon(Icons.calendar_today_rounded, color: AppColors.primaryBlue),
      title: const Text('تاريخ بدء الحجز', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
      subtitle: Text(
        '${_selectedDate.year}/${_selectedDate.month.toString().padLeft(2, '0')}/${_selectedDate.day.toString().padLeft(2, '0')}',
        style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primaryBlue),
      ),
      trailing: const Text('تغيير', style: TextStyle(color: AppColors.primaryBlue, fontWeight: FontWeight.bold, fontSize: 12)),
      onTap: _pickGeneralDate,
    );
  }

  Widget _buildServiceSummaryCard() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10),
        ],
      ),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(14),
            child: Image.asset(widget.service.imageAsset,
                width: 70, height: 70, fit: BoxFit.cover),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(widget.service.title,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                const SizedBox(height: 2),
                Text('ولاية ${widget.service.city} • ${widget.service.address}',
                    style: const TextStyle(color: AppColors.textGrey, fontSize: 12)),
                const SizedBox(height: 4),
                Text(
                  '${widget.service.discountedPrice.toStringAsFixed(0)} ${widget.service.priceUnit}',
                  style: TextStyle(
                      color: widget.service.accentColor, fontWeight: FontWeight.w900, fontSize: 14),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // DYNAMIC SECTION BUILDER
  Widget _buildSectionSpecificFields() {
    final cat = widget.service.categoryId;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: widget.service.accentColor.withOpacity(0.2)),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 8),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.tune_rounded, color: widget.service.accentColor, size: 20),
              const SizedBox(width: 8),
              Text(
                'متطلبات حجز قسم (${cat.toUpperCase()})',
                style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15),
              ),
            ],
          ),
          const Divider(height: 24),
          if (cat == 'cars') _buildCarsFields(),
          if (cat == 'beauty') _buildBeautyFields(),
          if (cat == 'farms' || cat == 'pools') _buildFarmsPoolsFields(),
          if (cat == 'weddings' || cat == 'farms_halls') _buildWeddingsFields(),
          if (cat == 'hotels' || cat == 'houses') _buildHotelsHousesFields(),
        ],
      ),
    );
  }

  // 1. CARS FIELDS
  Widget _buildCarsFields() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('موديل وفئة السيارة المطلوبة', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
        const SizedBox(height: 6),
        DropdownButtonFormField<String>(
          value: _carModel,
          decoration: _inputDecoration('اختر الموديل'),
          items: const [
            DropdownMenuItem(value: 'سيدان سياحية (Renault Symbol / Dacia Logan)', child: Text('سيدان سياحية (Symbol / Logan)')),
            DropdownMenuItem(value: 'فاخرة للأعراس (Mercedes E-Class)', child: Text('فاخرة للأعراس (Mercedes E-Class)')),
            DropdownMenuItem(value: 'دفع رباعي SUV (Hyundai Tucson)', child: Text('دفع رباعي SUV (Tucson / Sportage)')),
            DropdownMenuItem(value: 'اقتصادية (Seat Ibiza / Picanto)', child: Text('اقتصادية (Seat Ibiza / Picanto)')),
          ],
          onChanged: (v) => setState(() => _carModel = v!),
        ),
        const SizedBox(height: 14),
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('مدة الإيجار (بالأيام)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      IconButton(
                        onPressed: () {
                          if (_rentalDays > 1) setState(() => _rentalDays--);
                        },
                        icon: const Icon(Icons.remove_circle_outline),
                      ),
                      Text('$_rentalDays أيام', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
                      IconButton(
                        onPressed: () => setState(() => _rentalDays++),
                        icon: const Icon(Icons.add_circle_outline),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Expanded(
              child: SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('طلب سائق خاص', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                subtitle: const Text('+3,000 د.ج / يوم', style: TextStyle(fontSize: 11, color: Colors.blue)),
                value: _withDriver,
                activeColor: widget.service.accentColor,
                onChanged: (v) => setState(() => _withDriver = v),
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),
        TextFormField(
          controller: _pickupLocationCtrl,
          decoration: _inputDecoration('مكان استلام المركبة (مطار / مقر الوكالة)'),
        ),
        const SizedBox(height: 10),
        TextFormField(
          controller: _dropoffLocationCtrl,
          decoration: _inputDecoration('مكان تسليم المركبة عند انتهاء المدة'),
        ),
        const SizedBox(height: 10),
        CheckboxListTile(
          contentPadding: EdgeInsets.zero,
          title: const Text('إرفاق صورة رخصة القيادة والهوية الوطنية', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12.5)),
          value: _licenseAttached,
          onChanged: (v) => setState(() => _licenseAttached = v ?? true),
        ),
      ],
    );
  }

  // 2. BEAUTY FIELDS
  Widget _buildBeautyFields() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('الخدمة الفرعية المختارة', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
        const SizedBox(height: 6),
        DropdownButtonFormField<String>(
          value: _beautySubService,
          decoration: _inputDecoration('اختر الباقة'),
          items: const [
            DropdownMenuItem(value: 'باقة تجهيز عرائس ملكية', child: Text('باقة تجهيز عرائس ملكية')),
            DropdownMenuItem(value: 'قص وتسريح شعر ومكياج', child: Text('قص وتسريح شعر ومكياج')),
            DropdownMenuItem(value: 'جلسة تنظيف بشرة عميق HydraFacial', child: Text('تنظيف بشرة HydraFacial')),
            DropdownMenuItem(value: 'حلاقة VIP وسشوار رجالي', child: Text('حلاقة VIP وسشوار رجالي')),
          ],
          onChanged: (v) => setState(() => _beautySubService = v!),
        ),
        const SizedBox(height: 14),
        Row(
          children: [
            Expanded(
              child: ListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('ساعة الموعد الدقيقة', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12.5)),
                subtitle: Text(_beautyTime.format(context),
                    style: TextStyle(fontWeight: FontWeight.w900, color: widget.service.accentColor)),
                trailing: const Icon(Icons.access_time_rounded),
                onTap: _pickBeautyTime,
              ),
            ),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('عدد المستفيدين', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12.5)),
                  Row(
                    children: [
                      IconButton(
                        onPressed: () {
                          if (_personsCount > 1) setState(() => _personsCount--);
                        },
                        icon: const Icon(Icons.remove_circle_outline),
                      ),
                      Text('$_personsCount فرد', style: const TextStyle(fontWeight: FontWeight.bold)),
                      IconButton(
                        onPressed: () => setState(() => _personsCount++),
                        icon: const Icon(Icons.add_circle_outline),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        TextFormField(
          controller: _specialistCtrl,
          decoration: _inputDecoration('اسم الموظف / المختص المفضل (اختياري)'),
        ),
      ],
    );
  }

  // 3. FARMS & POOLS FIELDS
  Widget _buildFarmsPoolsFields() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('نوع الحجز', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
        const SizedBox(height: 6),
        DropdownButtonFormField<String>(
          value: _farmBookingType,
          decoration: _inputDecoration('طبيعة الحجز'),
          items: const [
            DropdownMenuItem(value: 'عائلي حصراً (Families Only)', child: Text('عائلي حصراً (Families Only)')),
            DropdownMenuItem(value: 'شبابي / أصدقاء (Youth Group)', child: Text('شبابي / أصدقاء (Youth Group)')),
          ],
          onChanged: (v) => setState(() => _farmBookingType = v!),
        ),
        const SizedBox(height: 14),
        const Text('فترة الحجز', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
        const SizedBox(height: 6),
        DropdownButtonFormField<String>(
          value: _farmPeriod,
          decoration: _inputDecoration('الفترة'),
          items: const [
            DropdownMenuItem(value: 'الفترة الصباحية (09:00 إلى 17:00)', child: Text('فترة صباحية (09:00 - 17:00)')),
            DropdownMenuItem(value: 'الفترة المسائية (18:00 إلى 23:30)', child: Text('فترة مسائية (18:00 - 23:30)')),
            DropdownMenuItem(value: 'يوم كامل مع مبيت (24 ساعة)', child: Text('يوم كامل مع مبيت (24 ساعة)')),
          ],
          onChanged: (v) => setState(() => _farmPeriod = v!),
        ),
        const SizedBox(height: 14),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('عدد الضيوف أو السباحين:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            Row(
              children: [
                IconButton(
                  onPressed: () {
                    if (_guestCount > 2) setState(() => _guestCount -= 2);
                  },
                  icon: const Icon(Icons.remove_circle_outline),
                ),
                Text('$_guestCount شخص', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15)),
                IconButton(
                  onPressed: () => setState(() => _guestCount += 2),
                  icon: const Icon(Icons.add_circle_outline),
                ),
              ],
            ),
          ],
        ),
        const SizedBox(height: 8),
        CheckboxListTile(
          contentPadding: EdgeInsets.zero,
          title: const Text('توفير عتاد الشواء والفحم وإشعال النار (+3,000 د.ج)', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold)),
          value: _additionalServices.contains('تجهيز عتاد وموقد الشواء والفحم'),
          onChanged: (v) {
            setState(() {
              if (v == true) {
                _additionalServices.add('تجهيز عتاد وموقد الشواء والفحم');
              } else {
                _additionalServices.remove('تجهيز عتاد وموقد الشواء والفحم');
              }
            });
          },
        ),
      ],
    );
  }

  // 4. WEDDINGS & HALLS FIELDS
  Widget _buildWeddingsFields() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('نوع المناسبة', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
        const SizedBox(height: 6),
        DropdownButtonFormField<String>(
          value: _eventType,
          decoration: _inputDecoration('المناسبة'),
          items: const [
            DropdownMenuItem(value: 'حفل زفاف ملكي (عرس)', child: Text('حفل زفاف ملكي (عرس)')),
            DropdownMenuItem(value: 'حفل خطوبة وقراءة فاتحة', child: Text('حفل خطوبة وقراءة فاتحة')),
            DropdownMenuItem(value: 'مأدبة عشاء عائلية', child: Text('مأدبة عشاء عائلية')),
            DropdownMenuItem(value: 'ندوة أو مؤتمر', child: Text('ندوة أو مؤتمر')),
          ],
          onChanged: (v) => setState(() => _eventType = v!),
        ),
        const SizedBox(height: 14),
        const Text('باقة الضيافة والإطعام', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
        const SizedBox(height: 6),
        DropdownButtonFormField<String>(
          value: _cateringPackage,
          decoration: _inputDecoration('باقة الإطعام'),
          items: const [
            DropdownMenuItem(
              value: 'باقة العشاء الكاملة (طواجن، كسكسي، مشويات، سلطات، فواكه)',
              child: Text('باقة العشاء الجزائري الكاملة'),
            ),
            DropdownMenuItem(
              value: 'باقة الشاي والحلويات والمشروبات',
              child: Text('باقة الشاي والحلويات التقليدية'),
            ),
            DropdownMenuItem(
              value: 'القاعة فقط بدون خدمات طعام',
              child: Text('القاعة فقط بدون إطعام'),
            ),
          ],
          onChanged: (v) => setState(() => _cateringPackage = v!),
        ),
        const SizedBox(height: 14),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('عدد المدعوين التقريبي:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            Row(
              children: [
                IconButton(
                  onPressed: () {
                    if (_approximateGuests > 50) setState(() => _approximateGuests -= 50);
                  },
                  icon: const Icon(Icons.remove_circle_outline),
                ),
                Text('$_approximateGuests مدعو', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15)),
                IconButton(
                  onPressed: () => setState(() => _approximateGuests += 50),
                  icon: const Icon(Icons.add_circle_outline),
                ),
              ],
            ),
          ],
        ),
      ],
    );
  }

  // 5. HOTELS & HOUSES FIELDS
  Widget _buildHotelsHousesFields() {
    final nights = _checkOutDate.difference(_checkInDate).inDays;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ListTile(
          contentPadding: EdgeInsets.zero,
          leading: const Icon(Icons.date_range_rounded, color: AppColors.primaryBlue),
          title: const Text('تاريخ الدخول والمغادرة (Check-in & Check-out)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
          subtitle: Text(
            'من ${_checkInDate.year}/${_checkInDate.month}/${_checkInDate.day} إلى ${_checkOutDate.year}/${_checkOutDate.month}/${_checkOutDate.day} ($nights ليالي)',
            style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primaryBlue),
          ),
          trailing: const Text('تغيير', style: TextStyle(color: AppColors.primaryBlue, fontWeight: FontWeight.bold)),
          onTap: _pickHotelDates,
        ),
        const SizedBox(height: 10),
        const Text('نوع الغرفة أو الوحدة السكنية', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
        const SizedBox(height: 6),
        DropdownButtonFormField<String>(
          value: _roomType,
          decoration: _inputDecoration('نوع الوحدة'),
          items: const [
            DropdownMenuItem(value: 'جناح عائلي Family Suite', child: Text('جناح عائلي Family Suite')),
            DropdownMenuItem(value: 'غرفة مزدوجة Double / Twin', child: Text('غرفة مزدوجة Double / Twin')),
            DropdownMenuItem(value: 'شقة F3 واسعة للعائلات', child: Text('شقة F3 واسعة للعائلات')),
            DropdownMenuItem(value: 'فيلا طابقين مع حديقة ومرآب', child: Text('فيلا طابقين مع حديقة ومرآب')),
          ],
          onChanged: (v) => setState(() => _roomType = v!),
        ),
        const SizedBox(height: 14),
        Row(
          children: [
            Expanded(
              child: Row(
                children: [
                  const Text('البالغين: ', style: TextStyle(fontWeight: FontWeight.bold)),
                  IconButton(
                    onPressed: () {
                      if (_adultsCount > 1) setState(() => _adultsCount--);
                    },
                    icon: const Icon(Icons.remove_circle_outline, size: 20),
                  ),
                  Text('$_adultsCount', style: const TextStyle(fontWeight: FontWeight.w900)),
                  IconButton(
                    onPressed: () => setState(() => _adultsCount++),
                    icon: const Icon(Icons.add_circle_outline, size: 20),
                  ),
                ],
              ),
            ),
            Expanded(
              child: Row(
                children: [
                  const Text('الأطفال: ', style: TextStyle(fontWeight: FontWeight.bold)),
                  IconButton(
                    onPressed: () {
                      if (_childrenCount > 0) setState(() => _childrenCount--);
                    },
                    icon: const Icon(Icons.remove_circle_outline, size: 20),
                  ),
                  Text('$_childrenCount', style: const TextStyle(fontWeight: FontWeight.w900)),
                  IconButton(
                    onPressed: () => setState(() => _childrenCount++),
                    icon: const Icon(Icons.add_circle_outline, size: 20),
                  ),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildContactFields() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 8),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('معلومات التواصل والاتصال', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15)),
          const SizedBox(height: 12),
          TextFormField(
            controller: _nameCtrl,
            decoration: _inputDecoration('الاسم الكامل للعميل'),
            validator: (v) => (v == null || v.isEmpty) ? 'يرجى إدخال الاسم' : null,
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: _phoneCtrl,
            keyboardType: TextInputType.phone,
            decoration: _inputDecoration('رقم الهاتف للتواصل وتأكيد الحجز'),
            validator: (v) => (v == null || v.length < 9) ? 'يرجى إدخال رقم هاتف صحيح' : null,
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: _notesCtrl,
            decoration: _inputDecoration('ملاحظات إضافية لمزود الخدمة (اختياري)'),
          ),
        ],
      ),
    );
  }

  Widget _buildPriceSummaryCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFEFF6FF),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.primaryBlue.withOpacity(0.2)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('المبلغ الإجمالي المحسوب:', style: TextStyle(color: AppColors.textGrey, fontSize: 12.5)),
              Text('شامل كافة الخيارات الإضافية', style: TextStyle(fontSize: 10.5, color: AppColors.primaryBlue)),
            ],
          ),
          Text(
            '${_calculatedTotalPrice.toStringAsFixed(0)} د.ج',
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w900,
              color: AppColors.primaryBlue,
            ),
          ),
        ],
      ),
    );
  }

  InputDecoration _inputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      filled: true,
      fillColor: const Color(0xFFF8FAFC),
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
    );
  }
}
