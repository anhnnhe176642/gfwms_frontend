'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import RegisterForm from './RegisterForm';

export const RegisterPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) return null;

  const handleSuccess = () => {
    setSuccessMessage('Đăng ký thành công! Đang chuyển hướng...');
    setTimeout(() => {
      router.push('/login');
    }, 1500);
  };

  return (
    <div className="font-sans">
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 to-blue-50 py-8 px-4">
        <div className="relative sm:max-w-md w-full mx-4 my-8">
          {/* Decorative Cards */}
          <div className="card bg-green-400 shadow-lg w-full h-full rounded-3xl absolute transform -rotate-6" />
          <div className="card bg-purple-400 shadow-lg w-full h-full rounded-3xl absolute transform rotate-6" />

          {/* Main Form Card */}
          <div className="relative w-full rounded-3xl px-6 py-4 bg-gray-100 shadow-md">
            {/* Header */}
            <label className="block mt-3 text-sm text-gray-700 text-center font-semibold">
              Đăng Ký Tài Khoản
            </label>

            {/* Success Alert */}
            {successMessage && (
              <div className="mt-5 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            )}

            {/* Form */}
            <RegisterForm onSuccess={handleSuccess} />

            {/* Login Link */}
            <div className="mt-5 mb-2">
              <div className="flex justify-center items-center gap-2">
                <label className="text-sm text-gray-600">Đã có tài khoản?</label>
                <a
                  href="/login"
                  className="text-blue-500 hover:text-blue-600 transition duration-500 ease-in-out transform hover:scale-105 font-semibold"
                >
                  Đăng nhập
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
