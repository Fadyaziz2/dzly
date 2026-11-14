import React from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  Briefcase,
  Wallet,
  FileSpreadsheet,
  CreditCard,
  LogOut,
  Building,
  Pill,
  ShoppingBag,
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onLogout, user }) {
  const isPharmacy = user?.providerType === 'pharmacy' || user?.providerCategory === 'pharmacy';

  const menuItems = isPharmacy
    ? [
        { id: 'overview', label: 'لوحة المؤشرات والملخص', icon: LayoutDashboard },
        { id: 'pharmacy_orders', label: 'طلبات الأدوية والروشتات 💊', icon: ShoppingBag },
        { id: 'pharmacy_inventory', label: 'مخزون الأدوية والأسعار', icon: Pill },
        { id: 'financials', label: 'المستحقات المالية والأرباح', icon: Wallet },
        { id: 'reports', label: 'التقارير وتصدير البيانات', icon: FileSpreadsheet },
        { id: 'subscription', label: 'حالة الاشتراك والتجديد', icon: CreditCard },
      ]
    : [
        { id: 'overview', label: 'لوحة المؤشرات والملخص', icon: LayoutDashboard },
        { id: 'bookings', label: 'طلبات الحجز الواردة', icon: CalendarCheck },
        { id: 'services', label: 'خدماتي وعروضي', icon: Briefcase },
        { id: 'financials', label: 'المستحقات المالية والأرباح', icon: Wallet },
        { id: 'reports', label: 'التقارير وتصدير البيانات', icon: FileSpreadsheet },
        { id: 'subscription', label: 'حالة الاشتراك والتجديد', icon: CreditCard },
      ];
  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col justify-between shrink-0 border-l border-slate-800 select-none no-print">
      <div>
        {/* Brand */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-xl">
              Dz
            </div>
            <div>
              <div className="font-extrabold text-base tracking-wide flex items-center gap-1">
                <span>احجزلي</span>
                <span className="text-amber-400 font-black">Dz</span>
              </div>
              <p className="text-[11px] text-slate-400">بوابة شريك الخدمة (Provider)</p>
            </div>
          </div>

          {/* Business Name Badge */}
          <div className="mt-4 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-2">
            {isPharmacy ? (
              <Pill className="w-4 h-4 text-teal-400 shrink-0" />
            ) : (
              <Building className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-200 truncate">
                {user?.businessName || user?.name || 'مؤسستي'}
              </p>
              <p className="text-[10px] text-slate-400">
                {isPharmacy ? 'صيدلية معتمدة 💊' : `ولاية ${user?.city || 'الوادي'}`}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all border border-rose-500/20"
        >
          <LogOut className="w-4 h-4" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}

