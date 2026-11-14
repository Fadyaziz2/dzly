import React, { useState, useEffect } from 'react';
import api from '../api/api';
import {
  CalendarCheck,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  User,
  Phone,
  FileText,
  DollarSign,
  X,
  RefreshCw,
} from 'lucide-react';

export default function BookingsView() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (cityFilter && cityFilter !== 'الكل') params.city = cityFilter;
      if (categoryFilter && categoryFilter !== 'الكل') params.categoryId = categoryFilter;
      if (search) params.search = search;

      const res = await api.get('/bookings/admin/all', { params });
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, cityFilter, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold">مؤكد</span>;
      case 'pending':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold">بانتظار التأكيد</span>;
      case 'completed':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold">مكتمل</span>;
      case 'cancelled':
        return <span className="bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 rounded-full text-xs font-bold">ملغي</span>;
      case 'rejected':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-full text-xs font-bold">مرفوض</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Filter Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">سجل الحجوزات والعمليات</h2>
            <p className="text-xs text-slate-400 mt-1">
              استعراض شامل لجميع الحجوزات، الفلترة حسب الولاية والقسم، وتتبع تفاصيل كل حجز بالكامل.
            </p>
          </div>
          <button
            onClick={fetchBookings}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>تحديث الجدول</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="ابحث برقم الحجز أو العميل..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
            />
            <button type="submit" className="absolute left-3 top-3 text-slate-400 hover:text-blue-600">
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">جميع الحالات</option>
            <option value="pending">بانتظار التأكيد (Pending)</option>
            <option value="confirmed">حجوزات مؤكدة (Confirmed)</option>
            <option value="completed">حجوزات مكتملة (Completed)</option>
            <option value="cancelled">حجوزات ملغاة (Cancelled)</option>
            <option value="rejected">حجوزات مرفوضة (Rejected)</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">جميع الأقسام</option>
            <option value="cars">كراء السيارات (Cars)</option>
            <option value="beauty">التجميل والحلاقة (Beauty)</option>
            <option value="farms">المزارع (Farms)</option>
            <option value="weddings">قاعات الأفراح (Weddings)</option>
            <option value="pools">المسابح (Pools)</option>
            <option value="hotels">فنادق (Hotels)</option>
            <option value="farms_halls">المزارع والقاعات (Farms & Halls)</option>
            <option value="houses">كراء المنازل (Houses)</option>
          </select>

          {/* City Filter */}
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">جميع الولايات</option>
            <option value="الوادي">الوادي</option>
            <option value="الجزائر العاصمة">الجزائر العاصمة</option>
            <option value="وهران">وهران</option>
            <option value="قسنطينة">قسنطينة</option>
            <option value="سطيف">سطيف</option>
            <option value="ورقلة">ورقلة</option>
            <option value="بسكرة">بسكرة</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span>جاري تحميل الحجوزات...</span>
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center text-slate-400">لا توجد حجوزات مطابقة لمعايير البحث والفلترة</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">
                  <th className="p-4">رقم الحجز</th>
                  <th className="p-4">الخدمة والقسم</th>
                  <th className="p-4">العميل</th>
                  <th className="p-4">مزود الخدمة</th>
                  <th className="p-4">الموعد والفترة</th>
                  <th className="p-4">الإجمالي</th>
                  <th className="p-4">عمولة المنصة</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4 text-center">التفاصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-mono font-bold text-blue-600">#{b.bookingCode}</td>
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{b.serviceTitle}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{b.city}</span>
                        <span>•</span>
                        <span className="text-indigo-600 font-semibold">{b.categoryId}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{b.customerName}</div>
                      <div className="text-xs text-slate-400 font-mono">{b.customerPhone}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{b.provider?.businessName || b.provider?.name || 'مزود غير محدد'}</div>
                      <div className="text-xs text-slate-400">{b.provider?.phone}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{b.date}</div>
                      <div className="text-xs text-slate-400">{b.timeSlot || '—'}</div>
                    </td>
                    <td className="p-4 font-black text-slate-900">{b.totalPrice?.toLocaleString()} د.ج</td>
                    <td className="p-4 font-black text-emerald-600">
                      {b.commissionAmount?.toLocaleString()} د.ج
                      <span className="text-xs text-slate-400 font-normal mr-1">({b.commissionRate}%)</span>
                    </td>
                    <td className="p-4">{getStatusBadge(b.status)}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>عرض</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dynamic Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <CalendarCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    تفاصيل الحجز #{selectedBooking.bookingCode}
                  </h3>
                  <p className="text-xs text-slate-400">قسم النشاط: {selectedBooking.categoryId}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Financial & Status Bar */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <div>
                  <span className="text-xs text-slate-400 font-bold">السعر الإجمالي</span>
                  <div className="text-lg font-black text-slate-900 mt-0.5">
                    {selectedBooking.totalPrice?.toLocaleString()} د.ج
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-bold">عمولة المنصة ({selectedBooking.commissionRate}%)</span>
                  <div className="text-lg font-black text-emerald-600 mt-0.5">
                    {selectedBooking.commissionAmount?.toLocaleString()} د.ج
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-bold">صافي مستحقات المزود</span>
                  <div className="text-lg font-black text-blue-600 mt-0.5">
                    {selectedBooking.providerNet?.toLocaleString()} د.ج
                  </div>
                </div>
              </div>

              {/* Service & Client Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">بيانات العميل</h4>
                  <div className="font-bold text-slate-800">{selectedBooking.customerName}</div>
                  <div className="text-xs text-slate-600 font-mono flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    <span>{selectedBooking.customerPhone}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">بيانات المزود والخدمة</h4>
                  <div className="font-bold text-slate-800">{selectedBooking.serviceTitle}</div>
                  <div className="text-xs text-slate-600 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>{selectedBooking.city}</span>
                    <span>•</span>
                    <span>{selectedBooking.provider?.businessName || selectedBooking.provider?.name}</span>
                  </div>
                </div>
              </div>

              {/* DYNAMIC FIELDS SECTION */}
              <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-4">
                <h4 className="text-sm font-black text-blue-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>المعطيات والحقول المخصصة لهذا القسم ({selectedBooking.categoryId})</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {selectedBooking.dynamicFields && Object.keys(selectedBooking.dynamicFields).length > 0 ? (
                    Object.entries(selectedBooking.dynamicFields).map(([k, v]) => (
                      <div key={k} className="bg-white p-3 rounded-xl border border-blue-100">
                        <span className="text-slate-400 font-bold block mb-1">{k}:</span>
                        <span className="font-extrabold text-slate-800">
                          {typeof v === 'boolean'
                            ? (v ? 'نعم (مطلوب)' : 'لا (بدون)')
                            : Array.isArray(v)
                            ? v.join(', ')
                            : String(v || '—')}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 italic col-span-2">حجز أساسي بدون حقول فرعية إضافية</p>
                  )}
                </div>
              </div>

              {/* Rejection / Cancellation Notes if applicable */}
              {selectedBooking.rejectionReason && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs">
                  <span className="font-bold text-rose-800 block mb-1">سبب الرفض المسجل من المزود:</span>
                  <p className="text-rose-700 font-medium">{selectedBooking.rejectionReason}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedBooking(null)}
                className="bg-slate-900 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

