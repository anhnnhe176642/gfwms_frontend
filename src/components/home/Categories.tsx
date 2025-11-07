'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  image: string;
  count: number;
  color: string;
}

const categories: Category[] = [
  {
    id: '1',
    name: 'Vải Cotton',
    image: 'https://onoff.vn/blog/wp-content/uploads/2018/11/vai-cotton.jpg',
    count: 245,
    color: 'from-blue-400 to-blue-600',
  },
  {
    id: '2',
    name: 'Vải Polyester',
    image: 'https://hoangphuconline.vn/media/magefan_blog/2022/02/vai-poly-ava-e1646023341901.jpg',
    count: 182,
    color: 'from-purple-400 to-purple-600',
  },
  {
    id: '3',
    name: 'Vải Len',
    image: 'https://ducthao.vn/storage/product/2/vai-len.webp',
    count: 156,
    color: 'from-orange-400 to-orange-600',
  },
  {
    id: '4',
    name: 'Vải Silk',
    image: 'https://app.gak.vn/storage/uploads/RVWoTp7zcbCJQt5gakhSUDSTH53TCE3ZmH8qkFnk.jpg',
    count: 98,
    color: 'from-pink-400 to-pink-600',
  },
  {
    id: '5',
    name: 'Vải Linen',
    image: 'https://bizweb.dktcdn.net/100/364/149/products/dsc09323-f058bc45-5ad5-4d13-912e-2ce2fa75fa87.jpg?v=1638777846393',
    count: 127,
    color: 'from-green-400 to-green-600',
  },
  {
    id: '6',
    name: 'Vải Blended',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSaWsvihWr8nbmD4OJ9849lKQ0jx-BDF5B_bg&s',
    count: 203,
    color: 'from-red-400 to-red-600',
  },
];

interface CategoriesProps {
  title?: string;
  description?: string;
}

export default function Categories({ title = 'Danh mục sản phẩm', description = 'Khám phá các loại vải khác nhau' }: CategoriesProps) {
  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        <p className="text-muted-foreground mt-2">{description}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/shop?category=${category.id}`}
            className="group"
          >
            <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-0 relative overflow-hidden h-40">
                {/* Background Image */}
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />

                {/* Overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-80 transition-opacity duration-300 flex flex-col justify-end p-4 text-white"
                style={{
                  backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.6), transparent)`,
                }}
                >
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="text-xs opacity-90">{category.count} sản phẩm</p>
                </div>

                {/* Text Overlay (always visible) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
                  <h3 className="font-bold text-lg drop-shadow-lg">{category.name}</h3>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
