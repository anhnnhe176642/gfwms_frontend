'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { LogIn, UserPlus } from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import { IsLoading } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import {
  HeroBanner,
  PromoCarousel,
  FeaturedProducts,
  Categories,
  WhyUs,
  Newsletter,
} from '@/components/home';

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
      <main className="min-h-screen bg-white dark:bg-slate-900 py-12 md:py-10">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Hero Banner */}
          <div className="px-4">
            <HeroBanner />
          </div>

          {/* Promo Carousel */}
          <div className="px-4">
            <PromoCarousel />
          </div>

          {/* Categories */}
          <div className="px-4">
            <Categories />
          </div>

          {/* Featured Products */}
          <div className="px-4">
            <FeaturedProducts />
          </div>

          {/* Why Us */}
          <div className="px-4">
            <WhyUs />
          </div>

          {/* Newsletter */}
          <div className="px-4">
            <Newsletter />
          </div>

          {/* CTA Section - Only for non-authenticated users */}
          {!isAuthenticated && (
            <div className="px-4 py-12">
              <Card className="bg-linear-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-0">
                <CardHeader className="text-center space-y-4">
                  <CardTitle className="text-3xl">Bắt đầu mua sắm ngay hôm nay</CardTitle>
                  <CardDescription className="text-base">
                    Đăng nhập hoặc đăng ký tài khoản để nhận những ưu đãi độc quyền
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-3 justify-center pb-6">
                  <Button asChild size="lg" className="sm:w-auto">
                    <Link href="/auth/login">
                      <LogIn className="mr-2 h-5 w-5" />
                      Đăng nhập
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="sm:w-auto">
                    <Link href="/auth/register">
                      <UserPlus className="mr-2 h-5 w-5" />
                      Đăng ký tài khoản
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
