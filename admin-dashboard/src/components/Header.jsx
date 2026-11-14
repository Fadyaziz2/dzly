import React from 'react';
import { ShieldCheck, Bell, Search, ExternalLink } from 'lucide-react';

export default function Header({ user, title }) {
  return (
    <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800">{title}</h1>
          <p className="text-xs text-slate-400 mt-0.5">منظومة الإشراف والتحكم المركزي • الجمهورية الجزائرية</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Quick status badge */}
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3.5 py-1.5 rounded-full text-xs font-bold border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>السيرفر متصل بنجاح</span>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3 pr-4 border-r border-slate-200">
          <div className="text-left">
            <p className="text-sm font-bold text-slate-800">{user?.name || 'مدير المنصة'}</p>
            <p className="text-xs text-blue-600 font-semibold">{user?.email}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
            <ShieldCheck className="w-5 h-5 text-amber-300" />
          </div>
        </div>
      </div>
    </header>
  );
}

