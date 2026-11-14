import React, { useState } from 'react';
import api from '../api/api';
import { CreditCard, CheckCircle, AlertTriangle, Clock, RefreshCw, Check } from 'lucide-react';

export default function SubscriptionView({ subscriptionStatus, onRefresh }) {
  const [plan, setPlan] = useState('monthly');
  const [paymentMethod, setPaymentMethod] = useState('baridimob');
  const [paymentReference, setPaymentReference] = useState('');
  const [loading, setLoading] = useState(false);

  const hasActive = subscriptionStatus?.hasActiveSubscription;
  const activeSub = subscriptionStatus?.activeSubscription;
  const daysLeft = subscriptionStatus?.daysLeft || 0;
  const pricing = subscriptionStatus?.pricing || {
    monthly: 5000,
    annual: 50000,
    baridimob: '007999990022334455',
    ccp: '1234567 clé 89',
  };

  const handleRenew = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/subscriptions/request-renewal', {
        plan,
        paymentMethod,
        paymentReference: paymentReference || `REF-${Date.now().toString().slice(-6)}`,
      });
      alert('تم إرسال وتفعيل طلب اشتراكك بنجاح!');
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'خطأ أثناء تقديم طلب الاشتراك');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">حالة اشتراك مزود الخدمة والتجديد</h2>
          <p className="text-xs text-slate-400 mt-1">
            متابعة مدة الاشتراك المتبقية، وسداد الرسوم الدورية عبر بريدي موب أو CCP.
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition"
        >
          <RefreshCw className="w-4 h-4" />
          <span>تحديث الحالة</span>
        </button>
      </div>

      {/* Current Status Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <span>الاشتراك الحالي</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-400 font-bold block mb-1">حالة الحساب</span>
            <div className="flex items-center gap-2">
              {hasActive ? (
                <>
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span className="font-black text-base text-emerald-600">نشط وساري المفعول</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <span className="font-black text-base text-rose-600">منتهي أو غير مفعل</span>
                </>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-400 font-bold block mb-1">الأيام المتبقية</span>
            <div className="text-2xl font-black text-slate-900">
              {daysLeft} <span className="text-xs font-bold text-slate-400">يوماً</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-400 font-bold block mb-1">تاريخ الانتهاء</span>
            <div className="text-sm font-black text-slate-800 font-mono mt-1">
              {activeSub ? new Date(activeSub.endDate).toLocaleDateString('ar-DZ') : 'غير متوفر'}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Info & Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-600" />
          <span>تجديد الاشتراك أو ترقية الباقة</span>
        </h3>

        {/* Bank details */}
        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs space-y-2">
          <span className="font-black text-blue-900 block mb-1">بيانات الحسابات الرسمية المعتمدة:</span>
          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-bold">بريدي موب (BaridiMob RIP):</span>
            <span className="font-mono font-black text-blue-700 text-sm">{pricing.baridimob}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-bold">حساب البريد الجاري (CCP):</span>
            <span className="font-mono font-black text-slate-800 text-sm">{pricing.ccp}</span>
          </div>
        </div>

        <form onSubmit={handleRenew} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">اختر الباقة</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPlan('monthly')}
                className={`p-4 rounded-2xl border text-right transition ${
                  plan === 'monthly'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-900'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                <span className="font-bold text-sm block">باقة شهرية (30 يوماً)</span>
                <span className="text-lg font-black text-blue-600 mt-1 block">
                  {pricing.monthly.toLocaleString()} د.ج
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPlan('annual')}
                className={`p-4 rounded-2xl border text-right transition ${
                  plan === 'annual'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-900'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                <span className="font-bold text-sm block">باقة سنوية (365 يوماً)</span>
                <span className="text-lg font-black text-blue-600 mt-1 block">
                  {pricing.annual.toLocaleString()} د.ج
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">طريقة السداد</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold"
              >
                <option value="baridimob">بريدي موب (BaridiMob)</option>
                <option value="ccp">حوالة بريدية CCP</option>
                <option value="cash">نقداً بمقر المنصة</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                رقم المرجع أو وصل التحويل
              </label>
              <input
                type="text"
                placeholder="مثال: REF-998822"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-blue-500/20 transition text-sm"
          >
            {loading ? 'جاري التأكيد والتجديد...' : 'تأكيد السداد وتفعيل الاشتراك فوراً'}
          </button>
        </form>
      </div>
    </div>
  );
}

