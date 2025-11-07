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
import { createFabricGlossSchema, type CreateFabricGlossFormData } from '@/schemas/fabricGloss.schema';
import { fabricGlossService } from '@/services/fabricGloss.service';
import { extractFieldErrors, getServerErrorMessage } from '@/lib/errorHandler';
import { ArrowLeft, Loader } from 'lucide-react';

export function CreateFabricGlossForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  // Form validation and state management
  const { values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldErrors } =
    useFormValidation<CreateFabricGlossFormData>(createFabricGlossSchema, async (data: CreateFabricGlossFormData) => {
      setIsLoading(true);
      setServerError('');

      try {
        await fabricGlossService.createFabricGloss(data);
        toast.success('Tạo độ bóng thành công');
        router.push('/admin/fabrics/gloss');
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
    router.push('/admin/fabrics/gloss');
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
          <h1 className="text-3xl font-bold tracking-tight">Tạo độ bóng</h1>
          <p className="text-muted-foreground mt-1">
            Điền thông tin để tạo một độ bóng mới
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
        {/* Gloss Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin độ bóng</CardTitle>
            <CardDescription>Nhập thông tin cơ bản của độ bóng</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Mô tả độ bóng <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Bóng cao, Bóng mịn, Bóng mờ..."
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
            {isLoading ? 'Đang tạo...' : 'Tạo độ bóng'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreateFabricGlossForm;
