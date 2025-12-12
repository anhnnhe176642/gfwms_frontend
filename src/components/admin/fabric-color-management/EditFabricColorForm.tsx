'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFormValidation } from '@/hooks/useFormValidation';
import { useNavigation } from '@/hooks/useNavigation';
import { updateFabricColorSchema, type UpdateFabricColorFormData } from '@/schemas/fabricColor.schema';
import { fabricColorService } from '@/services/fabricColor.service';
import { extractFieldErrors, getServerErrorMessage } from '@/lib/errorHandler';
import { ArrowLeft, Loader, RefreshCw } from 'lucide-react';
import type { FabricColorListItem } from '@/types/fabricColor';

export interface EditFabricColorFormProps {
  colorId: string;
}

export function EditFabricColorForm({ colorId }: EditFabricColorFormProps) {
  const router = useRouter();
  const { handleGoBack } = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [serverError, setServerError] = useState('');
  const [color, setColor] = useState<FabricColorListItem | null>(null);

  // Fetch color data
  useEffect(() => {
    const fetchColor = async () => {
      try {
        setIsLoadingData(true);
        const data = await fabricColorService.getFabricColorById(colorId);
        setColor(data);
      } catch (err) {
        const message = getServerErrorMessage(err) || 'Không thể tải dữ liệu màu vải';
        setServerError(message);
        toast.error(message);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchColor();
  }, [colorId]);

  // Form validation and state management
  const { values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldErrors, setFieldValue } =
    useFormValidation<UpdateFabricColorFormData>(updateFabricColorSchema, async (data: UpdateFabricColorFormData) => {
      setIsLoading(true);
      setServerError('');

      try {
        await fabricColorService.updateFabricColor(colorId, data);
        toast.success('Cập nhật màu vải thành công');
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

  // Initialize form with color data
  useEffect(() => {
    if (color) {
      setFieldValue('name', color.name);
      if (color.hexCode) {
        setFieldValue('hexCode', color.hexCode);
      }
    }
  }, [color, setFieldValue]);

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

  if (serverError && !color) {
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
          <h1 className="text-3xl font-bold tracking-tight">Chỉnh sửa màu vải</h1>
          <p className="text-muted-foreground mt-1">
            Cập nhật thông tin màu vải
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
            <CardDescription>Cập nhật thông tin cơ bản của màu vải</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Color ID */}
            <div className="space-y-2">
              <Label htmlFor="id">Mã màu vải</Label>
              <Input
                id="id"
                name="id"
                placeholder="red001"
                value={color?.id ?? ''}
                disabled={true}
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Mã màu vải không thể thay đổi</p>
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

            {/* Color Code */}
            <div className="space-y-2">
              <Label htmlFor="hexCode">
                Mã màu HEX <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <div className="flex-1 flex gap-2 items-center">
                  <input
                    id="colorPickerDirect"
                    type="color"
                    value={values.hexCode ?? '#FF0000'}
                    onChange={(e) => setFieldValue('hexCode', e.target.value.toUpperCase())}
                    className="w-12 h-10 rounded cursor-pointer border border-input"
                  />
                  <Input
                    id="hexCode"
                    name="hexCode"
                    placeholder="#FF0000"
                    value={values.hexCode ?? ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isLoading}
                    className={`font-mono ${errors.hexCode && touched.hexCode ? 'border-destructive' : ''}`}
                  />
                  {values.hexCode && (
                    <div
                      className="w-8 h-8 rounded border border-input shrink-0"
                      style={{ backgroundColor: values.hexCode }}
                      title={values.hexCode}
                    />
                  )}
                </div>
              </div>
              {errors.hexCode && touched.hexCode && (
                <p className="text-sm text-destructive">{errors.hexCode}</p>
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
            {isLoading ? 'Đang cập nhật...' : 'Cập nhật màu vải'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default EditFabricColorForm;
