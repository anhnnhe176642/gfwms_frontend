'use client';
import React, { Suspense, use } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { IsLoading } from '@/components/common';
import FabricColorDetailPage from '@/components/shop/FabricColorDetailPage';

interface PageProps {
  params: Promise<{ colorId: string }>;
}

function ColorDetailContent({ colorId }: { colorId: string }) {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('category');

  return (
    <FabricColorDetailPage 
      colorId={colorId} 
      categoryId={categoryId || undefined} 
    />
  );
}

export default function ColorDetailPage({ params }: PageProps) {
  const { colorId } = use(params);
  
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white dark:bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <Suspense fallback={<IsLoading />}>
            <ColorDetailContent colorId={decodeURIComponent(colorId)} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
