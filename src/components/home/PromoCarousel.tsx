'use client';
import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PromoItem {
  id: string;
  discount: number;
  code: string;
  title: string;
  validUntil: string;
  bgColor: string;
}

const promos: PromoItem[] = [
  {
    id: '1',
    discount: 30,
    code: 'SUMMER30',
    title: 'Mùa hè siêu giảm',
    validUntil: '31/12/2025',
    bgColor: 'from-orange-400 to-red-500',
  },
  {
    id: '2',
    discount: 50,
    code: 'FLASH50',
    title: 'Flash sale 50%',
    validUntil: '15/12/2025',
    bgColor: 'from-purple-400 to-pink-500',
  },
  {
    id: '3',
    discount: 25,
    code: 'WINTER25',
    title: 'Mùa đông ấm áp',
    validUntil: '28/02/2026',
    bgColor: 'from-blue-400 to-cyan-500',
  },
  {
    id: '4',
    discount: 40,
    code: 'LUCKY40',
    title: 'May mắn ngày hôm nay',
    validUntil: '10/12/2025',
    bgColor: 'from-green-400 to-emerald-500',
  },
];

export default function PromoCarousel() {
  const [current, setCurrent] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);

  useEffect(() => {
    if (!isAutoplay) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % promos.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoplay]);

  const next = () => {
    setCurrent((prev) => (prev + 1) % promos.length);
    setIsAutoplay(false);
  };

  const prev = () => {
    setCurrent((prev) => (prev - 1 + promos.length) % promos.length);
    setIsAutoplay(false);
  };

  return (
    <div className="relative w-full bg-white dark:bg-slate-900 rounded-lg overflow-hidden shadow-md">
      {/* Carousel Container */}
      <div className="relative h-40 overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {promos.map((promo) => (
            <div
              key={promo.id}
              className="min-w-full shrink-0"
            >
              <div
                className={cn(
                  'h-40 bg-linear-to-r flex items-center justify-between px-8',
                  `from-${promo.bgColor.split(' ')[1]} to-${promo.bgColor.split(' ')[3]}`
                )}
                style={{
                  backgroundImage: `linear-gradient(135deg, ${
                    promo.bgColor === 'from-orange-400 to-red-500'
                      ? '#fb923c, #ef4444'
                      : promo.bgColor === 'from-purple-400 to-pink-500'
                        ? '#c084fc, #ec4899'
                        : promo.bgColor === 'from-blue-400 to-cyan-500'
                          ? '#60a5fa, #06b6d4'
                          : '#4ade80, #10b981'
                  })`,
                }}
              >
                <div className="text-white">
                  <p className="text-sm font-medium opacity-90">Mã giảm giá</p>
                  <h3 className="text-2xl font-bold mt-1">{promo.title}</h3>
                  <p className="text-xs opacity-75 mt-2">Hết hạn: {promo.validUntil}</p>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-bold text-white drop-shadow-lg">
                    {promo.discount}%
                  </div>
                  <div className="border-2 border-white rounded px-3 py-1 mt-2 inline-block">
                    <span className="text-white font-mono text-sm font-semibold">
                      {promo.code}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white dark:bg-slate-800/80"
        onClick={prev}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white dark:bg-slate-800/80"
        onClick={next}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 py-3 bg-gray-50 dark:bg-slate-800">
        {promos.map((_, index) => (
          <button
            key={index}
            className={cn(
              'h-2 rounded-full transition-all',
              current === index
                ? 'bg-primary w-8'
                : 'bg-gray-300 dark:bg-gray-600 w-2 hover:bg-gray-400'
            )}
            onClick={() => {
              setCurrent(index);
              setIsAutoplay(false);
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
