import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

export default function LoginView() {
  const { login } = useAuth();
  const [emailOrPhone, setEmailOrPhone] = useState('admin@dzly.com');
  const [password, setPassword] = useState('admin123456');
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

  const handleQuickFill = () => {
    setEmailOrPhone('admin@dzly.com');
    setPassword('admin123456');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 selection:bg-blue-500 selection:text-white">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-blue-500/30">
            <ShieldCheck className="w-9 h-9 text-amber-300" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-wide">
            احجزلي <span className="text-amber-500">Dz</span>
          </h1>
          <p className="text-xs font-bold text-slate-400">بوابة الإدارة المركزية العليا (Admin Portal)</p>
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                placeholder="admin@dzly.com"
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                placeholder="••••••••"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 transition flex items-center justify-center gap-2 text-sm"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'جاري التحقق...' : 'دخول إلى لوحة التحكم'}</span>
          </button>
        </form>

        {/* Demo Helper */}
        <div className="pt-4 border-t border-slate-100 text-center space-y-2">
          <p className="text-xs text-slate-400">حساب تجريبي جاهز للاختبار الفوري:</p>
          <button
            type="button"
            onClick={handleQuickFill}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition inline-block"
          >
            admin@dzly.com / admin123456
          </button>
        </div>
      </div>
    </div>
  );
}

