'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { CreateCreditRequestForm } from '@/components/profile/credit-request/CreateCreditRequestForm';
import { ArrowLeft } from 'lucide-react';

export default function RequestCreditLimitPage() {
  const router = useRouter();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white dark:bg-slate-900 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="mb-6 flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">Đăng ký hạn mức Công nợ</h1>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-6">
              Điền thông tin dưới đây để gửi yêu cầu đăng ký hạn mức Công nợ. Admin sẽ xem xét và phê duyệt trong thời gian sớm nhất.
            </p>
            <CreateCreditRequestForm isCustomerForm={true} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
