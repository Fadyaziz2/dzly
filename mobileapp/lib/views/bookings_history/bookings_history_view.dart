import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../controllers/booking_controller.dart';
import '../../core/theme/app_colors.dart';
import '../../models/booking_model.dart';

class BookingsHistoryView extends StatelessWidget {
  const BookingsHistoryView({super.key});

  @override
  Widget build(BuildContext context) {
    final bookingCtrl = context.watch<BookingController>();

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: const Color(0xFFF8FAFC),
        appBar: AppBar(
          backgroundColor: const Color(0xFF0D6EFD),
          elevation: 0,
          centerTitle: true,
          title: const Text(
            'حجوزاتي',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
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
            labelStyle: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
            tabs: [
              Tab(text: 'الحجوزات الحالية'),
              Tab(text: 'السجل السابق'),
            ],
          ),
        ),
        body: RefreshIndicator(
          onRefresh: () => bookingCtrl.fetchMyBookings(),
          child: TabBarView(
            children: [
              _buildList(context, bookingCtrl.activeBookings, isActive: true),
              _buildList(context, bookingCtrl.pastBookings, isActive: false),
            ],
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
                        const Icon(Icons.confirmation_number_outlined,
                            size: 16, color: Color(0xFF0D6EFD)),
                        const SizedBox(width: 6),
                        Text(
                          '#${b.bookingCode.isNotEmpty ? b.bookingCode : b.id.substring(0, 8)}',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF0D6EFD),
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(statusIcon, color: statusColor, size: 14),
                          const SizedBox(width: 4),
                          Text(
                            statusLabel,
                            style: TextStyle(
                              color: statusColor,
                              fontWeight: FontWeight.bold,
                              fontSize: 11.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              // المحتوى الداخلي
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      b.serviceTitle,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                        color: Color(0xFF0F172A),
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.event_rounded, size: 16, color: Color(0xFF64748B)),
                        const SizedBox(width: 6),
                        Text(
                          '${b.date} • ${b.timeSlot}',
                          style: const TextStyle(
                            color: Color(0xFF475569),
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    const Divider(height: 1, color: Color(0xFFF1F5F9)),
                    const SizedBox(height: 10),
                    // السعر وزر الإلغاء
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'المبلغ الإجمالي',
                              style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
                            ),
                            Text(
                              '${b.totalPrice.toStringAsFixed(0)} د.ج',
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF0F172A),
                              ),
                            ),
                          ],
                        ),
                        if (isActive && !isCancelled && !isRejected)
                          OutlinedButton.icon(
                            style: OutlinedButton.styleFrom(
                              foregroundColor: const Color(0xFFEF4444),
                              side: const BorderSide(color: Color(0xFFFCA5A5)),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            ),
                            onPressed: () => context.read<BookingController>().cancelBooking(b.id),
                            icon: const Icon(Icons.cancel_outlined, size: 16),
                            label: const Text(
                              'إلغاء الحجز',
                              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
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
