'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { LogIn, UserPlus, LayoutDashboard } from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import { IsLoading } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/layout/Header';

export default function Home() {
  const { user, isAuthenticated, isReady } = useAuth();

  if (!isReady) {
    return (
        <IsLoading />
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          {!isAuthenticated ? (
            // Not logged in
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
              <Card className="max-w-md w-full">
                <CardHeader className="text-center space-y-4">
                  <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg
                      className="h-10 w-10 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <CardTitle className="text-3xl">Chào mừng đến GFWMS</CardTitle>
                  <CardDescription className="text-base">
                    Hệ thống quản lý vải Garment Factory. Vui lòng đăng nhập để bắt đầu sử dụng.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button asChild className="w-full" size="lg">
                    <Link href="/login">
                      <LogIn className="mr-2 h-5 w-5" />
                      Đăng nhập
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="w-full" size="lg">
                    <Link href="/register">
                      <UserPlus className="mr-2 h-5 w-5" />
                      Đăng ký tài khoản
                    </Link>
                  </Button>

                  <p className="text-center text-sm text-muted-foreground pt-4">
                    Cần trợ giúp?{' '}
                    <a href="#" className="text-primary font-medium hover:underline">
                      Liên hệ bộ phận hỗ trợ
                    </a>
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Logged in
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-3xl">
                    Xin chào, {user?.username || user?.email}! 👋
                  </CardTitle>
                  <CardDescription className="text-base">
                    Chào mừng quay trở lại Hệ thống quản lý vải GFWMS
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Chức năng</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user?.permissionKeys?.includes('system:config') && (
                      <Link
                        href="/admin/dashboard"
                        className="flex flex-col items-center justify-center p-6 border-2 rounded-lg hover:border-primary hover:bg-accent transition-colors text-center group"
                      >
                        <LayoutDashboard className="h-8 w-8 mb-3 text-primary" />
                        <h3 className="font-semibold mb-1">Admin Dashboard</h3>
                        <p className="text-sm text-muted-foreground">Quản lý hệ thống</p>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
