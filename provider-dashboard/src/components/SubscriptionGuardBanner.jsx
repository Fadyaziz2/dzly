import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, CreditCard, Sparkles, X } from 'lucide-react';
import api from '../api/api';

export default function SubscriptionGuardBanner({ subscriptionStatus, onRefresh }) {
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [plan, setPlan] = useState('monthly');
  const [paymentMethod, setPaymentMethod] = useState('baridimob');
  const [paymentReference, setPaymentReference] = useState('');
  const [loading, setLoading] = useState(false);

  const hasActive = subscriptionStatus?.hasActiveSubscription;
  const daysLeft = subscriptionStatus?.daysLeft || 0;
  const pricing = subscriptionStatus?.pricing || {
    monthly: 5000,
    annual: 50000,
    baridimob: '007999990022334455',
    ccp: '1234567 clé 89',
  };

  const handleRenewSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/subscriptions/request-renewal', {
        plan,
        paymentMethod,
        paymentReference: paymentReference || `REF-${Date.now().toString().slice(-6)}`,
      });
      alert('تم إرسال وتفعيل اشتراكك بنجاح! يمكنك الآن إدارة خدماتك واستقبال الحجوزات.');
      setShowRenewModal(false);
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'خطأ أثناء تجديد الاشتراك');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {hasActive ? (
        <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center justify-between text-xs text-emerald-800 no-print">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              اشتراك حسابك نشط وساري المفعول (متبقي {daysLeft} يوماً). يمكنك استقبال الحجوزات بشكل طبيعي.
            </span>
          </div>
          <button
            onClick={() => setShowRenewModal(true)}
            className="text-emerald-700 hover:text-emerald-900 underline font-extrabold"
          >
            تجديد مسبق أو ترقية الباقة
          </button>
        </div>
      ) : (
        <div className="bg-rose-500 text-white px-6 py-3 flex flex-wrap items-center justify-between gap-3 shadow-md no-print">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <p className="font-extrabold text-sm">
                تنبيه أمني: اشتراك مزود الخدمة منتهٍ أو غير مفعل!
              </p>
              <p className="text-xs text-rose-100 mt-0.5">
                حسابك محمي في وضع القراءة فقط. لا يمكنك قبول حجوزات جديدة أو إضافة خدمات حتى تجديد الاشتراك.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowRenewModal(true)}
            className="bg-white hover:bg-rose-50 text-rose-600 font-black text-xs px-5 py-2 rounded-xl shadow-lg transition"
          >
            تجديد الاشتراك الآن
          </button>
        </div>
      )}

      {/* Renewal Modal */}
      {showRenewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">تجديد اشتراك مزود الخدمة</h3>
                  <p className="text-xs text-slate-400">اختر الخطة وقم بتأكيد بيانات التحويل</p>
                </div>
              </div>
              <button
                onClick={() => setShowRenewModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRenewSubmit} className="space-y-4">
              {/* Plan Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">اختر خطة الاشتراك</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPlan('monthly')}
                    className={`p-4 rounded-2xl border text-right transition ${
                      plan === 'monthly'
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span className="font-extrabold text-sm block">اشتراك شهري</span>
                    <span className="text-lg font-black text-blue-600 mt-1 block">
                      {pricing.monthly.toLocaleString()} د.ج
                    </span>
                    <span className="text-[11px] text-slate-400">صلاحية لمدة 30 يوماً</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlan('annual')}
                    className={`p-4 rounded-2xl border text-right transition ${
                      plan === 'annual'
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm">اشتراك سنوي</span>
                      <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-1.5 py-0.5 rounded">
                        توفير
                      </span>
                    </div>
                    <span className="text-lg font-black text-blue-600 mt-1 block">
                      {pricing.annual.toLocaleString()} د.ج
                    </span>
                    <span className="text-[11px] text-slate-400">صلاحية لمدة 365 يوماً</span>
                  </button>
                </div>
              </div>

              {/* Payment Bank Details */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <span className="font-bold text-slate-700 block mb-1">بيانات الحسابات الرسمية للتحويل:</span>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">بريدي موب (BaridiMob RIP):</span>
                  <span className="font-mono font-bold text-blue-700">{pricing.baridimob}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">حساب CCP الجاري:</span>
                  <span className="font-mono font-bold text-slate-800">{pricing.ccp}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">طريقة التحويل المستخدمة</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="baridimob">تطبيق بريدي موب (BaridiMob)</option>
                  <option value="ccp">حوالة بريدية بمكتب البريد (CCP)</option>
                  <option value="cash">دفع نقدي بمقر المنصة</option>
                </select>
              </div>

              {/* Payment Reference */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  رقم مرجع الحوالة / العملية البريدية
                </label>
                <input
                  type="text"
                  placeholder="مثال: BM-2026-981245 أو رقم الوصل"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRenewModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition shadow-lg shadow-blue-500/20"
                >
                  {loading ? 'جاري التأكيد...' : 'تأكيد ودفع الاشتراك'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

