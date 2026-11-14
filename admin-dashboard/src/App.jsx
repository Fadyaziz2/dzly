import React, { useState } from 'react';
import { useAuth, AuthProvider } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AnalyticsView from './components/AnalyticsView';
import BookingsView from './components/BookingsView';
import ServicesView from './components/ServicesView';
import CategoriesView from './components/CategoriesView';
import ProvidersView from './components/ProvidersView';
import UsersView from './components/UsersView';
import SettingsView from './components/SettingsView';
import PharmacyAdminView from './components/PharmacyAdminView';
import BannersView from './components/BannersView';
import LoginView from './components/LoginView';
import { RefreshCw } from 'lucide-react';

function DashboardContent() {
  const { user, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-white">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm font-semibold">جاري تشغيل منصة احجزلي Dz...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'analytics':
        return <AnalyticsView />;
      case 'banners':
        return <BannersView />;
      case 'bookings':
        return <BookingsView />;
      case 'pharmacy':
        return <PharmacyAdminView />;
      case 'services':
        return <ServicesView />;
      case 'categories':
        return <CategoriesView />;
      case 'providers':
        return <ProvidersView />;
      case 'users':
        return <UsersView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <AnalyticsView />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'analytics':
        return 'لوحة المؤشرات والتحليلات العامة';
      case 'banners':
        return 'إدارة البنرات والصور الترويجية للتطبيق';
      case 'bookings':
        return 'إدارة الحجوزات والعمليات التشغيلية';
      case 'pharmacy':
        return 'إدارة الصيدليات وطلبات الأدوية والروشتات';
      case 'services':
        return 'إدارة الخدمات واعتماد العروض';
      case 'categories':
        return 'الأقسام الثمانية والحقول الديناميكية';
      case 'providers':
        return 'إدارة مزودي الخدمات والاشتراكات';
      case 'users':
        return 'إدارة حسابات المستخدمين';
      case 'settings':
        return 'إعدادات المنصة وتسعير الاشتراكات والعمولة';
      default:
        return 'لوحة التحكم';
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header user={user} title={getPageTitle()} />
        <main className="p-8 flex-1 overflow-y-auto">{renderContent()}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}

