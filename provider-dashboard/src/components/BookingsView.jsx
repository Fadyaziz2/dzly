import React, { useState, useEffect } from 'react';
import api from '../api/api';
import {
  CalendarCheck,
  CheckCircle,
  XCircle,
  Clock,
  Check,
  Eye,
  X,
  RefreshCw,
  Phone,
  FileText,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';

export default function BookingsView({ subscriptionStatus, onRefreshSubscription }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Reject Modal State
  const [rejectingBooking, setRejectingBooking] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const hasActive = subscriptionStatus?.hasActiveSubscription;

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings/provider-bookings');
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (bookingId, status, reason = '') => {
    if (!hasActive) {
      alert('لا يمكنك اتخاذ هذا الإجراء لأن اشتراكك منتهٍ أو غير مفعل. يرجى تجديد الاشتراك أولاً.');
      return;
    }

    setProcessing(true);
    try {
      await api.patch(`/bookings/${bookingId}/status`, {
        status,
        rejectionReason: reason,
      });
      alert(`تم تحديث حالة الحجز إلى (${status === 'confirmed' ? 'مؤكد' : status === 'rejected' ? 'مرفوض' : 'مكتمل'}) بنجاح`);
      setRejectingBooking(null);
      setRejectionReason('');
      setSelectedBooking(null);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'خطأ أثناء تحديث حالة الحجز');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">طلبات الحجز الواردة وإدارتها</h2>
          <p className="text-xs text-slate-400 mt-1">
            استقبل طلبات الحجز المباشرة مع كافة التفاصيل الخاصة بالنشاط، وأكّد أو ارفض الموعد فوراً.
          </p>
        </div>
        <button
          onClick={fetchBookings}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition"
        >
          <RefreshCw className="w-4 h-4" />
          <span>تحديث الحجوزات</span>
        </button>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-3 bg-white rounded-2xl">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span>جاري تحميل الحجوزات...</span>
        </div>
      ) : bookings.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl">
          لا توجد حجوزات واردة لخدماتك حالياً
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {bookings.map((b) => (
            <div
              key={b._id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-blue-400 transition space-y-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-blue-600 text-base">#{b.bookingCode}</span>
                    <h3 className="font-extrabold text-slate-900 text-base">{b.serviceTitle}</h3>
                    <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded">
                      {b.categoryId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    العميل: <strong className="text-slate-800">{b.customerName}</strong> • هاتف:{' '}
                    <span className="font-mono text-slate-700 font-bold">{b.customerPhone}</span>
                  </p>
                </div>

                <div className="flex items-center gap-4 text-left">
                  <div>
                    <div className="text-lg font-black text-slate-900">{b.totalPrice?.toLocaleString()} د.ج</div>
                    <div className="text-xs text-emerald-600 font-bold">
                      صافي مستحقاتك: {b.providerNet?.toLocaleString()} د.ج
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      b.status === 'confirmed'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : b.status === 'pending'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : b.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {b.status === 'confirmed'
                      ? 'مؤكد'
                      : b.status === 'pending'
                      ? 'بانتظار التأكيد'
                      : b.status === 'completed'
                      ? 'مكتمل'
                      : 'مرفوض/ملغي'}
                  </span>
                </div>
              </div>

              {/* Dynamic Fields Snapshot */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block mb-0.5">التاريخ المحدد:</span>
                  <span className="font-bold text-slate-800">{b.date}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block mb-0.5">الفترة / التوقيت:</span>
                  <span className="font-bold text-slate-800">{b.timeSlot || '—'}</span>
                </div>
                {b.dynamicFields && Object.keys(b.dynamicFields).slice(0, 2).map(([k, v]) => (
                  <div key={k}>
                    <span className="text-slate-400 font-bold block mb-0.5 truncate">{k}:</span>
                    <span className="font-bold text-blue-700 truncate block">
                      {typeof v === 'boolean' ? (v ? 'نعم' : 'لا') : String(v)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => setSelectedBooking(b)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition"
                >
                  <Eye className="w-4 h-4" />
                  <span>عرض كامل تفاصيل الحجز والمرفقات</span>
                </button>

                <div className="flex items-center gap-2">
                  {b.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(b._id, 'confirmed')}
                        disabled={processing}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition"
                      >
                        <Check className="w-4 h-4" />
                        <span>تأكيد الحجز</span>
                      </button>
                      <button
                        onClick={() => {
                          setRejectingBooking(b);
                          setRejectionReason('');
                        }}
                        disabled={processing}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <X className="w-4 h-4" />
                        <span>اعتذار / رفض</span>
                      </button>
                    </>
                  )}

                  {b.status === 'confirmed' && (
                    <button
                      onClick={() => handleUpdateStatus(b._id, 'completed')}
                      disabled={processing}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>إتمام الخدمة (Mark Completed)</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal with Reason Input */}
      {rejectingBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-black text-slate-900">
              رفض طلب الحجز #{rejectingBooking.bookingCode}
            </h3>
            <p className="text-xs text-slate-500">
              يرجى كتابة سبب الاعتذار عن قبول الحجز ليتم إشعار العميل فوراً:
            </p>

            <textarea
              rows="3"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="مثال: نعتذر لعدم توفر الموعد بسبب حجز مسبق في نفس التوقيت..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingBooking(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleUpdateStatus(rejectingBooking._id, 'rejected', rejectionReason)}
                disabled={processing}
                className="bg-rose-600 hover:bg-rose-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition"
              >
                تأكيد الرفض
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Inspection Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  تفاصيل حجز #{selectedBooking.bookingCode}
                </h3>
                <p className="text-xs text-slate-400">القسم: {selectedBooking.categoryId}</p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Client Info */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-xs text-slate-400 font-bold block">بيانات العميل:</span>
                <p className="font-extrabold text-sm text-slate-800">{selectedBooking.customerName}</p>
                <p className="text-xs font-mono text-slate-600">{selectedBooking.customerPhone}</p>
              </div>

              {/* Dynamic Fields Details */}
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 space-y-3">
                <span className="text-xs font-black text-blue-900 block">
                  معطيات الحجز الخاصة بالنشاط ({selectedBooking.categoryId}):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {selectedBooking.dynamicFields &&
                    Object.entries(selectedBooking.dynamicFields).map(([k, v]) => (
                      <div key={k} className="bg-white p-2.5 rounded-lg border border-blue-100">
                        <span className="text-slate-400 font-semibold block mb-0.5">{k}:</span>
                        <span className="font-bold text-slate-800">
                          {typeof v === 'boolean'
                            ? (v ? 'نعم (مطلوب)' : 'لا')
                            : Array.isArray(v)
                            ? v.join(', ')
                            : String(v || '—')}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-center">
                <div>
                  <span className="text-slate-400 font-bold">إجمالي المبلغ المحصل</span>
                  <div className="text-base font-black text-slate-900 mt-1">
                    {selectedBooking.totalPrice?.toLocaleString()} د.ج
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 font-bold">صافي مستحقاتك (بعد العمولة)</span>
                  <div className="text-base font-black text-emerald-600 mt-1">
                    {selectedBooking.providerNet?.toLocaleString()} د.ج
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedBooking(null)}
                className="bg-slate-900 text-white px-5 py-2 rounded-xl text-xs font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

