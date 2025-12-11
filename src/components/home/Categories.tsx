'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import fabricCategoryService from '@/services/fabricCategory.service';
import type { FabricCategoryListItem } from '@/types/fabricCategory';

interface Category extends FabricCategoryListItem {
  image?: string;
}

interface CategoriesProps {
  title?: string;
  description?: string;
}

export default function Categories({ title = 'Danh mục sản phẩm', description = 'Khám phá các loại vải khác nhau' }: CategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fabricCategoryService.getFabricCategories({
          page: currentPage,
          limit: itemsPerPage,
        });
        const categoriesWithImages = response.data.map((category) => ({
          ...category,
          image: category.image,
        }));
        setCategories(categoriesWithImages);
        
        // Lấy thông tin phân trang từ backend
        if (response.pagination) {
          setTotalPages(Math.ceil(response.pagination.total / itemsPerPage));
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [currentPage]);

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Tính toán các page numbers để hiển thị
  const getPaginationNumbers = () => {
    const items = [];
    const maxPagesToShow = 5; // Tối đa số trang hiển thị
    const halfWindow = Math.floor(maxPagesToShow / 2);

    if (totalPages <= maxPagesToShow) {
      // Nếu số trang <= 5, hiển thị tất cả
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Luôn hiển thị trang đầu
    items.push(1);

    let startPage = Math.max(2, currentPage - halfWindow);
    let endPage = Math.min(totalPages - 1, currentPage + halfWindow);

    // Điều chỉnh range nếu ở gần đầu hoặc cuối
    if (currentPage <= halfWindow + 1) {
      endPage = maxPagesToShow - 1;
    } else if (currentPage >= totalPages - halfWindow) {
      startPage = totalPages - maxPagesToShow + 2;
    }

    // Thêm "..." nếu có gap
    if (startPage > 2) {
      items.push('...');
    }

    // Thêm các trang giữa
    for (let i = startPage; i <= endPage; i++) {
      items.push(i);
    }

    // Thêm "..." nếu có gap
    if (endPage < totalPages - 1) {
      items.push('...');
    }

    // Luôn hiển thị trang cuối
    items.push(totalPages);

    return items;
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          <p className="text-muted-foreground mt-2">{description}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="h-40 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        <p className="text-muted-foreground mt-2">{description}</p>
      </div>

      {/* Categories with Navigation */}
      <div className="relative">
        {/* Categories Grid */}
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

                  {/* Overlay - hiển thị khi hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-white"
                  style={{
                    backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.6), transparent)`,
                  }}
                  >
                    <h3 className="font-semibold text-white">{category.name}</h3>
                    <p className="text-xs text-white">{category.description || 'Danh mục sản phẩm'}</p>
                  </div>

                  {/* Text Overlay (ẩn khi hover) */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white group-hover:opacity-0 transition-opacity duration-300">
                    <h3 className="font-bold text-lg drop-shadow-lg">{category.name}</h3>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Previous Button - Absolute positioned */}
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          disabled={currentPage === 1 || totalPages <= 1}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-14 shrink-0"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        {/* Next Button - Absolute positioned */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          disabled={currentPage === totalPages || totalPages <= 1}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-14 shrink-0"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Page Indicators */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-6">
          {getPaginationNumbers().map((page, index) => (
            page === '...' ? (
              <span key={`dots-${index}`} className="px-2 py-2">
                ...
              </span>
            ) : (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(page as number)}
                className="h-10 w-10 p-0"
              >
                {page}
              </Button>
            )
          ))}
        </div>
      )}
    </div>
  );
}
