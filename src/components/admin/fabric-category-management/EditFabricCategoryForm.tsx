'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFormValidation } from '@/hooks/useFormValidation';
import { updateFabricCategorySchema, type UpdateFabricCategoryFormData } from '@/schemas/fabricCategory.schema';
import { fabricCategoryService } from '@/services/fabricCategory.service';
import { extractFieldErrors, getServerErrorMessage } from '@/lib/errorHandler';
import { ArrowLeft, Loader, RefreshCw } from 'lucide-react';
import type { FabricCategoryListItem } from '@/types/fabricCategory';

export interface EditFabricCategoryFormProps {
  categoryId: string | number;
}

export function EditFabricCategoryForm({ categoryId }: EditFabricCategoryFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [serverError, setServerError] = useState('');
  const [category, setCategory] = useState<FabricCategoryListItem | null>(null);

  // Fetch category data
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setIsLoadingData(true);
        const data = await fabricCategoryService.getFabricCategoryById(categoryId);
        setCategory(data);
      } catch (err) {
        const message = getServerErrorMessage(err) || 'Không thể tải dữ liệu loại vải';
        setServerError(message);
        toast.error(message);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchCategory();
  }, [categoryId]);

  // Form validation and state management
  const { values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldErrors, setFieldValue } =
    useFormValidation<UpdateFabricCategoryFormData>(updateFabricCategorySchema, async (data: UpdateFabricCategoryFormData) => {
      setIsLoading(true);
      setServerError('');

      try {
        await fabricCategoryService.updateFabricCategory(categoryId, data);
        toast.success('Cập nhật loại vải thành công');
        router.push('/admin/fabrics/categories');
      } catch (err) {
        const fieldErrors = extractFieldErrors(err);
        if (Object.keys(fieldErrors).length > 0) {
          setFieldErrors(fieldErrors);
        }
        const message = getServerErrorMessage(err);
        setServerError(message || 'Có lỗi xảy ra');
        toast.error(message || 'Có lỗi xảy ra');
      } finally {
        setIsLoading(false);
      }
    });

  // Initialize form with category data
  useEffect(() => {
    if (category) {
      setFieldValue('name', category.name);
      setFieldValue('description', category.description || '');
      setFieldValue('sellingPricePerMeter', category.sellingPricePerMeter || '');
      setFieldValue('sellingPricePerRoll', category.sellingPricePerRoll || '');
    }
  }, [category, setFieldValue]);

  const handleGoBack = () => {
    router.push('/admin/fabrics/categories');
  };

  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          <p className="text-gray-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (serverError && !category) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-4">{serverError}</p>
          <Button onClick={handleGoBack} variant="outline">
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleGoBack}
          disabled={isLoading}
          className="h-9 w-9"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chỉnh sửa loại vải</h1>
          <p className="text-muted-foreground mt-1">
            Cập nhật thông tin loại vải
          </p>
        </div>
      </div>

      {/* Error message */}
      {serverError && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
          {serverError}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin loại vải</CardTitle>
            <CardDescription>Cập nhật thông tin cơ bản của loại vải</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Category Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Tên loại vải <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Aluminum Fabric"
                value={values.name ?? ''}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                className={errors.name && touched.name ? 'border-destructive' : ''}
              />
              {errors.name && touched.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Mô tả chi tiết về loại vải..."
                value={values.description ?? ''}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                className={errors.description && touched.description ? 'border-destructive' : ''}
                rows={3}
              />
              {errors.description && touched.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pricing Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin giá bán</CardTitle>
            <CardDescription>Cập nhật giá bán theo mét và cuộn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selling Price Per Meter */}
            <div className="space-y-2">
              <Label htmlFor="sellingPricePerMeter">
                Giá bán/mét (VNĐ)
              </Label>
              <Input
                id="sellingPricePerMeter"
                name="sellingPricePerMeter"
                type="number"
                placeholder="68000"
                value={values.sellingPricePerMeter ?? ''}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                className={errors.sellingPricePerMeter && touched.sellingPricePerMeter ? 'border-destructive' : ''}
              />
              {errors.sellingPricePerMeter && touched.sellingPricePerMeter && (
                <p className="text-sm text-destructive">{errors.sellingPricePerMeter}</p>
              )}
            </div>

            {/* Selling Price Per Roll */}
            <div className="space-y-2">
              <Label htmlFor="sellingPricePerRoll">
                Giá bán/cuộn (VNĐ)
              </Label>
              <Input
                id="sellingPricePerRoll"
                name="sellingPricePerRoll"
                type="number"
                placeholder="1630000"
                value={values.sellingPricePerRoll ?? ''}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                className={errors.sellingPricePerRoll && touched.sellingPricePerRoll ? 'border-destructive' : ''}
              />
              {errors.sellingPricePerRoll && touched.sellingPricePerRoll && (
                <p className="text-sm text-destructive">{errors.sellingPricePerRoll}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleGoBack}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Đang cập nhật...' : 'Cập nhật loại vải'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default EditFabricCategoryForm;
