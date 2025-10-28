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
  const { isAuthenticated, isReady } = useAuth();

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isReady, isAuthenticated, router]);

  // Hiển thị loading khi chưa sẵn sàng
  if (!isReady) {
    return (
      <>
        <Header />
        <IsLoading message="Đang tải..." />
      </>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 min-w-0 overflow-x-hidden">
          {children}
          <Footer />
        </main>
      </div>
    </div>
  );
}
