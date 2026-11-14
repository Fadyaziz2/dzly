import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Layers, Eye, RefreshCw, CheckCircle, FileCode } from 'lucide-react';

export default function CategoriesView() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">الأقسام الثمانية ونماذج الحجز الديناميكية</h2>
          <p className="text-xs text-slate-400 mt-1">
            مخطط الحقول الديناميكية (Dynamic Booking Schema) لكل نشاط وخدمة على منصة احجزلي Dz.
          </p>
        </div>
        <button
          onClick={fetchCategories}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition"
        >
          <RefreshCw className="w-4 h-4" />
          <span>تحديث الأقسام</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:border-blue-400 transition"
          >
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md font-bold text-lg"
                  style={{ backgroundColor: cat.color || '#2563EB' }}
                >
                  {cat.id.substring(0, 2).toUpperCase()}
                </div>
                <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                  {cat.id}
                </span>
              </div>

              <h3 className="text-base font-black text-slate-900 mt-4">{cat.title}</h3>
              <p className="text-xs text-slate-400 mt-1">{cat.titleEn}</p>
              <p className="text-xs text-slate-500 mt-2 line-clamp-2">{cat.description}</p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>حقول الحجز المخصصة:</span>
                <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {cat.bookingFieldsSpecification?.length || 0} حقول
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => setSelectedCat(cat)}
                className="w-full flex items-center justify-center gap-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 py-2 rounded-xl text-xs font-bold transition"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>عرض الحقول الديناميكية (Schema)</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Schema Inspection Modal */}
      {selectedCat && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-bold"
                  style={{ backgroundColor: selectedCat.color }}
                >
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    مخطط الحجز الديناميكي: {selectedCat.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">Category ID: {selectedCat.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCat(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕ إغلاق
              </button>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                الحقول المعرفة داخل قاعدة البيانات ({selectedCat.bookingFieldsSpecification?.length} حقول)
              </h4>

              <div className="space-y-3">
                {selectedCat.bookingFieldsSpecification?.map((field, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-600">{field.name}</span>
                        <span className="text-slate-400 font-normal">({field.label})</span>
                      </div>
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">
                        {field.type}
                      </span>
                    </div>

                    <p className="text-slate-500">{field.helperText}</p>

                    {field.options && field.options.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-200/60">
                        <span className="text-slate-400 font-bold block mb-1">الخيارات المتاحة:</span>
                        <div className="flex flex-wrap gap-1">
                          {field.options.map((opt, oIdx) => (
                            <span key={oIdx} className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[11px] text-slate-700">
                              {opt}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedCat(null)}
                className="bg-slate-900 text-white px-6 py-2 rounded-xl text-xs font-bold"
              >
                تم
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

