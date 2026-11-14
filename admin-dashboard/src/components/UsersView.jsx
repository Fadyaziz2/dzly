import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Users2, Search, CheckCircle, Ban, RefreshCw, MapPin, Phone, Mail } from 'lucide-react';

export default function UsersView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (roleFilter) params.role = roleFilter;
      if (search) params.search = search;
      const res = await api.get('/auth/users', { params });
      setUsers(res.data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const toggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    const actionWord = newStatus === 'active' ? 'تفعيل' : 'تجميد';
    if (!window.confirm(`هل أنت متأكد من رغبتك في ${actionWord} حساب ${user.name}؟`)) return;

    try {
      await api.patch(`/auth/users/${user._id}/status`, { status: newStatus });
      fetchUsers();
    } catch (err) {
      alert('حدث خطأ أثناء تعديل حالة الحساب');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">إدارة المستخدمين وحسابات العملاء والمزودين</h2>
          <p className="text-xs text-slate-400 mt-1">
            استعراض كافة الحسابات المسجلة والتحكم في تفعيل أو تجميد الوصول.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="">جميع الأدوار</option>
            <option value="client">العملاء فقط (Clients)</option>
            <option value="provider">مزودو الخدمات فقط (Providers)</option>
            <option value="admin">المسؤولين (Admins)</option>
          </select>

          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>تحديث</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span>جاري تحميل المستخدمين...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-slate-400">لا يوجد مستخدمون مطابقون</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase">
                  <th className="p-4">الاسم الكامل</th>
                  <th className="p-4">بيانات التواصل</th>
                  <th className="p-4">الدور</th>
                  <th className="p-4">الولاية</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4">تاريخ التسجيل</th>
                  <th className="p-4 text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      {u.businessName && (
                        <div className="text-xs text-blue-600 font-semibold">{u.businessName}</div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-xs font-mono text-slate-700">{u.phone}</div>
                      <div className="text-xs text-slate-400">{u.email}</div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          u.role === 'admin'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : u.role === 'provider'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {u.role === 'admin' ? 'مدير' : u.role === 'provider' ? 'مزود خدمة' : 'عميل'}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-semibold text-slate-600">{u.city || '—'}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          u.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {u.status === 'active' ? 'نشط' : 'مجمد'}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-mono text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString('ar-DZ')}
                    </td>
                    <td className="p-4 text-center">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => toggleStatus(u)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 mx-auto ${
                            u.status === 'active'
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-600'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600'
                          }`}
                        >
                          {u.status === 'active' ? (
                            <>
                              <Ban className="w-3.5 h-3.5" />
                              <span>تجميد الحساب</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>تفعيل الحساب</span>
                            </>
                          )}
                        </button>
                      )}
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

