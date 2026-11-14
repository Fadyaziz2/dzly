import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Settings, Save, RefreshCw, DollarSign, Percent, Phone, Mail, CreditCard, Check } from 'lucide-react';

export default function SettingsView() {
  const [formData, setFormData] = useState({
    monthlySubscriptionPrice: 5000,
    annualSubscriptionPrice: 50000,
    platformCommissionPercent: 10,
    supportPhone: '0661234567',
    supportEmail: 'support@dzly.com',
    baridimobAccount: '007999990022334455',
    ccpAccount: '1234567 clé 89',
    announcementText: 'أعلن عن مشروعك معنا ليصل إعلانك إلى آلاف المستخدمين',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings');
      if (res.data.settings) {
        setFormData(res.data.settings);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings', formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert('خطأ أثناء حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        <span>جاري تحميل الإعدادات...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">إعدادات المنصة والتسعير والعمولات</h2>
          <p className="text-xs text-slate-400 mt-1">
            التحكم المركزي في قيمة اشتراك مزود الخدمة الشهري والسنوي ونسبة العمولة وحسابات الدفع.
          </p>
        </div>
        {savedSuccess && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-200">
            <Check className="w-4 h-4" />
            <span>تم حفظ التغييرات بنجاح</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Pricing & Commissions Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <span>تسعير اشتراكات المزودين والعمولة</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                سعر الاشتراك الشهري (د.ج)
              </label>
              <input
                type="number"
                name="monthlySubscriptionPrice"
                value={formData.monthlySubscriptionPrice}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">يُدفع كل 30 يوماً</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                سعر الاشتراك السنوي (د.ج)
              </label>
              <input
                type="number"
                name="annualSubscriptionPrice"
                value={formData.annualSubscriptionPrice}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">يُدفع سنوياً (365 يوماً)</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                نسبة عمولة المنصة (%)
              </label>
              <input
                type="number"
                name="platformCommissionPercent"
                value={formData.platformCommissionPercent}
                onChange={handleChange}
                required
                min="0"
                max="100"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-black text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">تُقتطع تلقائياً من كل حجز مؤكد</p>
            </div>
          </div>
        </div>

        {/* Payment Accounts Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <span>حسابات استلام اشتراكات المزودين (BaridiMob & CCP)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                حساب بريدي موب (BaridiMob RIP)
              </label>
              <input
                type="text"
                name="baridimobAccount"
                value={formData.baridimobAccount}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                رقم الحساب البريدي الجاري (CCP)
              </label>
              <input
                type="text"
                name="ccpAccount"
                value={formData.ccpAccount}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Contact & Support Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <Phone className="w-5 h-5 text-indigo-600" />
            <span>معلومات التواصل والدعم الفني والإعلانات</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                رقم هاتف الدعم الفني المباشر
              </label>
              <input
                type="text"
                name="supportPhone"
                value={formData.supportPhone}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                البريد الإلكتروني الرسمي
              </label>
              <input
                type="email"
                name="supportEmail"
                value={formData.supportEmail}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                نص بانر "أعلن عن مشروعك معنا" في التطبيق
              </label>
              <input
                type="text"
                name="announcementText"
                value={formData.announcementText}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl text-sm font-extrabold shadow-lg shadow-blue-500/25 transition"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'جاري حفظ التغييرات...' : 'حفظ الإعدادات والتسعير'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

