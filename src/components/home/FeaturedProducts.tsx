'use client';
import React from 'react';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  badge?: {
    label: string;
    className: string;
  };
  inStock: boolean;
}

const products: Product[] = [
  {
    id: '1',
    name: 'Vải cotton cao cấp',
    category: 'Vải cotton',
    price: 150000,
    originalPrice: 200000,
    rating: 5,
    reviews: 128,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop',
    badge: { label: 'Bán chạy', className: 'bg-red-500 text-white' },
    inStock: true,
  },
  {
    id: '2',
    name: 'Vải polyester đa dụng',
    category: 'Vải polyester',
    price: 120000,
    originalPrice: 150000,
    rating: 4.5,
    reviews: 95,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop',
    badge: { label: 'Mới', className: 'bg-blue-500 text-white' },
    inStock: true,
  },
  {
    id: '3',
    name: 'Vải len ấm áp',
    category: 'Vải len',
    price: 180000,
    originalPrice: 250000,
    rating: 4.8,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&h=400&fit=crop',
    badge: { label: 'Hot', className: 'bg-orange-500 text-white' },
    inStock: true,
  },
  {
    id: '4',
    name: 'Vải silk mềm mại',
    category: 'Vải silk',
    price: 220000,
    rating: 5,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop',
    badge: { label: 'Premium', className: 'bg-purple-500 text-white' },
    inStock: false,
  },
];

interface FeaturedProductsProps {
  title?: string;
  description?: string;
}

export default function FeaturedProducts({ title = 'Sản phẩm nổi bật', description = 'Những sản phẩm được yêu thích nhất' }: FeaturedProductsProps) {
  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        <p className="text-muted-foreground mt-2">{description}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card
            key={product.id}
            className="overflow-hidden group hover:shadow-lg transition-all duration-300"
          >
            {/* Image Container */}
            <div className="relative overflow-hidden bg-gray-100 dark:bg-slate-800 aspect-square">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Badge */}
              {product.badge && (
                <div
                  className={cn(
                    'absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold',
                    product.badge.className
                  )}
                >
                  {product.badge.label}
                </div>
              )}

              {/* Stock Status */}
              {!product.inStock && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-white font-semibold">Hết hàng</span>
                </div>
              )}

              {/* Heart Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 left-3 bg-white/90 hover:bg-white dark:bg-slate-800/90 hover:dark:bg-slate-800"
              >
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <CardContent className="p-4 space-y-3">
              {/* Category */}
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {product.category}
              </p>

              {/* Title */}
              <h3 className="font-semibold line-clamp-2 h-14 leading-7">
                {product.name}
              </h3>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-4 w-4',
                        i < Math.floor(product.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  ({product.reviews})
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-primary">
                  ₫{product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    ₫{product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Add to Cart Button */}
              <Button
                className="w-full"
                disabled={!product.inStock}
                variant={product.inStock ? 'default' : 'outline'}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {product.inStock ? 'Thêm vào giỏ' : 'Hết hàng'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
