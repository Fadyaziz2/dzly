import React from 'react';
import { User, Bell, CheckCircle, AlertTriangle } from 'lucide-react';

export default function Header({ user, subscriptionStatus, title }) {
  const hasActive = subscriptionStatus?.hasActiveSubscription;
  const daysLeft = subscriptionStatus?.daysLeft || 0;

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm no-print">
      <div>
        <h1 className="text-xl font-black text-slate-900">{title}</h1>
        <p className="text-xs text-slate-400 mt-0.5">لوحة إدارة عروضك وحجوزاتك وأرباحك المباشرة</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Subscription status pill */}
        {hasActive ? (
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>الاشتراك نشط ({daysLeft} يوماً)</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 bg-rose-50 text-rose-700 px-3 py-1.5 rounded-full text-xs font-bold border border-rose-200 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>الاشتراك منتهٍ!</span>
          </div>
        )}

        {/* User profile */}
        <div className="flex items-center gap-3 pr-4 border-r border-slate-200">
          <div className="text-left">
            <p className="text-sm font-bold text-slate-800">{user?.name}</p>
            <p className="text-xs text-slate-400 font-mono">{user?.phone}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
            <User className="w-5 h-5 text-amber-400" />
          </div>
        </div>
      </div>
    </header>
  );
}

