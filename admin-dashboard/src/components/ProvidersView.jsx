import React, { useState, useEffect } from 'react';
import api from '../api/api';
import {
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Clock,
  PlusCircle,
  RefreshCw,
  X,
  Phone,
  Mail,
  Building,
} from 'lucide-react';

export default function ProvidersView() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Activate Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState('');
  const [plan, setPlan] = useState('monthly');
  const [durationDays, setDurationDays] = useState(30);
  const [amountPaid, setAmountPaid] = useState(5000);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subsRes, usersRes] = await Promise.all([
        api.get('/subscriptions/admin/all'),
        api.get('/auth/users?role=provider'),
      ]);
      setSubscriptions(subsRes.data.subscriptions || []);
      setProviders(usersRes.data.users || []);
    } catch (err) {
      console.error('Error fetching providers & subs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleActivateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProviderId) {
      alert('يرجى اختيار مزود الخدمة');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/subscriptions/admin/activate', {
        providerId: selectedProviderId,
        plan,
        durationDays: Number(durationDays),
        amountPaid: Number(amountPaid),
        notes: 'تم التفعيل المباشر من لوحة الإدارة العليا',
      });
      alert('تم تفعيل / تجديد اشتراك المزود بنجاح!');
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'خطأ أثناء تفعيل الاشتراك');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePlanChange = (newPlan) => {
    setPlan(newPlan);
    if (newPlan === 'annual') {
      setDurationDays(365);
      setAmountPaid(50000);
    } else {
      setDurationDays(30);
      setAmountPaid(5000);
    }
  };

  const getSubStatusBadge = (sub) => {
    const isExpired = new Date(sub.endDate) < new Date() || sub.status === 'expired';
    if (isExpired) {
      return (
        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-full text-xs font-bold">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>منتهي الصلاحية</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold">
        <CheckCircle className="w-3.5 h-3.5" />
        <span>نشط وساري</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">إدارة مزودي الخدمات والاشتراكات الشهرية والسنوية</h2>
          <p className="text-xs text-slate-400 mt-1">
            متابعة حالة اشتراك كل مزود خدمة، سجل الدفعات، وتفعيل أو إيقاف الحسابات بناءً على دفع الاشتراك.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (providers.length > 0) setSelectedProviderId(providers[0]._id);
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>تفعيل / تجديد اشتراك مزود</span>
          </button>

          <button
            onClick={fetchData}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>تحديث</span>
          </button>
        </div>
      </div>

      {/* Subscriptions History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-800">سجل اشتراكات المزودين والمدفوعات</h3>
          <span className="text-xs font-bold text-slate-400">إجمالي السجلات: {subscriptions.length}</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span>جاري تحميل بيانات الاشتراكات...</span>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="p-12 text-center text-slate-400">لا توجد اشتراكات مسجلة بعد</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase">
                  <th className="p-4">مزود الخدمة</th>
                  <th className="p-4">الولاية والمؤسسة</th>
                  <th className="p-4">الخطة</th>
                  <th className="p-4">تاريخ البدء</th>
                  <th className="p-4">تاريخ الانتهاء</th>
                  <th className="p-4">المبلغ المسدد</th>
                  <th className="p-4">طريقة الدفع</th>
                  <th className="p-4">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subscriptions.map((sub) => (
                  <tr key={sub._id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{sub.provider?.name || 'مزود غير معروف'}</div>
                      <div className="text-xs text-slate-400 font-mono">{sub.provider?.phone}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{sub.provider?.businessName || '—'}</div>
                      <div className="text-xs text-slate-400">{sub.provider?.city}</div>
                    </td>
                    <td className="p-4 font-bold text-slate-700">
                      {sub.plan === 'annual' ? 'سنوي (12 شهر)' : 'شهري (30 يوم)'}
                    </td>
                    <td className="p-4 text-xs font-mono text-slate-600">
                      {new Date(sub.startDate).toLocaleDateString('ar-DZ')}
                    </td>
                    <td className="p-4 text-xs font-mono font-bold text-slate-800">
                      {new Date(sub.endDate).toLocaleDateString('ar-DZ')}
                    </td>
                    <td className="p-4 font-black text-emerald-600">{sub.amountPaid?.toLocaleString()} د.ج</td>
                    <td className="p-4 text-xs font-semibold text-slate-600">
                      <span className="bg-slate-100 px-2 py-0.5 rounded">
                        {sub.paymentMethod === 'baridimob'
                          ? 'بريدي موب BaridiMob'
                          : sub.paymentMethod === 'ccp'
                          ? 'حوالة بريدية CCP'
                          : sub.paymentMethod === 'admin_grant'
                          ? 'منحة إدارية'
                          : 'نقداً'}
                      </span>
                    </td>
                    <td className="p-4">{getSubStatusBadge(sub)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Activate / Extend Subscription Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">تفعيل أو تجديد اشتراك مزود خدمة</h3>
                  <p className="text-xs text-slate-400">تحديد المدة والمبلغ لتجديد الصلاحية فوراً</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleActivateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">اختر مزود الخدمة</label>
                <select
                  value={selectedProviderId}
                  onChange={(e) => setSelectedProviderId(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {providers.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.businessName || p.city}) • {p.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">خطة الاشتراك</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handlePlanChange('monthly')}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition ${
                      plan === 'monthly'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    اشتراك شهري (30 يوم)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePlanChange('annual')}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition ${
                      plan === 'annual'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    اشتراك سنوي (365 يوم)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">مدة التفعيل (أيام)</label>
                  <input
                    type="number"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    required
                    min="1"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">المبلغ المحصل (د.ج)</label>
                  <input
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    required
                    min="0"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-emerald-600"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition shadow-lg shadow-blue-500/20"
                >
                  {submitting ? 'جاري التفعيل...' : 'تأكيد وحفظ التفعيل'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

