import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Briefcase, Plus, Trash2, Edit3, Star, MapPin, RefreshCw, X } from 'lucide-react';

export default function ServicesView({ subscriptionStatus }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const hasActive = subscriptionStatus?.hasActiveSubscription;

  // Add Service Form
  const [formData, setFormData] = useState({
    title: '',
    categoryId: 'weddings',
    subtitle: '',
    description: '',
    city: 'الوادي',
    address: '',
    price: '',
    priceUnit: 'د.ج',
    discountPercent: 0,
    features: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchMyServices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/services/provider/my-services');
      setServices(res.data.services || []);
    } catch (err) {
      console.error('Error fetching my services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyServices();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!hasActive) {
      alert('لا يمكنك إضافة خدمات جديدة لأن اشتراكك منتهٍ أو غير مفعل. يرجى تجديد الاشتراك أولاً.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        discountPercent: Number(formData.discountPercent),
        features: formData.features.split(',').map((f) => f.trim()).filter(Boolean),
      };

      await api.post('/services', payload);
      alert('تم إضافة الخدمة بنجاح!');
      setShowAddModal(false);
      setFormData({
        title: '',
        categoryId: 'weddings',
        subtitle: '',
        description: '',
        city: 'الوادي',
        address: '',
        price: '',
        priceUnit: 'د.ج',
        discountPercent: 0,
        features: '',
      });
      fetchMyServices();
    } catch (err) {
      alert(err.response?.data?.message || 'خطأ أثناء إضافة الخدمة');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الخدمة نهائياً؟')) return;
    try {
      await api.delete(`/services/${id}`);
      fetchMyServices();
    } catch (err) {
      alert('خطأ أثناء حذف الخدمة');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">خدماتي وعروضي المعروضة للزبائن</h2>
          <p className="text-xs text-slate-400 mt-1">
            إدارة وتحديث عروضك، تعديل الأسعار، الخصومات والمميزات.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (!hasActive) {
                alert('عذراً، يجب تجديد اشتراكك أولاً لتتمكن من إضافة خدمات جديدة.');
                return;
              }
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة خدمة جديدة</span>
          </button>
          <button
            onClick={fetchMyServices}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>تحديث</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-3 bg-white rounded-2xl">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span>جاري تحميل الخدمات...</span>
        </div>
      ) : services.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl">
          لم تقم بإضافة أي خدمات حتى الآن
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((srv) => (
            <div
              key={srv._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <div
                  className="h-32 p-4 text-white flex flex-col justify-between relative"
                  style={{ backgroundColor: srv.accentColor || '#1e3a8a' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-xs font-bold">
                      {srv.categoryId}
                    </span>
                    {srv.discountPercent > 0 && (
                      <span className="bg-amber-400 text-slate-900 text-xs px-2 py-0.5 rounded font-black">
                        خصم {srv.discountPercent}%
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-base line-clamp-1">{srv.title}</h3>
                </div>

                <div className="p-5 space-y-3">
                  <p className="text-xs text-slate-500 line-clamp-2">{srv.subtitle || srv.description}</p>

                  <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>{srv.city}</span>
                    </span>
                    <span className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{srv.rating || 5.0}</span>
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-xs text-slate-400">السعر:</span>
                    <span className="text-base font-black text-blue-600">
                      {srv.discountedPrice?.toLocaleString()} {srv.priceUnit || 'د.ج'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                <button
                  onClick={() => handleDelete(srv._id)}
                  className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition"
                  title="حذف الخدمة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[88vh] overflow-y-auto shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">إضافة خدمة أو عرض جديد</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">عنوان الخدمة الرئيسية</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: قاعة النور الملكية للأفراح"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">القسم / النشاط</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none"
                  >
                    <option value="cars">كراء السيارات</option>
                    <option value="beauty">التجميل والحلاقة</option>
                    <option value="farms">المزارع</option>
                    <option value="weddings">قاعات الأفراح</option>
                    <option value="pools">مسابح</option>
                    <option value="hotels">فنادق</option>
                    <option value="farms_halls">المزارع والقاعات</option>
                    <option value="houses">كراء المنازل</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الولاية</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">العنوان الدقيق</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: طريق المطار، حي الرمال"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">السعر (د.ج)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="35000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">وحدة السعر</label>
                  <input
                    type="text"
                    value={formData.priceUnit}
                    onChange={(e) => setFormData({ ...formData, priceUnit: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">نسبة الخصم (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discountPercent}
                    onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المميزات (مفصولة بفاصلة)</label>
                <input
                  type="text"
                  placeholder="تكييف مركزي, موقف سيارات واسع, واي فاي"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الوصف التفصيلي</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl font-bold transition shadow-md shadow-blue-500/20"
                >
                  {submitting ? 'جاري الحفظ...' : 'إضافة ونشر الخدمة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

