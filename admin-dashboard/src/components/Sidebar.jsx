import React from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  Briefcase,
  Layers,
  Users2,
  CreditCard,
  Settings,
  LogOut,
  Building2,
  Pill,
  Image as ImageIcon,
} from 'lucide-react';

const menuItems = [
  { id: 'analytics', label: 'لوحة المؤشرات والتحليلات', icon: LayoutDashboard },
  { id: 'banners', label: 'إدارة البنرات وصور التطبيق 🎨', icon: ImageIcon },
  { id: 'bookings', label: 'إدارة الحجوزات والطلبات', icon: CalendarCheck },
  { id: 'pharmacy', label: 'الصيدليات وطلب الأدوية 💊', icon: Pill },
  { id: 'services', label: 'إدارة الخدمات والاعتماد', icon: Briefcase },
  { id: 'categories', label: 'الأقسام والحقول الديناميكية', icon: Layers },
  { id: 'providers', label: 'مزودي الخدمات والاشتراكات', icon: CreditCard },
  { id: 'users', label: 'إدارة المستخدمين', icon: Users2 },
  { id: 'settings', label: 'إعدادات المنصة والأسعار', icon: Settings },
];

export default function Sidebar({ activeTab, setActiveTab, onLogout }) {
  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col justify-between shrink-0 border-l border-slate-800 select-none">
      <div>
        {/* Logo and Brand */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 text-white font-bold text-xl">
              Dz
            </div>
            <div>
              <div className="font-extrabold text-lg tracking-wide flex items-center gap-1">
                <span>احجزلي</span>
                <span className="text-amber-400 font-black">Dz</span>
              </div>
              <p className="text-xs text-slate-400">لوحة الإدارة العليا</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
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

      {/* Logout button */}
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

