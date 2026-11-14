import React, { useState, useEffect } from 'react';
import api from '../api/api';
import {
  Users,
  Briefcase,
  CalendarCheck,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export default function AnalyticsView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/financials/admin');
      setData(res.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-500">جاري تحميل المؤشرات والبيانات المالية...</p>
        </div>
      </div>
    );
  }

  const { kpis, statusCounts, categoryStats } = data || {};

  const statCards = [
    {
      title: 'إجمالي المستخدمين (العملاء)',
      value: kpis?.totalUsers || 0,
      unit: 'مستخدم',
      icon: Users,
      color: 'blue',
      desc: 'حسابات العملاء المسجلين في التطبيق',
    },
    {
      title: 'مزودو الخدمات النشطون',
      value: kpis?.activeProvidersCount || 0,
      unit: `من أصل ${kpis?.totalProviders || 0}`,
      icon: Briefcase,
      color: 'emerald',
      desc: 'مزودون باشتراك ساري المفعول',
    },
    {
      title: 'إجمالي الحجوزات المسجلة',
      value: kpis?.totalBookingsCount || 0,
      unit: 'حجز',
      icon: CalendarCheck,
      color: 'indigo',
      desc: 'في كافة الولايات والتصنيفات',
    },
    {
      title: 'إجمالي حجم التداول (Gross Volume)',
      value: (kpis?.totalGrossBookingVolume || 0).toLocaleString(),
      unit: 'د.ج',
      icon: TrendingUp,
      color: 'amber',
      desc: 'القيمة المالية لكافة الحجوزات',
    },
    {
      title: 'أرباح اشتراكات المزودين',
      value: (kpis?.totalSubscriptionRevenue || 0).toLocaleString(),
      unit: 'د.ج',
      icon: DollarSign,
      color: 'purple',
      desc: 'العوائد الثابتة من الباقات الشهرية والسنوية',
    },
    {
      title: 'أرباح عمولات الحجوزات الناجحة',
      value: (kpis?.totalCommissionRevenue || 0).toLocaleString(),
      unit: 'د.ج',
      icon: ShieldCheck,
      color: 'teal',
      desc: 'النسبة المستقطعة من الحجوزات المكتملة',
    },
  ];

  const getColorClasses = (color) => {
    switch (color) {
      case 'blue':
        return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', badge: 'bg-blue-500/10 text-blue-700' };
      case 'emerald':
        return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', badge: 'bg-emerald-500/10 text-emerald-700' };
      case 'indigo':
        return { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', badge: 'bg-indigo-500/10 text-indigo-700' };
      case 'amber':
        return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', badge: 'bg-amber-500/10 text-amber-700' };
      case 'purple':
        return { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', badge: 'bg-purple-500/10 text-purple-700' };
      case 'teal':
        return { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-100', badge: 'bg-teal-500/10 text-teal-700' };
      default:
        return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100', badge: 'bg-slate-500/10 text-slate-700' };
    }
  };

  return (
    <div className="space-y-8">
      {/* Banner / Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-2xl font-black">مرحباً بك في مركز القيادة والتحليلات</h2>
          <p className="text-blue-200 text-sm mt-1">
            متابعة حية وشاملة للحجوزات، إيرادات الاشتراكات، والعمولات في كل ولايات الجزائر.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold border border-white/20">
            صافي أرباح المنصة الإجمالية:{' '}
            <span className="text-amber-300 font-black text-sm">
              {(kpis?.totalPlatformProfit || 0).toLocaleString()} د.ج
            </span>
          </div>
          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg shadow-blue-500/30"
          >
            <RefreshCw className="w-4 h-4" />
            <span>تحديث البيانات</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, idx) => {
          const c = getColorClasses(card.color);
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`bg-white p-6 rounded-2xl border ${c.border} shadow-sm hover:shadow-md transition`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-500">{card.title}</span>
                <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center ${c.text}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">{card.value}</span>
                <span className="text-xs font-bold text-slate-500">{card.unit}</span>
              </div>
              <p className="text-xs text-slate-400 mt-2 font-medium">{card.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Booking Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-extrabold text-slate-800 mb-4 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-blue-600" />
            <span>توزيع الحالات التشغيلية للحجوزات</span>
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50 border border-amber-100">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-600" />
                <span className="font-bold text-sm text-slate-700">بانتظار تأكيد المزود (Pending)</span>
              </div>
              <span className="text-lg font-black text-amber-700">{statusCounts?.pending || 0}</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50 border border-blue-100">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-sm text-slate-700">حجوزات مؤكدة (Confirmed)</span>
              </div>
              <span className="text-lg font-black text-blue-700">{statusCounts?.confirmed || 0}</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-sm text-slate-700">خدمات مكتملة بنجاح (Completed)</span>
              </div>
              <span className="text-lg font-black text-emerald-700">{statusCounts?.completed || 0}</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-rose-50 border border-rose-100">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-rose-600" />
                <span className="font-bold text-sm text-slate-700">حجوزات ملغاة أو مرفوضة (Cancelled / Rejected)</span>
              </div>
              <span className="text-lg font-black text-rose-700">
                {(statusCounts?.cancelled || 0) + (statusCounts?.rejected || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Categories Performance */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-extrabold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <span>حجم التداول بحسب الأقسام والأنشطة</span>
          </h3>

          <div className="space-y-3">
            {categoryStats && Object.keys(categoryStats).length > 0 ? (
              Object.entries(categoryStats).map(([catId, stat]) => (
                <div key={catId} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-slate-800">قسم: {catId}</span>
                    <span className="text-xs text-slate-500 mr-2">({stat.count} حجز)</span>
                  </div>
                  <span className="font-black text-sm text-indigo-600">{stat.revenue.toLocaleString()} د.ج</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 text-center py-8">لا توجد حجوزات مكتملة حتى الآن لإظهار التحليل</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

