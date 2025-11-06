'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { fabricCategoryService } from '@/services/fabricCategory.service';
import { getServerErrorMessage } from '@/lib/errorHandler';
import { ArrowLeft, RefreshCw, Edit } from 'lucide-react';
import type { FabricCategoryListItem } from '@/types/fabricCategory';

export interface FabricCategoryDetailViewProps {
  categoryId: string | number;
  onEdit?: (categoryId: number) => void;
}

export function FabricCategoryDetailView({ categoryId, onEdit }: FabricCategoryDetailViewProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState<FabricCategoryListItem | null>(null);
  const [error, setError] = useState('');

  // Fetch category data
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setIsLoading(true);
        setError('');
        const data = await fabricCategoryService.getFabricCategoryById(categoryId);
        setCategory(data);
      } catch (err) {
        const message = getServerErrorMessage(err) || 'Không thể tải dữ liệu danh mục';
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategory();
  }, [categoryId]);

  const handleGoBack = () => {
    router.back();
  };

  const handleEdit = () => {
    if (onEdit && category) {
      onEdit(category.id);
    } else if (category) {
      router.push(`/admin/fabrics/categories/${category.id}/edit`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          <p className="text-gray-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error || 'Không tìm thấy danh mục'}</p>
          <Button onClick={handleGoBack} variant="outline">
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleGoBack}
          className="h-9 w-9"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
          <p className="text-muted-foreground mt-1">
            Chi tiết danh mục vải
          </p>
        </div>
        <Button onClick={handleEdit} className="gap-2">
          <Edit className="h-4 w-4" />
          Chỉnh sửa
        </Button>
      </div>

      {/* Basic Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cơ bản</CardTitle>
          <CardDescription>Thông tin chung của danh mục vải</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div>
            <p className="text-sm font-medium text-muted-foreground">Tên danh mục</p>
            <p className="text-base font-semibold">{category.name}</p>
          </div>

          {/* Description */}
          {category.description && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mô tả</p>
                <p className="text-base">{category.description}</p>
              </div>
            </>
          )}

          {/* ID */}
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground">ID</p>
            <p className="text-base font-mono">{category.id}</p>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin giá bán</CardTitle>
          <CardDescription>Giá bán theo mét và cuộn</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Price Per Meter */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Giá bán/mét</p>
              <p className="text-base font-semibold">
                {category.sellingPricePerMeter
                  ? `${category.sellingPricePerMeter.toLocaleString('vi-VN')} ₫`
                  : 'Chưa cập nhật'}
              </p>
            </div>

            {/* Price Per Roll */}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Giá bán/cuộn</p>
              <p className="text-base font-semibold">
                {category.sellingPricePerRoll
                  ? `${category.sellingPricePerRoll.toLocaleString('vi-VN')} ₫`
                  : 'Chưa cập nhật'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin thời gian</CardTitle>
          <CardDescription>Ngày tạo và cập nhật</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Created At */}
          <div>
            <p className="text-sm font-medium text-muted-foreground">Ngày tạo</p>
            <p className="text-base font-semibold">
              {new Date(category.createdAt).toLocaleString('vi-VN')}
            </p>
          </div>

          {/* Updated At */}
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Ngày cập nhật lần cuối</p>
            <p className="text-base font-semibold">
              {new Date(category.updatedAt).toLocaleString('vi-VN')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default FabricCategoryDetailView;
