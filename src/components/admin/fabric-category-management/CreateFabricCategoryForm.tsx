'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFormValidation } from '@/hooks/useFormValidation';
import { useNavigation } from '@/hooks/useNavigation';
import { createFabricCategorySchema, type CreateFabricCategoryFormData } from '@/schemas/fabricCategory.schema';
import { fabricCategoryService } from '@/services/fabricCategory.service';
import { extractFieldErrors, getServerErrorMessage } from '@/lib/errorHandler';
import { ArrowLeft, Loader } from 'lucide-react';

export function CreateFabricCategoryForm() {
  const router = useRouter();
  const { handleGoBack } = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  // Form validation and state management
  const { values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldErrors } =
    useFormValidation<CreateFabricCategoryFormData>(createFabricCategorySchema, async (data: CreateFabricCategoryFormData) => {
      setIsLoading(true);
      setServerError('');

      try {
        await fabricCategoryService.createFabricCategory(data);
        toast.success('Tạo loại vải thành công');
        handleGoBack();
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
          <h1 className="text-3xl font-bold tracking-tight">Tạo loại vải</h1>
          <p className="text-muted-foreground mt-1">
            Điền thông tin để tạo một loại vải mới
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
            <CardDescription>Nhập thông tin cơ bản của loại vải</CardDescription>
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
            <CardDescription>Nhập giá bán theo mét và cuộn</CardDescription>
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
            {isLoading ? 'Đang tạo...' : 'Tạo loại vải'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreateFabricCategoryForm;
