'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { IsLoading } from '@/components/common';
import FabricCategoryDetail from '@/components/shop/FabricCategoryDetail';

export default function ShopPage() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('category');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  if (!isReady) {
    return <IsLoading />;
  }

  if (!categoryId) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-white dark:bg-slate-900 py-12">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="text-3xl font-bold">Danh mục sản phẩm</h1>
            <p className="text-muted-foreground mt-2">Vui lòng chọn một danh mục từ trang chủ</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white dark:bg-slate-900 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <FabricCategoryDetail categoryId={categoryId} />
        </div>
      </main>
      <Footer />
    </>
  );
}
