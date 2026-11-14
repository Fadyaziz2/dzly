import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Wallet, TrendingUp, DollarSign, Percent, Clock, RefreshCw } from 'lucide-react';

export default function FinancialsView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchFinancials = async () => {
    setLoading(true);
    try {
      const res = await api.get('/financials/provider');
      setData(res.data);
    } catch (err) {
      console.error('Error fetching financials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancials();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        <span>جاري تحميل التقرير المالي...</span>
      </div>
    );
  }

  const { summary, transactions } = data || {};

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">المستحقات المالية والأرباح</h2>
          <p className="text-xs text-slate-400 mt-1">
            تقرير تفصيلي بالإيرادات الإجمالية، عمولات المنصة المستقطعة، والرصيد الصافي القابل للصرف.
          </p>
        </div>
        <button
          onClick={fetchFinancials}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition"
        >
          <RefreshCw className="w-4 h-4" />
          <span>تحديث</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 block mb-1">صافي الأرباح المحققة</span>
          <div className="text-2xl font-black text-emerald-600">
            {(summary?.netReceivable || 0).toLocaleString()} د.ج
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-semibold">مستحقاتك الصافية القابلة للسحب</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 block mb-1">إجمالي الإيرادات (Gross)</span>
          <div className="text-2xl font-black text-slate-900">
            {(summary?.confirmedEarnings || 0).toLocaleString()} د.ج
          </div>
          <p className="text-[11px] text-slate-400 mt-1">قيمة الحجوزات المؤكدة والمكتملة</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 block mb-1">عمولة المنصة المخصومة</span>
          <div className="text-2xl font-black text-rose-600">
            {(summary?.platformCommissions || 0).toLocaleString()} د.ج
          </div>
          <p className="text-[11px] text-slate-400 mt-1">نسبة المنصة المحددة في النظام</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 block mb-1">المبالغ المعلقة (Pending)</span>
          <div className="text-2xl font-black text-amber-600">
            {(summary?.pendingAmount || 0).toLocaleString()} د.ج
          </div>
          <p className="text-[11px] text-slate-400 mt-1">تضاف لصافيك فور قبول الطلبات</p>
        </div>
      </div>

      {/* Financial Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-800">حركات الحجوزات والتسويات المالية</h3>
          <span className="text-xs font-bold text-slate-400">إجمالي العمليات: {transactions?.length || 0}</span>
        </div>

        {transactions?.length === 0 ? (
          <div className="p-12 text-center text-slate-400">لا توجد حركات مالية مسجلة بعد</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase">
                  <th className="p-4">رقم الحجز</th>
                  <th className="p-4">الخدمة</th>
                  <th className="p-4">العميل</th>
                  <th className="p-4">الموعد</th>
                  <th className="p-4">المبلغ الإجمالي</th>
                  <th className="p-4">العمولة المستقطعة</th>
                  <th className="p-4">صافي أرباحك</th>
                  <th className="p-4">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-mono font-bold text-blue-600">#{tx.bookingCode}</td>
                    <td className="p-4 font-extrabold text-slate-800">{tx.serviceTitle}</td>
                    <td className="p-4 text-xs font-semibold text-slate-700">{tx.customerName}</td>
                    <td className="p-4 text-xs font-mono text-slate-500">{tx.date}</td>
                    <td className="p-4 font-black text-slate-900">{tx.totalPrice?.toLocaleString()} د.ج</td>
                    <td className="p-4 font-bold text-rose-600">-{tx.commissionAmount?.toLocaleString()} د.ج</td>
                    <td className="p-4 font-black text-emerald-600">+{tx.providerNet?.toLocaleString()} د.ج</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          tx.status === 'confirmed'
                            ? 'bg-blue-50 text-blue-700'
                            : tx.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : tx.status === 'pending'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

