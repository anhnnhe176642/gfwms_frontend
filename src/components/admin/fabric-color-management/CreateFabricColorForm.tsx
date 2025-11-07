'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFormValidation } from '@/hooks/useFormValidation';
import { createFabricColorSchema, type CreateFabricColorFormData } from '@/schemas/fabricColor.schema';
import { fabricColorService } from '@/services/fabricColor.service';
import { extractFieldErrors, getServerErrorMessage } from '@/lib/errorHandler';
import { ArrowLeft, Loader } from 'lucide-react';

export function CreateFabricColorForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  // Form validation and state management
  const { values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldErrors } =
    useFormValidation<CreateFabricColorFormData>(createFabricColorSchema, async (data: CreateFabricColorFormData) => {
      setIsLoading(true);
      setServerError('');

      try {
        await fabricColorService.createFabricColor(data);
        toast.success('Tạo màu vải thành công');
        router.push('/admin/fabrics/colors');
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

  const handleGoBack = () => {
    router.push('/admin/fabrics/colors');
  };

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
          <h1 className="text-3xl font-bold tracking-tight">Tạo màu vải</h1>
          <p className="text-muted-foreground mt-1">
            Điền thông tin để tạo một màu vải mới
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
        {/* Color Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin màu vải</CardTitle>
            <CardDescription>Nhập thông tin cơ bản của màu vải</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Color ID */}
            <div className="space-y-2">
              <Label htmlFor="id">
                Mã màu vải <span className="text-destructive">*</span>
              </Label>
              <Input
                id="id"
                name="id"
                placeholder="red001"
                value={values.id ?? ''}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                className={errors.id && touched.id ? 'border-destructive' : ''}
              />
              {errors.id && touched.id && (
                <p className="text-sm text-destructive">{errors.id}</p>
              )}
            </div>

            {/* Color Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Tên màu vải <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Đỏ"
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
            {isLoading ? 'Đang tạo...' : 'Tạo màu vải'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreateFabricColorForm;
