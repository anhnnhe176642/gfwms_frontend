'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import { IsLoading } from '@/components/common';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { isAuthenticated, isReady, hasPermission } = useAuth();

  useEffect(() => {
    if (isReady) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (!hasPermission('system:config')) {
        router.replace('/');
      }
    }
  }, [isReady, isAuthenticated, hasPermission, router]);

  // Hiển thị loading khi chưa sẵn sàng hoặc kiểm tra quyền
  if (!isReady) {
    return (
      <>
        <Header />
        <IsLoading message="Đang kiểm tra quyền..." />
      </>
    );
  }

  // Nếu không có quyền hoặc chưa xác thực, không render gì (đang redirect)
  if (!isAuthenticated || !hasPermission('system:config')) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
          <main className="flex-1 overflow-auto">
            {children}
          <Footer />
          </main>
      </div>
    </div>
  );
}
