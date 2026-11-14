import React, { useState, useEffect } from 'react';
import api from '../api/api';
import {
  CalendarCheck,
  Clock,
  Wallet,
  Briefcase,
  TrendingUp,
  RefreshCw,
  ArrowRight,
  Eye,
} from 'lucide-react';

export default function OverviewView({ onNavigateToBookings }) {
  const [financials, setFinancials] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const [finRes, bRes] = await Promise.all([
        api.get('/financials/provider'),
        api.get('/bookings/provider-bookings'),
      ]);
      setFinancials(finRes.data.summary);
      setBookings(bRes.data.bookings || []);
    } catch (err) {
      console.error('Error fetching overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        <span>جاري تحميل بيانات لوحة المزود...</span>
      </div>
    );
  }

  const pendingCount = financials?.pendingCount || 0;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white p-6 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black">أهلاً بك في بوابة شريك خدمة احجزلي Dz</h2>
          <p className="text-slate-300 text-sm mt-1">
            تابع كافة طلبات الحجز الواردة، أرباحك الصافية، وتأكيد المواعيد لحظة بلحظة.
          </p>
        </div>
        <button
          onClick={fetchOverview}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-xs font-bold transition border border-white/20"
        >
          <RefreshCw className="w-4 h-4" />
          <span>تحديث</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">الحجوزات الجديدة</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-amber-600">{pendingCount}</div>
          <p className="text-xs text-slate-400 mt-1 font-medium">بانتظار موافقتك أو رفضك</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">إجمالي الحجوزات</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900">{financials?.totalBookingsCount || 0}</div>
          <p className="text-xs text-slate-400 mt-1 font-medium">كافة الطلبات الواردة لخدماتك</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">صافي المستحقات (الأرباح)</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-emerald-600">
            {(financials?.netReceivable || 0).toLocaleString()} د.ج
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">بعد خصم عمولة المنصة</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">الأرباح المعلقة (Pending)</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-purple-600">
            {(financials?.pendingAmount || 0).toLocaleString()} د.ج
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">تتحول لمؤكدة فور قبول الطلب</p>
        </div>
      </div>

      {/* Recent Bookings List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-blue-600" />
            <h3 className="font-extrabold text-base text-slate-900">آخر طلبات الحجز الواردة</h3>
          </div>
          <button
            onClick={onNavigateToBookings}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>عرض كافة الحجوزات</span>
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          </button>
        </div>

        {bookings.length === 0 ? (
          <div className="p-12 text-center text-slate-400">لا توجد طلبات حجز حالياً</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {bookings.slice(0, 5).map((b) => (
              <div key={b._id} className="p-5 flex flex-wrap items-center justify-between gap-4 hover:bg-slate-50 transition">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-blue-600 text-sm">#{b.bookingCode}</span>
                    <span className="font-extrabold text-slate-800">{b.serviceTitle}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        b.status === 'confirmed'
                          ? 'bg-blue-50 text-blue-700'
                          : b.status === 'pending'
                          ? 'bg-amber-50 text-amber-700'
                          : b.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {b.status === 'confirmed'
                        ? 'مؤكد'
                        : b.status === 'pending'
                        ? 'بانتظار التأكيد'
                        : b.status === 'completed'
                        ? 'مكتمل'
                        : 'ملغي/مرفوض'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    العميل: <strong className="text-slate-700">{b.customerName}</strong> ({b.customerPhone}) • الموعد:{' '}
                    <strong>{b.date}</strong> ({b.timeSlot || '—'})
                  </p>
                </div>

                <div className="text-left">
                  <div className="font-black text-base text-slate-900">{b.totalPrice?.toLocaleString()} د.ج</div>
                  <div className="text-xs text-emerald-600 font-bold">
                    صافيك: {b.providerNet?.toLocaleString()} د.ج
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

