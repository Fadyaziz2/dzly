import React, { useState, useEffect } from 'react';
import api from '../api/api';
import {
  Image as ImageIcon,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  Save,
  Link as LinkIcon,
  Eye,
  Megaphone,
} from 'lucide-react';

export default function BannersView() {
  const [activeTab, setActiveTab] = useState('home_banners'); // 'home_banners', 'category_cards', 'category_ads'
  const [settings, setSettings] = useState({
    headerBannerUrl: '',
    homeAdBannerUrl: '',
    homeAdBannerTitle: 'أعلن عن مشروعك',
    homeAdBannerSubtitle: 'معنا يصل إعلانك إلى آلاف المستخدمين',
    homeAdBannerActionText: 'تواصل معنا',
    homeAdBannerActionUrl: '',
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploadingTarget, setUploadingTarget] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Fallback Asset Descriptions
  const defaultAssetDescriptions = {
    header: 'منظر بانورامي لمدينة الوادي مع قبتها وأشجار النخيل (assets/images/banners/header_el_oued.png)',
    homeAd: 'خلفية هاتف ذكي وخريطة ومؤشر أزرق (assets/images/banners/ad_banner_bg.png)',
    cars: 'سيارة مرسيدس سوداء فاخرة في المعرض (assets/images/categories/cars.png)',
    beauty: 'صالون تجميل وعناية راقي بإضاءة دافئة (assets/images/categories/beauty.png)',
    farms: 'مزرعة خضراء واسعة بأشجار النخيل (assets/images/categories/farms.png)',
    weddings: 'قاعة أفراح فاخرة مزينة بالورود والثريات (assets/images/categories/weddings.png)',
    pools: 'مسبح فيلا فيروزي وإضاءة استجمام (assets/images/categories/pools.png)',
    hotels: 'فندق سياحي حديث بواجهة معمارية راقية (assets/images/categories/hotels.png)',
    farms_halls: 'قصر ومزرعة للمناسبات الكبرى (assets/images/categories/farms_halls.png)',
    houses: 'فيلا ومنزل حديث للإيجار (assets/images/categories/houses.png)',
    pharmacy: 'صيدلية حديثة بأرفف أدوية مضيئة (assets/images/categories/pharmacy.png)',
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [settingsRes, categoriesRes] = await Promise.all([
        api.get('/settings'),
        api.get('/categories'),
      ]);

      if (settingsRes.data.settings) {
        setSettings((prev) => ({
          ...prev,
          ...settingsRes.data.settings,
        }));
      }

      setCategories(categoriesRes.data.categories || []);
    } catch (err) {
      console.error('Error fetching banners data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3500);
  };

  // Upload handler for single file
  const handleFileUpload = async (file, onUploaded) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data.fileUrl || res.data.fullUrl;
      onUploaded(url);
      showToast('تم رفع الصورة بنجاح!');
    } catch (err) {
      alert(err.response?.data?.message || 'فشل رفع الصورة');
    }
  };

  // Save Home Banners to Settings
  const handleSaveHomeBanners = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await api.put('/settings', settings);
      showToast('تم حفظ بنرات الشاشة الرئيسية بنجاح!');
    } catch (err) {
      alert('خطأ أثناء حفظ البنرات');
    } finally {
      setSavingSettings(false);
    }
  };

  // Update Category image or ad banner
  const handleUpdateCategory = async (catId, payload) => {
    try {
      await api.put(`/categories/${catId}`, payload);
      setCategories((prev) =>
        prev.map((c) => (c.id === catId ? { ...c, ...payload } : c))
      );
      showToast('تم تحديث وسائط التصنيف بنجاح!');
    } catch (err) {
      alert('خطأ أثناء تحديث التصنيف');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-4">
          <CheckCircle className="w-4 h-4 text-emerald-200" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 p-6 rounded-2xl text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <ImageIcon className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h2 className="text-xl font-black">إدارة البنرات والصور الترويجية للتطبيق</h2>
            <p className="text-xs text-blue-200 mt-0.5">
              تغيير بنر الهيدر، صور بطاقات التصنيفات، وبنرات الإعلانات لحظياً مع اعتماد صور الأصول (Assets) تلقائياً عند الإفراغ
            </p>
          </div>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition border border-white/10"
        >
          <RefreshCw className="w-4 h-4" />
          <span>تحديث</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
        <button
          onClick={() => setActiveTab('home_banners')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'home_banners'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>بنرات الشاشة الرئيسية (الهيدر + الإعلان العام)</span>
        </button>

        <button
          onClick={() => setActiveTab('category_cards')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'category_cards'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>صور بطاقات التصنيفات في الهوم ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('category_ads')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'category_ads'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>بنرات الإعلانات داخل صفحات الأقسام</span>
        </button>
      </div>

      {/* TAB 1: HOME BANNERS */}
      {activeTab === 'home_banners' && (
        <form onSubmit={handleSaveHomeBanners} className="space-y-6">
          {/* 1. Header Panoramic Banner */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">
                  1. بنر الهيدر العلوي في الشاشة الرئيسية (Header Banner)
                </h3>
              </div>
              {settings.headerBannerUrl ? (
                <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  صورة مخصصة نشطة 🌐
                </span>
              ) : (
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  يعتمد على صورة الأصول الافتراضية (Default Asset) 📦
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500">
              هذه الصورة تظهر في أعلى الشاشة الرئيسية خلف شعار "احجزلي Dz" ومحدد المدينة مع تدرج لوني أزرق علوي.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* Preview Box */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 aspect-[16/8] shadow-inner group">
                {settings.headerBannerUrl ? (
                  <img
                    src={settings.headerBannerUrl}
                    alt="Header Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-tr from-blue-900 to-sky-700 text-white">
                    <ImageIcon className="w-8 h-8 text-white/50 mb-1" />
                    <span className="text-xs font-bold">صورة الأصول الافتراضية</span>
                    <span className="text-[10px] text-blue-200 font-mono mt-1">assets/images/banners/header_el_oued.png</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-blue-950/40 pointer-events-none flex items-end p-3">
                  <span className="text-white text-[11px] font-bold">معاينة ظهور الهيدر في التطبيق</span>
                </div>
              </div>

              {/* Controls */}
              <div className="md:col-span-2 space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    رابط الصورة المباشر (URL أو مسار الصورة المرفوعة):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="اتركه فارغاً للاعتماد على الصورة الافتراضية بالأصول..."
                      value={settings.headerBannerUrl || ''}
                      onChange={(e) => setSettings({ ...settings, headerBannerUrl: e.target.value })}
                      className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-mono text-xs font-medium"
                    />
                    <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2.5 rounded-xl font-bold flex items-center gap-1.5 transition shrink-0">
                      <Upload className="w-4 h-4 text-blue-600" />
                      <span>رفع من الجهاز</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(file, (url) => {
                              setSettings((prev) => ({ ...prev, headerBannerUrl: url }));
                            });
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, headerBannerUrl: '' })}
                    className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-600 font-bold transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>استعادة صورة الأصول الافتراضية (إفراغ الرابط)</span>
                  </button>
                  <span className="text-[11px] text-slate-400">المقاس الموصى به: 1080 × 520 بكسل</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Home Ad Promo Banner */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-slate-900 text-sm">
                  2. بنر الإعلان التسويقي في الرئيسية (Home Ad Banner)
                </h3>
              </div>
              {settings.homeAdBannerUrl ? (
                <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  خلفية إعلانية مخصصة 🌐
                </span>
              ) : (
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  يعتمد على خلفية الأصول الافتراضية 📦
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* Preview Box */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 aspect-[16/7] shadow-md flex items-center justify-between p-4 text-white">
                {settings.homeAdBannerUrl ? (
                  <img
                    src={settings.homeAdBannerUrl}
                    alt="Home Ad Preview"
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-800 flex items-center justify-center opacity-90"></div>
                )}

                <div className="relative z-10 space-y-1">
                  <span className="bg-white/20 text-[9px] font-bold px-1.5 py-0.5 rounded">AD</span>
                  <h4 className="font-extrabold text-sm text-white">{settings.homeAdBannerTitle || 'أعلن عن مشروعك'}</h4>
                  <p className="text-[10px] text-slate-200 max-w-[200px]">
                    {settings.homeAdBannerSubtitle || 'معنا يصل إعلانك إلى آلاف المستخدمين'}
                  </p>
                </div>

                <div className="relative z-10">
                  <span className="bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-[11px] shadow">
                    {settings.homeAdBannerActionText || 'تواصل معنا'}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="md:col-span-2 space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">صورة خلفية البنر الإعلاني:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="اتركه فارغاً للاعتماد على assets/images/banners/ad_banner_bg.png"
                      value={settings.homeAdBannerUrl || ''}
                      onChange={(e) => setSettings({ ...settings, homeAdBannerUrl: e.target.value })}
                      className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-mono text-xs font-medium"
                    />
                    <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2.5 rounded-xl font-bold flex items-center gap-1.5 transition shrink-0">
                      <Upload className="w-4 h-4 text-blue-600" />
                      <span>رفع خلفية</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(file, (url) => {
                              setSettings((prev) => ({ ...prev, homeAdBannerUrl: url }));
                            });
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">عنوان الإعلان الرئيسي:</label>
                    <input
                      type="text"
                      value={settings.homeAdBannerTitle || ''}
                      onChange={(e) => setSettings({ ...settings, homeAdBannerTitle: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">نص زر الإجراء (Action Button):</label>
                    <input
                      type="text"
                      value={settings.homeAdBannerActionText || ''}
                      onChange={(e) => setSettings({ ...settings, homeAdBannerActionText: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">النص الوصفي الفرعي للإعلان:</label>
                  <input
                    type="text"
                    value={settings.homeAdBannerSubtitle || ''}
                    onChange={(e) => setSettings({ ...settings, homeAdBannerSubtitle: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      setSettings({
                        ...settings,
                        homeAdBannerUrl: '',
                        homeAdBannerTitle: 'أعلن عن مشروعك',
                        homeAdBannerSubtitle: 'معنا يصل إعلانك إلى آلاف المستخدمين',
                        homeAdBannerActionText: 'تواصل معنا',
                      })
                    }
                    className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-600 font-bold transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>استعادة إعدادات الإعلان الافتراضية بالأصول</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button Bar */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingSettings}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl text-xs font-black shadow-lg shadow-blue-600/30 transition"
            >
              <Save className="w-4 h-4" />
              <span>{savingSettings ? 'جاري الحفظ...' : 'حفظ بنرات الشاشة الرئيسية'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: CATEGORY CARD IMAGES */}
      {activeTab === 'category_cards' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl text-xs text-blue-900 font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600 shrink-0" />
              <span>
                يمكنك هنا تغيير الصورة الظاهرة في كارت كل تصنيف على الشاشة الرئيسية للموبايل. إذا لم تقم بتعيين صورة مخصصة،
                سيعتمد تطبيق الموبايل تلقائياً على الصورة الأصلية المحفوظة داخل مجلد الأصول (assets/images/categories).
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((cat) => {
              const defaultAsset = defaultAssetDescriptions[cat.id] || 'صورة أصول التطبيق الافتراضية';
              const isCustom = !!cat.imageUrl;

              return (
                <div
                  key={cat.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    {/* Image Preview */}
                    <div className="relative aspect-[16/10] bg-slate-900 border-b border-slate-100 overflow-hidden group">
                      {cat.imageUrl ? (
                        <img
                          src={cat.imageUrl}
                          alt={cat.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div
                          className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-white"
                          style={{
                            background: `linear-gradient(135deg, ${cat.color}CC, ${cat.color})`,
                          }}
                        >
                          <ImageIcon className="w-8 h-8 text-white/50 mb-1" />
                          <span className="text-xs font-black">{cat.title}</span>
                          <span className="text-[10px] text-white/80 mt-1">صورة الأصول الأصلية (Asset)</span>
                        </div>
                      )}

                      <div className="absolute top-2.5 right-2.5">
                        {isCustom ? (
                          <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                            مخصصة 🌐
                          </span>
                        ) : (
                          <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                            افتراضية (أصول) 📦
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: cat.color }}
                          ></span>
                          <h4 className="font-extrabold text-slate-900 text-sm">{cat.title}</h4>
                        </div>
                        <span className="font-mono text-slate-400 text-[11px]">ID: {cat.id}</span>
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        الافتراضي: {defaultAsset}
                      </p>

                      {/* Image URL Input & Upload */}
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">رابط الصورة (Image URL):</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="اتركه فارغاً للاعتماد على الأصول..."
                            value={cat.imageUrl || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCategories((prev) =>
                                prev.map((c) => (c.id === cat.id ? { ...c, imageUrl: val } : c))
                              );
                            }}
                            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] focus:outline-none focus:border-blue-500"
                          />
                          <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl font-bold flex items-center gap-1 transition shrink-0" title="رفع صورة جديدة">
                            <Upload className="w-3.5 h-3.5 text-blue-600" />
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleFileUpload(file, (url) => {
                                    handleUpdateCategory(cat.id, { imageUrl: url });
                                  });
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateCategory(cat.id, { imageUrl: '' })}
                      className="text-slate-400 hover:text-rose-600 font-bold text-[11px] flex items-center gap-1 transition"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>استعادة الأصول</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateCategory(cat.id, { imageUrl: cat.imageUrl || '' })}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-sm transition"
                    >
                      حفظ
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: CATEGORY INNER AD BANNERS */}
      {activeTab === 'category_ads' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-amber-900 font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                يمكنك تخصيص بنر إعلاني أو ترويجي يظهر أعلى أو داخل صفحة أي تصنيف في الموبايل (مثال: عروض حفلات الصيف في قاعات الأفراح، أو تخفيضات الإيجار في كراء السيارات).
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((cat) => {
              const hasAd = !!cat.adBannerUrl;

              return (
                <div
                  key={cat.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      ></span>
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        إعلان قسم {cat.title}
                      </h4>
                    </div>

                    {hasAd ? (
                      <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
                        إعلان نشط 📢
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-500 text-xs px-2.5 py-0.5 rounded-full font-bold">
                        لا يوجد إعلان (افتراضي)
                      </span>
                    )}
                  </div>

                  {/* Banner Preview */}
                  <div className="relative rounded-xl overflow-hidden aspect-[16/6] bg-slate-900 border border-slate-200">
                    {cat.adBannerUrl ? (
                      <img
                        src={cat.adBannerUrl}
                        alt="Ad preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center p-3 text-white"
                        style={{ background: `linear-gradient(135deg, ${cat.color}AA, #0F172A)` }}
                      >
                        <span className="text-xs font-bold">بدون بنر إعلاني مخصص (يعتمد على واجهة القسم الأساسية)</span>
                      </div>
                    )}
                  </div>

                  {/* Inputs */}
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">صورة البنر الإعلاني للقسم:</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="اتركه فارغاً لإلغاء الإعلان..."
                          value={cat.adBannerUrl || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCategories((prev) =>
                              prev.map((c) => (c.id === cat.id ? { ...c, adBannerUrl: val } : c))
                            );
                          }}
                          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] focus:outline-none focus:border-amber-500"
                        />
                        <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl font-bold flex items-center gap-1 transition shrink-0">
                          <Upload className="w-3.5 h-3.5 text-amber-600" />
                          <span>رفع</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFileUpload(file, (url) => {
                                  handleUpdateCategory(cat.id, { adBannerUrl: url });
                                });
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">عنوان الإعلان داخل القسم:</label>
                        <input
                          type="text"
                          placeholder="مثال: خصومات حصرية للأعراس"
                          value={cat.adBannerTitle || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCategories((prev) =>
                              prev.map((c) => (c.id === cat.id ? { ...c, adBannerTitle: val } : c))
                            );
                          }}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">نص زر الإجراء:</label>
                        <input
                          type="text"
                          placeholder="مثال: احجز الآن"
                          value={cat.adBannerActionText || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCategories((prev) =>
                              prev.map((c) => (c.id === cat.id ? { ...c, adBannerActionText: val } : c))
                            );
                          }}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateCategory(cat.id, {
                          adBannerUrl: '',
                          adBannerTitle: '',
                          adBannerSubtitle: '',
                          adBannerActionText: '',
                        })
                      }
                      className="text-slate-400 hover:text-rose-600 font-bold text-[11px] flex items-center gap-1 transition"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>إلغاء الإعلان</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateCategory(cat.id, {
                          adBannerUrl: cat.adBannerUrl || '',
                          adBannerTitle: cat.adBannerTitle || '',
                          adBannerActionText: cat.adBannerActionText || '',
                        })
                      }
                      className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-md shadow-amber-600/20 transition"
                    >
                      حفظ إعلان القسم
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
