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
import { createFabricColorSchema, type CreateFabricColorFormData } from '@/schemas/fabricColor.schema';
import { fabricColorService } from '@/services/fabricColor.service';
import { extractFieldErrors, getServerErrorMessage } from '@/lib/errorHandler';
import { ArrowLeft, Loader, Camera, Upload } from 'lucide-react';
import { ImageCapture } from './ImageCapture';
import { ColorExtractor } from './ColorExtractor';

export function CreateFabricColorForm() {
  const router = useRouter();
  const { handleGoBack } = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showImageCapture, setShowImageCapture] = useState(false);
  const [showColorExtractor, setShowColorExtractor] = useState(false);
  const [capturedImage, setCapturedImage] = useState<File | null>(null);

  // Form validation and state management
  const { values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldErrors, setFieldValue } =
    useFormValidation<CreateFabricColorFormData>(createFabricColorSchema, async (data: CreateFabricColorFormData) => {
      setIsLoading(true);
      setServerError('');

      try {
        await fabricColorService.createFabricColor(data);
        toast.success('Tạo màu vải thành công');
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

  const handleImageCapture = (file: File) => {
    setCapturedImage(file);
    setShowImageCapture(false);
    setShowColorExtractor(true);
  };

  const handleColorExtracted = (hexCode: string) => {
    setFieldValue('hexCode', hexCode);
    setShowColorExtractor(false);
    toast.success(`Đã chọn màu: ${hexCode}`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCapturedImage(file);
      setShowColorExtractor(true);
    }
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

            {/* Color Code */}
            <div className="space-y-2">
              <Label htmlFor="hexCode">Mã màu HEX (tùy chọn)</Label>
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

        {/* Image Capture Card */}
        <Card>
          <CardHeader>
            <CardTitle>Trích xuất màu từ ảnh</CardTitle>
            <CardDescription>Chụp ảnh hoặc tải lên ảnh để trích xuất màu tự động</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowImageCapture(true)}
                disabled={isLoading}
                className="flex-1 gap-2"
              >
                <Camera className="w-4 h-4" />
                Chụp ảnh
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={isLoading}
                className="flex-1 gap-2"
              >
                <Upload className="w-4 h-4" />
                Tải lên ảnh
              </Button>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
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

      {/* Image Capture Modal */}
      <ImageCapture
        isOpen={showImageCapture}
        onClose={() => setShowImageCapture(false)}
        onCapture={handleImageCapture}
      />

      {/* Color Extractor Modal */}
      {capturedImage && (
        <ColorExtractor
          isOpen={showColorExtractor}
          onClose={() => setShowColorExtractor(false)}
          imageFile={capturedImage}
          onColorExtracted={handleColorExtracted}
        />
      )}
    </div>
  );
}

export default CreateFabricColorForm;
