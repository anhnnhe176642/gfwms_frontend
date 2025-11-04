'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) return null;

  const handleSuccess = (email: string) => {
    setSuccessMessage('Đăng ký thành công! Mã xác thực đã được gửi tới email của bạn.');
    setTimeout(() => {
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4">
      <div className="w-full max-w-7xl">
        {/* Success Alert - shown above form */}
        {successMessage && (
          <div className="mb-4 p-4 text-sm text-green-700 bg-green-50 dark:bg-green-950 dark:text-green-300 border border-green-200 dark:border-green-800 rounded-md text-center">
            {successMessage}
          </div>
        )}

        <RegisterForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
