'use client';

import React, { useState, useEffect } from 'react';
import { yoloDetectSchema, YoloDetectFormData } from '@/schemas/yolo.schema';
import { yoloService } from '@/services/yolo.service';
import { YoloDetectionResponse, Detection } from '@/types/yolo';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, Camera, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CanvasDrawer } from '@/components/admin/fabric-count/CanvasDrawer';
import { ImageCropper } from '@/components/admin/fabric-count/ImageCropper';
import { ConfidenceFilter } from '@/components/admin/fabric-count/ConfidenceFilter';
import { CameraCapture } from '@/components/admin/fabric-count/CameraCapture';
import { SubmitDatasetModal } from '@/components/admin/fabric-count/SubmitDatasetModal';

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
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.5);
  const [showCameraCapture, setShowCameraCapture] = useState(false);
  const [showSubmitDatasetModal, setShowSubmitDatasetModal] = useState(false);
  const [minConfidenceUsed, setMinConfidenceUsed] = useState<number>(0.5);
  const [isRefetching, setIsRefetching] = useState(false);
  const [showRowlines, setShowRowlines] = useState(false);
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Lọc detections dựa trên confidence threshold
  const filteredDetections = React.useMemo(() => {
    if (!detectionResult?.data.detections) return [];
    const allDetections = editedDetections || detectionResult.data.detections;
    return allDetections.filter((d) => d.confidence >= confidenceThreshold);
  }, [detectionResult, editedDetections, confidenceThreshold]);

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

  const handleCameraCapture = async (file: File) => {
    try {
      // Create preview from captured image
      const reader = new FileReader();
      reader.onload = (event) => {
        setTempImageSrc(event.target?.result as string);
        setShowImageCropper(true);
      };
      reader.readAsDataURL(file);

      setErrors({ ...errors, image: '' });
    } catch (error) {
      toast.error('Lỗi khi xử lý ảnh từ camera');
    }
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

  const detectObjects = async (file: File, confidence: number = 0.5) => {
    try {
      setIsDetecting(true);
      const response = await yoloService.detect({
        image: file,
        confidence: confidence,
      });

      if (response.success) {
        setDetectionResult(response);
        setEditedDetections(null);
        setMinConfidenceUsed(confidence);
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

  const handleConfidenceThresholdChange = (newThreshold: number) => {
    setConfidenceThreshold(newThreshold);

    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer - wait for slider drag to end
    debounceTimerRef.current = setTimeout(() => {
      // If new threshold is lower than the minimum confidence used in API, re-fetch
      if (newThreshold < minConfidenceUsed && formData.image) {
        setIsRefetching(true);
        detectObjects(formData.image as File, newThreshold)
          .finally(() => setIsRefetching(false));
      }
    }, 500); // 500ms debounce
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

      {/* Camera Capture Modal */}
      <CameraCapture
        isOpen={showCameraCapture}
        onClose={() => setShowCameraCapture(false)}
        onCapture={handleCameraCapture}
      />

      {/* Submit Dataset Modal */}
      <SubmitDatasetModal
        isOpen={showSubmitDatasetModal}
        onClose={() => setShowSubmitDatasetModal(false)}
        imageFile={formData.image as File | null}
        detections={editedDetections || detectionResult?.data.detections || []}
        imageInfo={
          detectionResult?.data.image_info || { width: 0, height: 0 }
        }
        onSuccess={() => {
          // Reset form after successful submission
          setFormData({ image: undefined, confidence: 0.5 });
          setPreview('');
          setDetectionResult(null);
          setEditedDetections(null);
        }}
      />

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
                  className="w-full gap-2"
                  onClick={() => document.getElementById('image')?.click()}
                >
                  {isDetecting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Chọn ảnh
                    </>
                  )}
                </Button>
              </label>

              <Button
                type="button"
                variant="secondary"
                disabled={isDetecting || showImageCropper}
                className="w-full gap-2"
                onClick={() => setShowCameraCapture(true)}
              >
                <Camera className="w-4 h-4" />
                Chụp ảnh từ camera
              </Button>

              {errors.image && (
                <p className="text-destructive text-sm">{errors.image}</p>
              )}
            </div>

            {/* Canvas Section */}
            {detectionResult && detectionResult.success && preview && (
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Kết quả phát hiện: {detectionResult.data.summary.total_objects} vật thể
                  </p>
                  {Object.entries(detectionResult.data.summary.counts_by_class).length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {Object.entries(detectionResult.data.summary.counts_by_class).map(([className, count]) => (
                        <div key={className} className="text-xs text-blue-800 dark:text-blue-200">
                          <span className="font-semibold">{className}:</span> {count}
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                    Hiển thị: <span className="font-semibold">{filteredDetections.length}</span> / {editedDetections?.length || detectionResult.data.detections.length} (theo độ tin cậy)
                  </p>
                </div>
                <CanvasDrawer
                  imageUrl={preview}
                  detections={filteredDetections}
                  imageInfo={detectionResult.data.image_info}
                  containerWidth={containerWidth}
                  onDetectionsChange={setEditedDetections}
                  enableEdit={true}
                  showRowlines={showRowlines}
                  onShowRowlinesChange={setShowRowlines}
                  confidenceFilter={
                    <ConfidenceFilter
                      value={confidenceThreshold}
                      onChange={handleConfidenceThresholdChange}
                      detectionCount={editedDetections?.length || detectionResult.data.detections.length}
                      filteredCount={filteredDetections.length}
                      isLoading={isRefetching}
                    />
                  }
                />

                {/* Submit to Dataset Button */}
                <Button
                  onClick={() => setShowSubmitDatasetModal(true)}
                  className="w-full"
                >
                  Gửi vào Dataset để cải thiện
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
