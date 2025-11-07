'use client';
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function HeroBanner() {
  return (
    <div className="relative w-full h-96 rounded-lg overflow-hidden group">
      {/* Background Image */}
      <img
        src="https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=1200&h=500&fit=crop"
        alt="Hero Banner"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
          Khám phá bộ sưu tập vải cao cấp
        </h1>
        <p className="text-lg md:text-xl mb-8 drop-shadow-lg max-w-2xl">
          Chất lượng tốt nhất, giá cạnh tranh, giao hàng nhanh chóng
        </p>
        <Button size="lg" asChild className="bg-primary hover:bg-primary/90">
          <Link href="/shop" className="flex items-center gap-2">
            Mua sắm ngay
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
