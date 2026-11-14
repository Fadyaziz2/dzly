import React, { useState, useEffect } from 'react';
import api from '../api/api';
import {
  Pill,
  PlusCircle,
  Search,
  AlertTriangle,
  CheckCircle,
  Edit2,
  Trash2,
  Plus,
  Minus,
  X,
  RefreshCw,
  PackageCheck,
  FileText,
} from 'lucide-react';

export default function PharmacyInventoryView({ user }) {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Add / Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    category: 'مسكنات وخافضات حرارة',
    dosage: '',
    price: '',
    stock: 10,
    requiresPrescription: false,
    description: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const res = await api.get('/pharmacy/medicines');
      setMedicines(res.data.data || []);
    } catch (err) {
      console.error('Error fetching pharmacy medicines:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleOpenAddModal = () => {
    setEditingMedicine(null);
    setFormData({
      name: '',
      genericName: '',
      category: 'مسكنات وخافضات حرارة',
      dosage: '',
      price: '',
      stock: 15,
      requiresPrescription: false,
      description: '',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (med) => {
    setEditingMedicine(med);
    setFormData({
      name: med.name,
      genericName: med.genericName || '',
      category: med.category || 'مسكنات وخافضات حرارة',
      dosage: med.dosage || '',
      price: med.price,
      stock: med.stock,
      requiresPrescription: !!med.requiresPrescription,
      description: med.description || '',
    });
    setShowModal(true);
  };

  const handleSaveSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      alert('يرجى ملء اسم الدواء والسعر على الأقل');
      return;
    }
    setSaving(true);
    try {
      if (editingMedicine) {
        await api.put(`/pharmacy/medicines/${editingMedicine._id || editingMedicine.id}`, formData);
        alert('تم تحديث بيانات الدواء بنجاح');
      } else {
        await api.post('/pharmacy/medicines', formData);
        alert('تمت إضافة الدواء لقائمة المخزون بنجاح');
      }
      setShowModal(false);
      fetchMedicines();
    } catch (err) {
      alert(err.response?.data?.message || 'خطأ أثناء حفظ الدواء');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickStockUpdate = async (med, delta) => {
    const newStock = Math.max(0, med.stock + delta);
    try {
      // Optimistic UI update
      setMedicines((prev) =>
        prev.map((m) => (m._id === med._id ? { ...m, stock: newStock } : m))
      );
      await api.put(`/pharmacy/medicines/${med._id || med.id}`, {
        stock: newStock,
      });
    } catch (err) {
      console.error('Failed to update stock:', err);
      fetchMedicines();
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`هل أنت متأكد من حذف الدواء (${name}) نهائياً من المخزون؟`)) return;
    try {
      await api.delete(`/pharmacy/medicines/${id}`);
      fetchMedicines();
    } catch (err) {
      alert(err.response?.data?.message || 'خطأ أثناء حذف الدواء');
    }
  };

  // Filtered List
  const filtered = medicines.filter((m) => {
    if (categoryFilter && m.category !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchName = m.name?.toLowerCase().includes(q);
      const matchGeneric = m.genericName?.toLowerCase().includes(q);
      return matchName || matchGeneric;
    }
    return true;
  });

  const lowStockItems = medicines.filter((m) => m.stock <= 5);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-900 text-white p-6 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <Pill className="w-6 h-6 text-teal-300" />
          </div>
          <div>
            <h2 className="text-xl font-black">إدارة مخزون الأدوية والأسعار الفورية</h2>
            <p className="text-xs text-teal-100 mt-0.5">
              تعديل أسعار الأدوية، تحديث الكميات المتاحة لحظياً، وتنبيهات الأدوية المنتهية أو منخفضة المخزون
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 bg-white text-teal-900 px-4 py-2.5 rounded-xl text-xs font-black shadow-lg hover:bg-teal-50 transition"
          >
            <PlusCircle className="w-4 h-4 text-teal-700" />
            <span>إضافة دواء جديد</span>
          </button>
          <button
            onClick={fetchMedicines}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition border border-white/10"
            title="تحديث القائمة"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockItems.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-rose-800 text-xs font-bold">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>
              تنبيه مخزون: لديك {lowStockItems.length} أدوية شارفت على النفاد (متبقي 5 علب أو أقل)! يرجى إعادة تعبئة
              المخزون.
            </span>
          </div>
          <span className="bg-rose-200/80 text-rose-900 px-2.5 py-1 rounded-full text-[11px] font-mono">
            {lowStockItems.map((m) => m.name).slice(0, 3).join('، ')}
            {lowStockItems.length > 3 ? '...' : ''}
          </span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث باسم الدواء التجاري أو العلمي..."
            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500 font-medium"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-bold focus:outline-none focus:border-teal-500"
        >
          <option value="">جميع التصنيفات الدوائية</option>
          <option value="مسكنات وخافضات حرارة">مسكنات وخافضات حرارة</option>
          <option value="مضادات حيوية">مضادات حيوية</option>
          <option value="فيتامينات ومكملات">فيتامينات ومكملات</option>
          <option value="أمراض مزمنة">أمراض مزمنة</option>
          <option value="أطفال ورضع">أطفال ورضع</option>
          <option value="عناية جلدية ومستحضرات">عناية جلدية ومستحضرات</option>
          <option value="أخرى">أخرى</option>
        </select>
      </div>

      {/* Medicines Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="p-4">اسم الدواء</th>
                <th className="p-4">الاسم العلمي</th>
                <th className="p-4">التصنيف</th>
                <th className="p-4">الجرعة / العبوة</th>
                <th className="p-4">السعر (د.ج)</th>
                <th className="p-4 text-center">المخزون الفعلي (علب)</th>
                <th className="p-4">الروشتة</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin text-teal-600 mx-auto mb-2" />
                    جاري تحميل قائمة المخزون...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    لا توجد أدوية مطابقة للبحث في مخزون صيدليتك
                  </td>
                </tr>
              ) : (
                filtered.map((med) => {
                  const isLow = med.stock <= 5;
                  return (
                    <tr key={med._id || med.id} className="hover:bg-slate-50 transition">
                      <td className="p-4">
                        <div className="font-black text-slate-900">{med.name}</div>
                        {med.description && (
                          <div className="text-[11px] text-slate-400 line-clamp-1">{med.description}</div>
                        )}
                      </td>
                      <td className="p-4 font-mono text-slate-600">{med.genericName || '—'}</td>
                      <td className="p-4">
                        <span className="bg-teal-50 text-teal-800 border border-teal-100 px-2 py-0.5 rounded-md font-bold text-[11px]">
                          {med.category}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 font-medium">{med.dosage || '—'}</td>
                      <td className="p-4 font-black text-slate-900 text-sm">{med.price?.toLocaleString()} د.ج</td>
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 px-2 py-1 rounded-xl">
                          <button
                            onClick={() => handleQuickStockUpdate(med, -1)}
                            className="p-1 hover:bg-slate-200 rounded-lg text-slate-600 transition"
                            title="خصم علبة (-1)"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span
                            className={`font-mono font-black min-w-[28px] text-center ${
                              isLow ? 'text-rose-600' : 'text-slate-800'
                            }`}
                          >
                            {med.stock}
                          </span>
                          <button
                            onClick={() => handleQuickStockUpdate(med, 1)}
                            className="p-1 hover:bg-slate-200 rounded-lg text-slate-600 transition"
                            title="إضافة علبة (+1)"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="p-4">
                        {med.requiresPrescription ? (
                          <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold text-[10px]">
                            تتطلب روشتة
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">حر (OTC)</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(med)}
                            className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
                            title="تعديل"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(med._id || med.id, med.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Medicine Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-teal-600" />
                <h3 className="font-black text-base text-slate-900">
                  {editingMedicine ? 'تعديل بيانات الدواء في المخزون' : 'إضافة دواء جديد لمخزون الصيدلية'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1">اسم الدواء التجاري *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: Doliprane 1000mg"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">الاسم العلمي (Generic)</label>
                  <input
                    type="text"
                    placeholder="مثال: Paracetamol"
                    value={formData.genericName}
                    onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">التصنيف الدوائي</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-bold"
                  >
                    <option value="مسكنات وخافضات حرارة">مسكنات وخافضات حرارة</option>
                    <option value="مضادات حيوية">مضادات حيوية</option>
                    <option value="فيتامينات ومكملات">فيتامينات ومكملات</option>
                    <option value="أمراض مزمنة">أمراض مزمنة</option>
                    <option value="أطفال ورضع">أطفال ورضع</option>
                    <option value="عناية جلدية ومستحضرات">عناية جلدية ومستحضرات</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">الجرعة / العبوة</label>
                  <input
                    type="text"
                    placeholder="مثال: علبة 8 أقراص"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">السعر (د.ج) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="220"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-black text-teal-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">الكمية بالمخزون *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="20"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">وصف أو دواعي الاستعمال</label>
                <textarea
                  rows="2"
                  placeholder="وصف مختصر للأعراض ودواعي الاستخدام..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200">
                <input
                  type="checkbox"
                  id="reqPresc"
                  checked={formData.requiresPrescription}
                  onChange={(e) => setFormData({ ...formData, requiresPrescription: e.target.checked })}
                  className="w-4 h-4 text-teal-600 rounded"
                />
                <label htmlFor="reqPresc" className="text-amber-900 cursor-pointer select-none">
                  هذا الدواء يتطلب روشتة طبية ملزمة من الطبيب (Prescription Required)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black shadow-md shadow-teal-600/20"
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ الدواء'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
