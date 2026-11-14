import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building, Mail, Lock, LogIn, AlertCircle, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function LoginView() {
  const { login } = useAuth();
  const [emailOrPhone, setEmailOrPhone] = useState('provider.active@dzly.com');
  const [password, setPassword] = useState('provider123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(emailOrPhone, password);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  const handleFillActive = () => {
    setEmailOrPhone('provider.active@dzly.com');
    setPassword('provider123456');
  };

  const handleFillExpired = () => {
    setEmailOrPhone('provider.expired@dzly.com');
    setPassword('provider123456');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 selection:bg-amber-500 selection:text-white">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/30">
            <Building className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-wide">
            احجزلي <span className="text-amber-500">Dz</span>
          </h1>
          <p className="text-xs font-bold text-slate-400">بوابة شركاء ومزودي الخدمات (Provider Portal)</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              البريد الإلكتروني أو الهاتف
            </label>
            <div className="relative">
              <input
                type="text"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 pr-10"
                placeholder="provider@dzly.com"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">كلمة المرور</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 pr-10"
                placeholder="••••••••"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm"
          >
            <LogIn className="w-4 h-4 text-amber-400" />
            <span>{loading ? 'جاري التحقق...' : 'دخول إلى بوابة المزود'}</span>
          </button>
        </form>

        {/* Demo Fast Logins */}
        <div className="pt-4 border-t border-slate-100 text-center space-y-2">
          <p className="text-xs text-slate-400 font-bold">حسابات تجريبية لاختبار المنظومة فوراً:</p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleFillActive}
              className="w-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 p-2.5 rounded-xl text-xs font-semibold text-right flex items-center justify-between transition"
            >
              <div>
                <span className="font-bold block">1. مزود نشط باشتراك ساري:</span>
                <span className="font-mono text-[11px] text-emerald-700">provider.active@dzly.com</span>
              </div>
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </button>

            <button
              type="button"
              onClick={handleFillExpired}
              className="w-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 p-2.5 rounded-xl text-xs font-semibold text-right flex items-center justify-between transition"
            >
              <div>
                <span className="font-bold block">2. مزود منتهي الاشتراك (لاختبار الحماية):</span>
                <span className="font-mono text-[11px] text-rose-700">provider.expired@dzly.com</span>
              </div>
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

