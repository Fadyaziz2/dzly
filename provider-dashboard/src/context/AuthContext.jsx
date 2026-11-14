import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfileAndSubscription = async () => {
    const token = localStorage.getItem('ihjizli_provider_token');
    if (!token) {
      setUser(null);
      setSubscriptionStatus(null);
      setLoading(false);
      return;
    }

    try {
      const [userRes, subRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/subscriptions/my-status').catch(() => ({ data: { hasActiveSubscription: false } })),
      ]);

      if (userRes.data.user && (userRes.data.user.role === 'provider' || userRes.data.user.role === 'admin')) {
        setUser(userRes.data.user);
        setSubscriptionStatus(subRes.data);
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
    fetchProfileAndSubscription();

    const handleChange = () => fetchProfileAndSubscription();
    window.addEventListener('provider-auth-change', handleChange);
    return () => window.removeEventListener('provider-auth-change', handleChange);
  }, []);

  const login = async (emailOrPhone, password) => {
    const res = await api.post('/auth/login', { emailOrPhone, password });
    if (res.data.user.role !== 'provider' && res.data.user.role !== 'admin') {
      throw new Error('هذا الحساب ليس مسجلاً كمزود خدمة (Service Provider)');
    }
    localStorage.setItem('ihjizli_provider_token', res.data.token);
    localStorage.setItem('ihjizli_provider_user', JSON.stringify(res.data.user));
    await fetchProfileAndSubscription();
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('ihjizli_provider_token');
    localStorage.removeItem('ihjizli_provider_user');
    setUser(null);
    setSubscriptionStatus(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        subscriptionStatus,
        loading,
        login,
        logout,
        refreshSubscription: fetchProfileAndSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

