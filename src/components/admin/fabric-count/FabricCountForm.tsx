'use client';

import React, { useState, useEffect } from 'react';
import { yoloDetectSchema, YoloDetectFormData } from '@/schemas/yolo.schema';
import { yoloService } from '@/services/yolo.service';
import { YoloDetectionResponse, Detection } from '@/types/yolo';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CanvasDrawer } from '@/components/admin/fabric-count/CanvasDrawer';
import { ImageCropper } from '@/components/admin/fabric-count/ImageCropper';

export const FabricCountForm: React.FC = () => {
  const [formData, setFormData] = useState<Partial<YoloDetectFormData>>({
    image: undefined,
    confidence: 0.5,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<string>('');
  const [detectionResult, setDetectionResult] = useState<YoloDetectionResponse | null>(
    null
  );
  const [isDetecting, setIsDetecting] = useState(false);
  const [editedDetections, setEditedDetections] = useState<Detection[] | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(800);
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string>('');

  // Tính toán containerWidth responsive
  useEffect(() => {
    const updateWidth = () => {
      if (typeof window !== 'undefined') {
        const width = Math.min(window.innerWidth - 32, 800);
        setContainerWidth(width);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Create preview
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          setTempImageSrc(dataUrl);
          setShowImageCropper(true);
        };
        reader.readAsDataURL(file);

        setErrors({ ...errors, image: '' });
      } catch (error) {
        toast.error('Lỗi khi tải ảnh');
      }
    }
  };

  const handleCropConfirm = async (croppedFile: File) => {
    try {
      setShowImageCropper(false);
      setTempImageSrc('');

      // Tạo preview từ cropped file
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(croppedFile);

      // Update form data
      setFormData({ ...formData, image: croppedFile });

      // Tự động phát hiện
      detectObjects(croppedFile);
    } catch (error) {
      toast.error('Lỗi khi xử lý ảnh');
    }
  };

  const handleCropCancel = () => {
    setShowImageCropper(false);
    setTempImageSrc('');
  };

  const handleSkipCrop = async (originalFile: File) => {
    try {
      setShowImageCropper(false);
      setTempImageSrc('');

      // Tạo preview từ original file
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(originalFile);

      // Update form data
      setFormData({ ...formData, image: originalFile });

      // Tự động phát hiện
      detectObjects(originalFile);
    } catch (error) {
      toast.error('Lỗi khi xử lý ảnh');
    }
  };

  const detectObjects = async (file: File) => {
    try {
      setIsDetecting(true);
      const response = await yoloService.detect({
        image: file,
        confidence: 0.5,
      });

      if (response.success) {
        setDetectionResult(response);
        setEditedDetections(null);
        toast.success('Phát hiện vật thể thành công');
      } else {
        toast.error(response.message || 'Lỗi phát hiện vật thể');
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Lỗi khi phát hiện vật thể';
      toast.error(message);
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Image Cropper Modal */}
      {showImageCropper && tempImageSrc && (
        <ImageCropper
          imageSrc={tempImageSrc}
          onCropConfirm={handleCropConfirm}
          onSkipCrop={handleSkipCrop}
          onCancel={handleCropCancel}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Đếm vải</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Upload Section */}
            <div className="flex flex-col gap-4">
              <label htmlFor="image" className="cursor-pointer">
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isDetecting || showImageCropper}
                  className="hidden"
                />
                <Button
                  type="button"
                  disabled={isDetecting || showImageCropper}
                  className="w-full"
                  onClick={() => document.getElementById('image')?.click()}
                >
                  {isDetecting ? '⏳ Đang xử lý...' : '📁 Chọn ảnh'}
                </Button>
              </label>

              {errors.image && (
                <p className="text-destructive text-sm">{errors.image}</p>
              )}
            </div>

            {/* Canvas Section */}
            {detectionResult && detectionResult.success && preview && (
              <div>
                <p className="text-sm font-medium mb-3">
                  Kết quả phát hiện ({(editedDetections || detectionResult.data.detections).length} vật thể)
                </p>
                <CanvasDrawer
                  imageUrl={preview}
                  detections={editedDetections || detectionResult.data.detections}
                  imageInfo={detectionResult.data.image_info}
                  containerWidth={containerWidth}
                  onDetectionsChange={setEditedDetections}
                  enableEdit={true}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
