import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../controllers/booking_controller.dart';
import '../../core/theme/app_colors.dart';
import '../../models/booking_model.dart';
import '../../models/pharmacy_model.dart';

class BookingsHistoryView extends StatelessWidget {
  const BookingsHistoryView({super.key});

  @override
  Widget build(BuildContext context) {
    final bookingCtrl = context.watch<BookingController>();

    return Directionality(
      textDirection: TextDirection.rtl,
      child: DefaultTabController(
        length: 3,
        child: Scaffold(
          backgroundColor: const Color(0xFFF8FAFC),
          appBar: AppBar(
            backgroundColor: const Color(0xFF0D6EFD),
            elevation: 0,
            centerTitle: true,
            title: const Text(
              'حجوزاتي وطلباتي',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17, color: Colors.white),
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.refresh_rounded, color: Colors.white),
                onPressed: () => bookingCtrl.fetchMyBookings(),
              ),
            ],
            bottom: const TabBar(
              indicatorColor: AppColors.accentYellow,
              indicatorWeight: 3,
              labelStyle: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
              tabs: [
                Tab(text: 'الحجوزات الحالية'),
                Tab(text: 'طلبات الأدوية 💊'),
                Tab(text: 'السجل السابق'),
              ],
            ),
          ),
          body: RefreshIndicator(
            onRefresh: () => bookingCtrl.fetchMyBookings(),
            child: TabBarView(
              children: [
                _buildList(context, bookingCtrl.activeBookings, isActive: true),
                _buildPharmacyOrdersList(context, bookingCtrl.pharmacyOrders),
                _buildList(context, bookingCtrl.pastBookings, isActive: false),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildList(BuildContext context, List<BookingModel> list, {required bool isActive}) {
    if (list.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.calendar_month_outlined, size: 72, color: Colors.grey.shade300),
            const SizedBox(height: 14),
            Text(
              isActive ? 'لا توجد حجوزات نشطة حالياً' : 'سجل الحجوزات السابق فارغ',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Color(0xFF64748B),
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'تصفح الأقسام واحجز خدمتك المفضلة الآن',
              style: TextStyle(fontSize: 12.5, color: Color(0xFF94A3B8)),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.all(16),
      itemCount: list.length,
      itemBuilder: (context, index) {
        final b = list[index];
        final isCancelled = b.status == BookingStatus.cancelled;
        final isRejected = b.status == BookingStatus.rejected;
        final isPending = b.status == BookingStatus.pending;

        String statusLabel = 'مؤكد';
        Color statusColor = const Color(0xFF10B981);
        IconData statusIcon = Icons.check_circle_rounded;

        if (isPending) {
          statusLabel = 'بانتظار التأكيد';
          statusColor = const Color(0xFFF59E0B);
          statusIcon = Icons.hourglass_top_rounded;
        } else if (isCancelled) {
          statusLabel = 'ملغي';
          statusColor = const Color(0xFFEF4444);
          statusIcon = Icons.cancel_rounded;
        } else if (isRejected) {
          statusLabel = 'مرفوض';
          statusColor = const Color(0xFFEF4444);
          statusIcon = Icons.error_rounded;
        } else if (b.status == BookingStatus.completed) {
          statusLabel = 'مكتمل';
          statusColor = const Color(0xFF64748B);
          statusIcon = Icons.task_alt_rounded;
        }

        return Container(
          margin: const EdgeInsets.only(bottom: 14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(18),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.04),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // الرأس: رقم الحجز والحالة
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                decoration: const BoxDecoration(
                  color: Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.vertical(top: Radius.circular(18)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.confirmation_number_outlined, size: 16, color: Color(0xFF64748B)),
                        const SizedBox(width: 6),
                        Text(
                          b.bookingCode,
                          style: const TextStyle(
                            fontFamily: 'Courier',
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                            color: Color(0xFF1E293B),
                          ),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(statusIcon, size: 14, color: statusColor),
                          const SizedBox(width: 4),
                          Text(
                            statusLabel,
                            style: TextStyle(
                              color: statusColor,
                              fontSize: 11.5,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              // التفاصيل
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      b.serviceTitle,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF0F172A),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.calendar_today_rounded, size: 14, color: Color(0xFF94A3B8)),
                        const SizedBox(width: 6),
                        Text(
                          '${b.date} • ${b.timeSlot}',
                          style: const TextStyle(fontSize: 12.5, color: Color(0xFF64748B)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        const Icon(Icons.location_on_outlined, size: 15, color: Color(0xFF94A3B8)),
                        const SizedBox(width: 6),
                        Text(
                          b.city,
                          style: const TextStyle(fontSize: 12.5, color: Color(0xFF64748B)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    const Divider(height: 1, color: Color(0xFFF1F5F9)),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'المبلغ الإجمالي:',
                          style: TextStyle(fontSize: 12.5, color: Color(0xFF64748B)),
                        ),
                        Text(
                          '${b.totalPrice.toInt()} د.ج',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFF0D6EFD),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildPharmacyOrdersList(BuildContext context, List<PharmacyOrderModel> orders) {
    if (orders.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 70,
              height: 70,
              decoration: const BoxDecoration(
                color: Color(0xFFF0FDFA),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.local_pharmacy_rounded, size: 36, color: AppColors.pharmacyTeal),
            ),
            const SizedBox(height: 14),
            const Text(
              'لا توجد طلبات أدوية مسجلة بعد',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF334155)),
            ),
            const SizedBox(height: 6),
            const Text(
              'اطلب أدويتك من أقرب صيدلية في الوادي وتابع حالتها هنا',
              style: TextStyle(fontSize: 12.5, color: Color(0xFF64748B)),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.all(16),
      itemCount: orders.length,
      itemBuilder: (context, index) {
        final o = orders[index];

        String statusLabel = 'بانتظار الصيدلية';
        Color statusColor = const Color(0xFFF59E0B);
        IconData statusIcon = Icons.hourglass_top_rounded;

        switch (o.status) {
          case 'accepted':
          case 'preparing':
            statusLabel = 'قيد التجهيز بالصيدلية';
            statusColor = const Color(0xFF0284C7);
            statusIcon = Icons.inventory_2_rounded;
            break;
          case 'ready_for_pickup':
            statusLabel = 'جاهز للاستلام 🛍️';
            statusColor = const Color(0xFF7C3AED);
            statusIcon = Icons.check_circle_outline;
            break;
          case 'out_for_delivery':
            statusLabel = 'جاري التوصيل 🛵';
            statusColor = const Color(0xFF0D9488);
            statusIcon = Icons.moped_rounded;
            break;
          case 'completed':
            statusLabel = 'مكتمل ومستلم ✅';
            statusColor = const Color(0xFF10B981);
            statusIcon = Icons.task_alt_rounded;
            break;
          case 'rejected':
            statusLabel = 'اعتذر الصيدلي';
            statusColor = const Color(0xFFEF4444);
            statusIcon = Icons.cancel_rounded;
            break;
        }

        return Container(
          margin: const EdgeInsets.only(bottom: 14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(18),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.04),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                decoration: const BoxDecoration(
                  color: Color(0xFFF0FDFA),
                  borderRadius: BorderRadius.vertical(top: Radius.circular(18)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.receipt_long_rounded, size: 16, color: AppColors.pharmacyTeal),
                        const SizedBox(width: 6),
                        Text(
                          o.orderCode,
                          style: const TextStyle(
                            fontFamily: 'Courier',
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                            color: Color(0xFF0F766E),
                          ),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(statusIcon, size: 14, color: statusColor),
                          const SizedBox(width: 4),
                          Text(
                            statusLabel,
                            style: TextStyle(
                              color: statusColor,
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              // Body
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.local_pharmacy_rounded, color: AppColors.pharmacyTeal, size: 18),
                        const SizedBox(width: 8),
                        Text(
                          o.pharmacyName,
                          style: const TextStyle(
                            fontSize: 14.5,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF0F172A),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'الأصناف المطلوبة:',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF64748B)),
                          ),
                          const SizedBox(height: 4),
                          ...o.items.map((it) => Padding(
                                padding: const EdgeInsets.only(bottom: 2),
                                child: Text(
                                  '• ${it.name} (${it.quantity} علبة)',
                                  style: const TextStyle(fontSize: 12, color: Color(0xFF334155)),
                                ),
                              )),
                        ],
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Icon(
                          o.deliveryType == 'delivery' ? Icons.moped_rounded : Icons.store_rounded,
                          size: 15,
                          color: const Color(0xFF64748B),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          o.deliveryType == 'delivery'
                              ? 'توصيل منزلي: ${o.deliveryAddress}'
                              : 'استلام مباشر من الصيدلية',
                          style: const TextStyle(fontSize: 11.5, color: Color(0xFF64748B)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    const Divider(height: 1, color: Color(0xFFF1F5F9)),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'المبلغ الإجمالي:',
                          style: TextStyle(fontSize: 12.5, color: Color(0xFF64748B)),
                        ),
                        Text(
                          '${o.totalPrice.toInt()} د.ج',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                            color: AppColors.pharmacyTeal,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
