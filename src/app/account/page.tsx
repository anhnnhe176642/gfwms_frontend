'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, ShoppingCart, Package, CreditCard, LogOut } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { ProfileTab } from '@/components/account/ProfileTab';
import { CartTab } from '@/components/account/CartTab';
import { OrdersTab as OrdersAccountTab } from '@/components/account/OrdersTab';
import { DebtManagementTab } from '@/components/account/DebtManagementTab';
import { useAuthStore } from '@/store/useAuthStore';

type TabType = 'profile' | 'cart' | 'orders' | 'debt';

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'profile', label: 'Thông tin cá nhân', icon: <User className="w-5 h-5" /> },
  { id: 'cart', label: 'Giỏ hàng', icon: <ShoppingCart className="w-5 h-5" /> },
  { id: 'orders', label: 'Đơn hàng', icon: <Package className="w-5 h-5" /> },
  { id: 'debt', label: 'Quản lí công nợ', icon: <CreditCard className="w-5 h-5" /> },
];

export default function AccountPage() {
  const { user, isAuthenticated, isReady } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const router = useRouter();
  const searchParams = useSearchParams();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  // Redirect to login if not authenticated (only after auth is ready)
  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isReady, isAuthenticated, router]);

  // Set active tab from query parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['profile', 'cart', 'orders', 'debt'].includes(tabParam)) {
      setActiveTab(tabParam as TabType);
    }
  }, [searchParams]);

  // Show loading while auth is initializing
  if (!isReady) {
    return null;
  }

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = () => {
    clearAuth();
    router.push('/');
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow sticky top-8">
                <nav className="p-4 space-y-2">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-medium border-l-4 border-blue-600'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                  <div className="border-t dark:border-slate-700 pt-2 mt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </nav>
              </div>
            </aside>

            {/* Content */}
            <div className="lg:col-span-3">
              {activeTab === 'profile' && <ProfileTab />}
              {activeTab === 'cart' && <CartTab />}
              {activeTab === 'orders' && <OrdersAccountTab />}
              {activeTab === 'debt' && <DebtManagementTab />}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
