import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Xác thực Email - GFWMS',
  description: 'Xác thực địa chỉ email của bạn',
};

export default function VerifyEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
