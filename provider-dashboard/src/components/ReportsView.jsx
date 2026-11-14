import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { FileSpreadsheet, Printer, Download, Calendar, RefreshCw } from 'lucide-react';

export default function ReportsView({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReportsData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/financials/provider');
      setData(res.data);
    } catch (err) {
      console.error('Error fetching reports data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  const exportToCSV = () => {
    if (!data?.transactions || data.transactions.length === 0) {
      alert('لا توجد بيانات متاحة للتصدير');
      return;
    }

    // CSV header with UTF-8 BOM for Arabic support in Excel
    const headers = ['رقم الحجز', 'الخدمة', 'اسم العميل', 'تاريخ الحجز', 'المبلغ الإجمالي (د.ج)', 'عمولة المنصة (د.ج)', 'صافي المستحقات (د.ج)', 'الحالة'];
    const rows = data.transactions.map((tx) => [
      tx.bookingCode,
      `"${tx.serviceTitle.replace(/"/g, '""')}"`,
      `"${tx.customerName.replace(/"/g, '""')}"`,
      tx.date,
      tx.totalPrice,
      tx.commissionAmount,
      tx.providerNet,
      tx.status,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `تقرير_احجزلي_Dz_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Control Bar (Hidden when printing) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">استخراج وتصدير التقارير المالية والتشغيلية</h2>
          <p className="text-xs text-slate-400 mt-1">
            سحب تقارير الحجوزات، كشف الأرباح، والطباعة بصيغة معتمدة.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition"
          >
            <Download className="w-4 h-4" />
            <span>تصدير Excel (CSV)</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة التقرير (Print)</span>
          </button>
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
        {/* Report Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-6">
          <div>
            <div className="text-xl font-black text-slate-900">
              منصة احجزلي <span className="text-amber-500">Dz</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">كشف الحساب المالي والتشغيلي لمزود الخدمة</p>
          </div>

          <div className="text-left">
            <h3 className="font-extrabold text-sm text-slate-800">
              {user?.businessName || user?.name}
            </h3>
            <p className="text-xs text-slate-400 font-mono">ولاية {user?.city} • {user?.phone}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">تاريخ الإصدار: {new Date().toLocaleDateString('ar-DZ')}</p>
          </div>
        </div>

        {/* Summary Boxes */}
        <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
          <div>
            <span className="text-xs text-slate-400 font-bold">إجمالي الحجوزات</span>
            <div className="text-lg font-black text-slate-900 mt-0.5">
              {data?.summary?.totalBookingsCount || 0} حجز
            </div>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold">إجمالي التداول (Gross)</span>
            <div className="text-lg font-black text-slate-900 mt-0.5">
              {(data?.summary?.confirmedEarnings || 0).toLocaleString()} د.ج
            </div>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold">صافي المستحقات (Net Payout)</span>
            <div className="text-lg font-black text-emerald-600 mt-0.5">
              {(data?.summary?.netReceivable || 0).toLocaleString()} د.ج
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
                <th className="p-3">رقم الحجز</th>
                <th className="p-3">الخدمة</th>
                <th className="p-3">العميل</th>
                <th className="p-3">التاريخ</th>
                <th className="p-3">المبلغ الإجمالي</th>
                <th className="p-3">عمولة المنصة</th>
                <th className="p-3">صافي الربح</th>
                <th className="p-3">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data?.transactions?.map((tx) => (
                <tr key={tx.id}>
                  <td className="p-3 font-mono font-bold text-blue-700">#{tx.bookingCode}</td>
                  <td className="p-3 font-bold text-slate-800">{tx.serviceTitle}</td>
                  <td className="p-3 text-slate-600">{tx.customerName}</td>
                  <td className="p-3 font-mono text-slate-500">{tx.date}</td>
                  <td className="p-3 font-black text-slate-900">{tx.totalPrice?.toLocaleString()} د.ج</td>
                  <td className="p-3 font-semibold text-rose-600">-{tx.commissionAmount?.toLocaleString()} د.ج</td>
                  <td className="p-3 font-black text-emerald-700">+{tx.providerNet?.toLocaleString()} د.ج</td>
                  <td className="p-3 font-bold text-slate-700">{tx.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Seal */}
        <div className="pt-8 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
          <p>هذا التقرير تم استخراجه آلياً عبر منظومة احجزلي Dz للخدمات والتأجير.</p>
          <p className="font-mono font-bold text-slate-500">DZLY-VERIFIED-REPORT</p>
        </div>
      </div>
    </div>
  );
}

