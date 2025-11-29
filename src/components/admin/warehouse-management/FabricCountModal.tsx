'use client';

import React, { useState, useEffect } from 'react';
import { yoloDetectSchema, YoloDetectFormData } from '@/schemas/yolo.schema';
import { yoloService } from '@/services/yolo.service';
import { YoloDetectionResponse, Detection } from '@/types/yolo';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, Camera, Loader2, X, AlertCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CanvasDrawer } from '@/components/admin/fabric-count/CanvasDrawer';
import { ConfidenceFilter } from '@/components/admin/fabric-count/ConfidenceFilter';
import { CameraCapture } from '@/components/admin/fabric-count/CameraCapture';
import { SubmitDatasetModal } from '@/components/admin/fabric-count/SubmitDatasetModal';
import { FabricCountImageCropper } from '@/components/admin/warehouse-management/FabricCountImageCropper';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';

interface FabricCountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentQuantity: number;
  maxQuantity: number;
  shelfCode: string;
}

export function FabricCountModal({
  isOpen,
  onClose,
  currentQuantity,
  maxQuantity,
  shelfCode,
}: FabricCountModalProps) {
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
  const [containerWidth, setContainerWidth] = useState<number>(600);
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string>('');
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.5);
  const [showCameraCapture, setShowCameraCapture] = useState(false);
  const [showSubmitDatasetModal, setShowSubmitDatasetModal] = useState(false);

  // Lọc detections dựa trên confidence threshold
  const filteredDetections = React.useMemo(() => {
    if (!detectionResult?.data.detections) return [];
    const allDetections = editedDetections || detectionResult.data.detections;
    return allDetections.filter((d) => d.confidence >= confidenceThreshold);
  }, [detectionResult, editedDetections, confidenceThreshold]);

  const countedQuantity = filteredDetections.length;
  const difference = countedQuantity - currentQuantity;
  const diffPercentage =
    currentQuantity > 0 ? ((difference / currentQuantity) * 100).toFixed(1) : '0';

  // Tính toán containerWidth responsive
  useEffect(() => {
    if (isOpen) {
      const updateWidth = () => {
        if (typeof window !== 'undefined') {
          const width = Math.min(window.innerWidth - 64, 600);
          setContainerWidth(width);
        }
      };

      updateWidth();
      window.addEventListener('resize', updateWidth);
      return () => window.removeEventListener('resize', updateWidth);
    }
  }, [isOpen]);

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
      detectObjects(croppedFile, confidenceThreshold);
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
      detectObjects(originalFile, confidenceThreshold);
    } catch (error) {
      toast.error('Lỗi khi xử lý ảnh');
    }
  };

  const detectObjects = async (file: File, confidence: number = 0.1) => {
    try {
      setIsDetecting(true);
      const response = await yoloService.detect({
        image: file,
        confidence,
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

  const handleReset = () => {
    setFormData({ image: undefined, confidence: 0.5 });
    setPreview('');
    setDetectionResult(null);
    setEditedDetections(null);
    setConfidenceThreshold(0.5);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Image Cropper Modal */}
        {showImageCropper && tempImageSrc && (
          <FabricCountImageCropper
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
            setShowSubmitDatasetModal(false);
          }}
        />

        <DialogHeader>
          <DialogTitle>Kiểm số lượng vải - Kệ {shelfCode}</DialogTitle>
          <DialogClose />
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Quantity Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Số lượng trong hệ thống
                  </p>
                  <p className="text-2xl font-bold text-blue-600">{currentQuantity}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Sức chứa tối đa
                  </p>
                  <p className="text-2xl font-bold text-gray-600">{maxQuantity}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload Section */}
          <div className="flex flex-col gap-3">
            <label htmlFor="fabric-count-image" className="cursor-pointer">
              <input
                id="fabric-count-image"
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
                onClick={() => document.getElementById('fabric-count-image')?.click()}
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
              <div className="space-y-3">
                {/* Comparison Alert */}
                <div
                  className={`p-4 rounded-lg border ${
                    difference === 0
                      ? 'bg-green-50 border-green-200'
                      : difference > 0
                        ? 'bg-orange-50 border-orange-200'
                        : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex gap-3">
                    <AlertCircle
                      className={`h-5 w-5 mt-0.5 shrink-0 ${
                        difference === 0
                          ? 'text-green-600'
                          : difference > 0
                            ? 'text-orange-600'
                            : 'text-red-600'
                      }`}
                    />
                    <div
                      className={`text-sm ${
                        difference === 0
                          ? 'text-green-800'
                          : difference > 0
                            ? 'text-orange-800'
                            : 'text-red-800'
                      }`}
                    >
                      <div className="grid grid-cols-3 gap-4 items-center mb-3">
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Số lượng đếm được</p>
                          <p className="text-xl font-bold">{countedQuantity}</p>
                        </div>
                        <div className="text-center border-l border-r border-current border-opacity-30">
                          <p className="text-xs text-gray-600">Chênh lệch</p>
                          <p
                            className={`text-xl font-bold ${
                              difference >= 0
                                ? 'text-orange-600'
                                : 'text-red-600'
                            }`}
                          >
                            {difference >= 0 ? '+' : ''}{difference}
                          </p>
                          <p className="text-xs text-gray-600">
                            ({diffPercentage}%)
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Trong hệ thống</p>
                          <p className="text-xl font-bold">{currentQuantity}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Message */}
                {difference === 0 ? (
                  <p className="text-sm text-green-700 font-medium">
                    ✓ Số lượng khớp hoàn toàn với hệ thống
                  </p>
                ) : difference > 0 ? (
                  <p className="text-sm text-orange-700 font-medium">
                    ⚠ Có thêm {difference} vải so với hệ thống
                  </p>
                ) : (
                  <p className="text-sm text-red-700 font-medium">
                    ✗ Thiếu {Math.abs(difference)} vải so với hệ thống
                  </p>
                )}
              </div>

              {/* Canvas */}
              <div>
                <p className="text-sm font-medium mb-3">
                  Kết quả phát hiện ({filteredDetections.length} vật thể)
                </p>
              </div>
              <CanvasDrawer
                imageUrl={preview}
                detections={filteredDetections}
                imageInfo={detectionResult.data.image_info}
                containerWidth={containerWidth}
                onDetectionsChange={setEditedDetections}
                enableEdit={true}
                onReload={() => detectObjects(formData.image as File, confidenceThreshold)}
                isReloading={isDetecting}
                confidenceFilter={
                    <ConfidenceFilter
                      value={confidenceThreshold}
                      onChange={setConfidenceThreshold}
                      detectionCount={
                        editedDetections?.length || detectionResult.data.detections.length
                      }
                      filteredCount={filteredDetections.length}
                    isLoading={isDetecting}
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

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={!detectionResult}
              className="flex-1"
            >
              Làm lại
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Đóng
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
