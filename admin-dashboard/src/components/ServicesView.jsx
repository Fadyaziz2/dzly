import React, { useState, useEffect } from 'react';
import api from '../api/api';
import {
  Briefcase,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  MapPin,
  Tag,
  Star,
  RefreshCw,
} from 'lucide-react';

export default function ServicesView() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = {};
      if (categoryFilter) params.categoryId = categoryFilter;
      if (search) params.search = search;
      // Get all services regardless of approval
      const res = await api.get('/services', { params });
      setServices(res.data.services || []);
    } catch (err) {
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [categoryFilter]);

  const handleApprove = async (id, status) => {
    try {
      await api.patch(`/services/${id}/approval`, { status });
      fetchServices();
    } catch (err) {
      alert('خطأ أثناء تحديث حالة الاعتماد');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذه الخدمة نهائياً؟')) return;
    try {
      await api.delete(`/services/${id}`);
      fetchServices();
    } catch (err) {
      alert('خطأ أثناء حذف الخدمة');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">إدارة الخدمات واعتماد العروض</h2>
          <p className="text-xs text-slate-400 mt-1">
            مراجعة الخدمات المضافة من قبل مزودي الخدمات في الولايات والموافقة عليها.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="">جميع الأقسام</option>
            <option value="cars">كراء السيارات</option>
            <option value="beauty">التجميل والحلاقة</option>
            <option value="farms">المزارع</option>
            <option value="weddings">قاعات الأفراح</option>
            <option value="pools">مسابح</option>
            <option value="hotels">فنادق</option>
            <option value="farms_halls">المزارع والقاعات</option>
            <option value="houses">كراء المنازل</option>
          </select>

          <button
            onClick={fetchServices}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>تحديث</span>
          </button>
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-3 bg-white rounded-2xl">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span>جاري تحميل الخدمات...</span>
        </div>
      ) : services.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl">لا توجد خدمات مطابقة</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((srv) => (
            <div
              key={srv._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                {/* Header Image placeholder / banner */}
                <div
                  className="h-36 relative p-4 flex flex-col justify-between"
                  style={{ backgroundColor: srv.accentColor || '#1e3a8a' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="bg-white/20 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-lg font-bold">
                      {srv.categoryId}
                    </span>
                    {srv.discountPercent > 0 && (
                      <span className="bg-amber-400 text-slate-900 text-xs px-2.5 py-1 rounded-lg font-black">
                        خصم {srv.discountPercent}%
                      </span>
                    )}
                  </div>
                  <h3 className="text-white font-extrabold text-lg line-clamp-1">{srv.title}</h3>
                </div>

                {/* Body Info */}
                <div className="p-5 space-y-3">
                  <p className="text-xs text-slate-500 line-clamp-2">{srv.subtitle || srv.description}</p>

                  <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>{srv.city}</span>
                    </span>
                    <span className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{srv.rating || 5.0} ({srv.reviewsCount || 0})</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-400">مزود الخدمة:</span>
                    <span className="font-bold text-slate-800">
                      {srv.provider?.businessName || srv.provider?.name || 'غير محدد'}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-2">
                    <span className="text-xs text-slate-400">السعر المعروض:</span>
                    <div className="text-base font-black text-blue-600">
                      {srv.discountedPrice?.toLocaleString()} {srv.priceUnit || 'د.ج'}
                    </div>
                  </div>

                  {/* Features tags */}
                  {srv.features && srv.features.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {srv.features.slice(0, 3).map((f, i) => (
                        <span key={i} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[11px] font-semibold">
                          {f}
                        </span>
                      ))}
                      {srv.features.length > 3 && (
                        <span className="text-slate-400 text-[10px] self-center">+{srv.features.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-400">
                  الحالة:{' '}
                  <span className={srv.approvalStatus === 'approved' ? 'text-emerald-600' : 'text-amber-600'}>
                    {srv.approvalStatus === 'approved' ? 'معتمد' : 'معلق'}
                  </span>
                </span>

                <div className="flex items-center gap-2">
                  {srv.approvalStatus !== 'approved' && (
                    <button
                      onClick={() => handleApprove(srv._id, 'approved')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>اعتماد</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(srv._id)}
                    className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition"
                    title="حذف الخدمة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

