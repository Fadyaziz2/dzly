import React, { useState } from 'react';
import { useAuth, AuthProvider } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SubscriptionGuardBanner from './components/SubscriptionGuardBanner';
import OverviewView from './components/OverviewView';
import BookingsView from './components/BookingsView';
import ServicesView from './components/ServicesView';
import FinancialsView from './components/FinancialsView';
import ReportsView from './components/ReportsView';
import SubscriptionView from './components/SubscriptionView';
import LoginView from './components/LoginView';
import { RefreshCw } from 'lucide-react';

function ProviderAppContent() {
  const { user, subscriptionStatus, loading, logout, refreshSubscription } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-white">
          <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-sm font-semibold">جاري فتح بوابة شريك احجزلي Dz...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewView onNavigateToBookings={() => setActiveTab('bookings')} />;
      case 'bookings':
        return (
          <BookingsView
            subscriptionStatus={subscriptionStatus}
            onRefreshSubscription={refreshSubscription}
          />
        );
      case 'services':
        return <ServicesView subscriptionStatus={subscriptionStatus} />;
      case 'financials':
        return <FinancialsView />;
      case 'reports':
        return <ReportsView user={user} />;
      case 'subscription':
        return (
          <SubscriptionView
            subscriptionStatus={subscriptionStatus}
            onRefresh={refreshSubscription}
          />
        );
      default:
        return <OverviewView onNavigateToBookings={() => setActiveTab('bookings')} />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'overview':
        return 'لوحة المؤشرات والملخص العام';
      case 'bookings':
        return 'إدارة طلبات الحجز الواردة';
      case 'services':
        return 'إدارة خدماتي وعروضي الترويجية';
      case 'financials':
        return 'المستحقات المالية وسجل الأرباح';
      case 'reports':
        return 'التقارير المالية وتصدير البيانات';
      case 'subscription':
        return 'حالة اشتراك الحساب وباقات التجديد';
      default:
        return 'لوحة التحكم';
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} user={user} />
      <div className="flex-1 flex flex-col min-w-0">
        <SubscriptionGuardBanner
          subscriptionStatus={subscriptionStatus}
          onRefresh={refreshSubscription}
        />
        <Header user={user} subscriptionStatus={subscriptionStatus} title={getPageTitle()} />
        <main className="p-8 flex-1 overflow-y-auto">{renderContent()}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ProviderAppContent />
    </AuthProvider>
  );
}

