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
import { updateWarehouseSchema, type UpdateWarehouseFormData } from '@/schemas/warehouse.schema';
import { warehouseService } from '@/services/warehouse.service';
import { extractFieldErrors, getServerErrorMessage } from '@/lib/errorHandler';
import { ArrowLeft, Loader, RefreshCw } from 'lucide-react';
import type { WarehouseListItem } from '@/types/warehouse';
import { WAREHOUSE_STATUS_OPTIONS } from '@/constants/warehouse';
import LocationPicker from '@/components/map/LocationPicker';

const WAREHOUSE_STATUSES = [
  { value: 'ACTIVE', label: 'Hoạt động' },
  { value: 'INACTIVE', label: 'Không hoạt động' },
];

export interface EditWarehouseFormProps {
  warehouseId: string | number;
}

export function EditWarehouseForm({ warehouseId }: EditWarehouseFormProps) {
  const router = useRouter();
  const { handleGoBack } = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [serverError, setServerError] = useState('');
  const [warehouse, setWarehouse] = useState<WarehouseListItem | null>(null);

  // Fetch warehouse data
  useEffect(() => {
    const fetchWarehouse = async () => {
      try {
        setIsLoadingData(true);
        const data = await warehouseService.getWarehouseById(warehouseId);
        setWarehouse(data);
      } catch (err) {
        const message = getServerErrorMessage(err) || 'Không thể tải dữ liệu kho';
        setServerError(message);
        toast.error(message);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchWarehouse();
  }, [warehouseId]);

  // Form validation and state management
  const { values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldErrors, setFieldValue } =
    useFormValidation<UpdateWarehouseFormData>(updateWarehouseSchema, async (data: UpdateWarehouseFormData) => {
      setIsLoading(true);
      setServerError('');

      try {
        await warehouseService.updateWarehouse(warehouseId, data);
        toast.success('Cập nhật kho thành công');
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

  // Initialize form with warehouse data
  useEffect(() => {
    if (warehouse) {
      setFieldValue('name', warehouse.name);
      setFieldValue('address', warehouse.address);
      setFieldValue('latitude', warehouse.latitude);
      setFieldValue('longitude', warehouse.longitude);
      setFieldValue('status', warehouse.status);
    }
  }, [warehouse, setFieldValue]);

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
          <h1 className="text-3xl font-bold tracking-tight">Chỉnh sửa kho</h1>
          <p className="text-muted-foreground mt-1">
            Cập nhật thông tin kho hàng
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
            <CardDescription>Chỉnh sửa thông tin cơ bản của kho hàng</CardDescription>
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

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">
                Trạng thái <span className="text-destructive">*</span>
              </Label>
              <Select value={values.status ?? 'ACTIVE'} onValueChange={(value) => {
                handleChange({
                  target: { name: 'status', value },
                } as React.ChangeEvent<HTMLInputElement>);
              }}>
                <SelectTrigger id="status" disabled={isLoading}>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {WAREHOUSE_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && touched.status && (
                <p className="text-sm text-destructive">{errors.status}</p>
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
        )}

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
            {isLoading ? 'Đang cập nhật...' : 'Cập nhật kho'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default EditWarehouseForm;
