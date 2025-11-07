'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFormValidation } from '@/hooks/useFormValidation';
import { updateSupplierSchema, type UpdateSupplierFormData } from '@/schemas/supplier.schema';
import { supplierService } from '@/services/supplier.service';
import { extractFieldErrors, getServerErrorMessage } from '@/lib/errorHandler';
import { ArrowLeft, Loader, RefreshCw } from 'lucide-react';
import type { SupplierListItem } from '@/types/supplier';

const SUPPLIER_STATUSES = [
  { value: 'true', label: 'Hoạt động' },
  { value: 'false', label: 'Ngừng hoạt động' },
];

export interface EditSupplierFormProps {
  supplierId: string | number;
}

export function EditSupplierForm({ supplierId }: EditSupplierFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [serverError, setServerError] = useState('');
  const [supplier, setSupplier] = useState<SupplierListItem | null>(null);

  // Fetch supplier data
  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        setIsLoadingData(true);
        const data = await supplierService.getSupplierById(supplierId);
        setSupplier(data);
      } catch (err) {
        const message = getServerErrorMessage(err) || 'Không thể tải dữ liệu nhà cung cấp';
        setServerError(message);
        toast.error(message);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchSupplier();
  }, [supplierId]);

  // Form validation and state management
  const { values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldErrors, setFieldValue } =
    useFormValidation<UpdateSupplierFormData>(updateSupplierSchema, async (data: UpdateSupplierFormData) => {
      setIsLoading(true);
      setServerError('');

      try {
        await supplierService.updateSupplier(supplierId, data);
        toast.success('Cập nhật nhà cung cấp thành công');
        router.push('/admin/fabrics/suppliers');
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

  // Initialize form with supplier data
  useEffect(() => {
    if (supplier) {
      setFieldValue('name', supplier.name);
      setFieldValue('address', supplier.address);
      setFieldValue('phone', supplier.phone);
      setFieldValue('isActive', supplier.isActive);
    }
  }, [supplier, setFieldValue]);

  const handleGoBack = () => {
    router.push('/admin/fabrics/suppliers');
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

  if (serverError && !supplier) {
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
          <h1 className="text-3xl font-bold tracking-tight">Chỉnh sửa nhà cung cấp</h1>
          <p className="text-muted-foreground mt-1">
            Cập nhật thông tin nhà cung cấp
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
        {/* Supplier Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin nhà cung cấp</CardTitle>
            <CardDescription>Cập nhật thông tin cơ bản của nhà cung cấp</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Supplier Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Tên nhà cung cấp <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Nhập tên nhà cung cấp"
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
              <Textarea
                id="address"
                name="address"
                placeholder="Nhập địa chỉ nhà cung cấp"
                value={values.address ?? ''}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                className={errors.address && touched.address ? 'border-destructive' : ''}
                rows={3}
              />
              {errors.address && touched.address && (
                <p className="text-sm text-destructive">{errors.address}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">
                Số điện thoại <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                name="phone"
                placeholder="Nhập số điện thoại (10-11 chữ số)"
                value={values.phone ?? ''}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                className={errors.phone && touched.phone ? 'border-destructive' : ''}
              />
              {errors.phone && touched.phone && (
                <p className="text-sm text-destructive">{errors.phone}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Số điện thoại phải có 10-11 chữ số
              </p>
            </div>

            {/* Is Active */}
            <div className="space-y-2">
              <Label htmlFor="isActive">
                Trạng thái <span className="text-destructive">*</span>
              </Label>
              <Select value={values.isActive ? 'true' : 'false'} onValueChange={(value) => {
                setFieldValue('isActive', value === 'true');
              }}>
                <SelectTrigger id="isActive" disabled={isLoading}>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPLIER_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.isActive && touched.isActive && (
                <p className="text-sm text-destructive">{errors.isActive}</p>
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
            {isLoading ? 'Đang cập nhật...' : 'Cập nhật nhà cung cấp'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default EditSupplierForm;
