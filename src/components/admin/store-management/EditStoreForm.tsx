'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFormValidation } from '@/hooks/useFormValidation';
import { useNavigation } from '@/hooks/useNavigation';
import { updateStoreSchema, type UpdateStoreFormData } from '@/schemas/store.schema';
import { storeService } from '@/services/store.service';
import { extractFieldErrors, getServerErrorMessage } from '@/lib/errorHandler';
import { ArrowLeft, Loader, RefreshCw } from 'lucide-react';
import type { StoreListItem } from '@/types/store';
import LocationPicker from '@/components/map/LocationPicker';

const STORE_ACTIVE_STATUS = [
  { value: 'true', label: 'Hoạt động' },
  { value: 'false', label: 'Không hoạt động' },
];

export interface EditStoreFormProps {
  storeId: string | number;
}

export function EditStoreForm({ storeId }: EditStoreFormProps) {
  const router = useRouter();
  const { handleGoBack } = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [serverError, setServerError] = useState('');
  const [store, setStore] = useState<StoreListItem | null>(null);

  // Fetch store data
  useEffect(() => {
    const fetchStore = async () => {
      try {
        setIsLoadingData(true);
        const data = await storeService.getStoreById(storeId);
        setStore(data);
      } catch (err) {
        const message = getServerErrorMessage(err) || 'Không thể tải dữ liệu cửa hàng';
        setServerError(message);
        toast.error(message);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchStore();
  }, [storeId]);

  // Form validation and state management
  const { values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldErrors, setFieldValue } =
    useFormValidation<UpdateStoreFormData>(updateStoreSchema, async (data: UpdateStoreFormData) => {
      setIsLoading(true);
      setServerError('');

      try {
        await storeService.updateStore(storeId, data);
        toast.success('Cập nhật cửa hàng thành công');
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

  // Initialize form with store data
  useEffect(() => {
    if (store) {
      setFieldValue('name', store.name);
      setFieldValue('address', store.address);
      setFieldValue('latitude', store.latitude);
      setFieldValue('longitude', store.longitude);
      setFieldValue('isActive', store.isActive);
    }
  }, [store, setFieldValue]);

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
          <h1 className="text-3xl font-bold tracking-tight">Chỉnh sửa cửa hàng</h1>
          <p className="text-muted-foreground mt-1">
            Cập nhật thông tin cửa hàng
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
        {/* Store Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cửa hàng</CardTitle>
            <CardDescription>Chỉnh sửa thông tin cơ bản của cửa hàng</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Store Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Tên cửa hàng <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Cửa hàng Quận 1"
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
                placeholder="123 Nguyễn Huệ, Quận 1, TP. HCM"
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

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="isActive">
            Trạng thái <span className="text-destructive">*</span>
          </Label>
          <Select 
            value={values.isActive !== undefined ? String(values.isActive) : 'true'} 
            onValueChange={(value) => {
              handleChange({
                target: { name: 'isActive', value: value === 'true' },
              } as any);
            }}
          >
            <SelectTrigger id="isActive" disabled={isLoading}>
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {STORE_ACTIVE_STATUS.map((status) => (
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

        {/* Location Picker */}
        <LocationPicker
          latitude={values.latitude}
          longitude={values.longitude}
          onLocationChange={(lat, lng) => {
            setFieldValue('latitude', lat);
            setFieldValue('longitude', lng);
          }}
        />

        {/* Location validation errors */}
        {(errors.latitude || errors.longitude) && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md text-sm space-y-1">
            {errors.latitude && <p>{errors.latitude}</p>}
            {errors.longitude && <p>{errors.longitude}</p>}
          </div>
        )}        {/* Action Buttons */}
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
            {isLoading ? 'Đang cập nhật...' : 'Cập nhật cửa hàng'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default EditStoreForm;
