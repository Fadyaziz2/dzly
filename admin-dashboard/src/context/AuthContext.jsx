import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('ihjizli_admin_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/auth/me');
      if (res.data.user && res.data.user.role === 'admin') {
        setUser(res.data.user);
      } else {
        logout();
      }
    } catch (err) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();

    const handleAuthChange = () => fetchCurrentUser();
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  const login = async (emailOrPhone, password) => {
    const res = await api.post('/auth/login', { emailOrPhone, password });
    if (res.data.user.role !== 'admin') {
      throw new Error('هذا الحساب ليس لديه صلاحية الدخول كمسؤول إدارة (Admin)');
    }
    localStorage.setItem('ihjizli_admin_token', res.data.token);
    localStorage.setItem('ihjizli_admin_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('ihjizli_admin_token');
    localStorage.removeItem('ihjizli_admin_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser: fetchCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

