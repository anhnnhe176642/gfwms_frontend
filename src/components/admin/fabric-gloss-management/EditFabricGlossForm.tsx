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
import { useNavigation } from '@/hooks/useNavigation';
import { updateFabricGlossSchema, type UpdateFabricGlossFormData } from '@/schemas/fabricGloss.schema';
import { fabricGlossService } from '@/services/fabricGloss.service';
import { extractFieldErrors, getServerErrorMessage } from '@/lib/errorHandler';
import { ArrowLeft, Loader, RefreshCw } from 'lucide-react';
import type { FabricGlossListItem } from '@/types/fabricGloss';

export interface EditFabricGlossFormProps {
  glossId: string | number;
}

export function EditFabricGlossForm({ glossId }: EditFabricGlossFormProps) {
  const router = useRouter();
  const { handleGoBack } = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [serverError, setServerError] = useState('');
  const [gloss, setGloss] = useState<FabricGlossListItem | null>(null);

  // Fetch gloss data
  useEffect(() => {
    const fetchGloss = async () => {
      try {
        setIsLoadingData(true);
        const data = await fabricGlossService.getFabricGlossById(glossId);
        setGloss(data);
      } catch (err) {
        const message = getServerErrorMessage(err) || 'Không thể tải dữ liệu độ bóng';
        setServerError(message);
        toast.error(message);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchGloss();
  }, [glossId]);

  // Form validation and state management
  const { values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldErrors, setFieldValue } =
    useFormValidation<UpdateFabricGlossFormData>(updateFabricGlossSchema, async (data: UpdateFabricGlossFormData) => {
      setIsLoading(true);
      setServerError('');

      try {
        await fabricGlossService.updateFabricGloss(glossId, data);
        toast.success('Cập nhật độ bóng thành công');
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

  // Initialize form with gloss data
  useEffect(() => {
    if (gloss) {
      setFieldValue('description', gloss.description || '');
    }
  }, [gloss, setFieldValue]);

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

  if (serverError && !gloss) {
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
          <h1 className="text-3xl font-bold tracking-tight">Chỉnh sửa độ bóng</h1>
          <p className="text-muted-foreground mt-1">
            Cập nhật thông tin độ bóng
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
            <CardDescription>Cập nhật thông tin cơ bản của độ bóng</CardDescription>
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
            {isLoading ? 'Đang cập nhật...' : 'Cập nhật độ bóng'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default EditFabricGlossForm;
