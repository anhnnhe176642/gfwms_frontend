'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import LoginForm from '@/components/auth/LoginForm';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, hasPermission } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      // Kiểm tra quyền system:config
      if (hasPermission('system:config')) {
        router.replace('/admin/dashboard');
      } else {
        // Nếu không có quyền, chuyển về trang chủ
        router.replace('/');
      }
    }
  }, [isAuthenticated, hasPermission, router]);

  if (isAuthenticated) return null;

  const handleSuccess = () => {
    // Sẽ được redirect tự động từ useEffect
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4">
      <div className="w-full max-w-5xl">
        <LoginForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
};

export default LoginPage;
