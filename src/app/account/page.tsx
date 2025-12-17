import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { AccountContent } from '@/components/account/AccountContent';

export default function AccountPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
        <div className="container mx-auto px-4">
          <Suspense fallback={<div className="h-64" />}>
            <AccountContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
