'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFormValidation } from '@/hooks/useFormValidation';
import { useNavigation } from '@/hooks/useNavigation';
import { createWarehouseSchema, type CreateWarehouseFormData } from '@/schemas/warehouse.schema';
import { warehouseService } from '@/services/warehouse.service';
import { extractFieldErrors, getServerErrorMessage } from '@/lib/errorHandler';
import { ArrowLeft, Loader } from 'lucide-react';

export function CreateWarehouseForm() {
  const router = useRouter();
  const { handleGoBack } = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  // Form validation and state management
  const { values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldErrors } =
    useFormValidation<CreateWarehouseFormData>(createWarehouseSchema, async (data: CreateWarehouseFormData) => {
      setIsLoading(true);
      setServerError('');

      try {
        await warehouseService.createWarehouse(data);
        toast.success('Tạo kho thành công');
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
          <h1 className="text-3xl font-bold tracking-tight">Tạo kho mới</h1>
          <p className="text-muted-foreground mt-1">
            Điền thông tin để tạo một kho hàng mới
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
        {/* Warehouse Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin kho</CardTitle>
            <CardDescription>Nhập thông tin cơ bản của kho hàng</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Warehouse Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Tên kho <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Hà Nội 1"
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

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">
                Địa chỉ <span className="text-destructive">*</span>
              </Label>
              <Input
                id="address"
                name="address"
                placeholder="1023 Đường Láng, Hà Nội"
                value={values.address ?? ''}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                className={errors.address && touched.address ? 'border-destructive' : ''}
              />
              {errors.address && touched.address && (
                <p className="text-sm text-destructive">{errors.address}</p>
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
            {isLoading ? 'Đang tạo...' : 'Tạo kho'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreateWarehouseForm;
