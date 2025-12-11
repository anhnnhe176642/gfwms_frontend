'use client';

import React, { useState, useEffect } from 'react';
import { yoloDetectSchema, YoloDetectFormData } from '@/schemas/yolo.schema';
import { yoloService } from '@/services/yolo.service';
import { warehouseService } from '@/services/warehouse.service';
import { YoloDetectionResponse, Detection } from '@/types/yolo';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, Camera, Loader2, X, AlertCircle, Settings } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CanvasDrawer } from '@/components/admin/fabric-count/CanvasDrawer';
import { ConfidenceFilter } from '@/components/admin/fabric-count/ConfidenceFilter';
import { CameraCapture } from '@/components/admin/fabric-count/CameraCapture';
import { SubmitDatasetModal } from '@/components/admin/fabric-count/SubmitDatasetModal';
import { FabricCountImageCropper } from '@/components/admin/warehouse-management/FabricCountImageCropper';
import { extractFieldErrors, getServerErrorMessage } from '@/lib/errorHandler';
import type { AdjustmentType, FabricShelfImportItem } from '@/types/warehouse';

interface FabricCountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentQuantity: number;
  maxQuantity: number;
  shelfCode: string;
  fabricId?: string | number;
  shelfId?: string | number;
}

export function FabricCountModal({
  isOpen,
  onClose,
  currentQuantity,
  maxQuantity,
  shelfCode,
  fabricId,
  shelfId,
}: FabricCountModalProps) {
  // YOLO Detection states
  const [formData, setFormData] = useState<Partial<YoloDetectFormData>>({
    image: undefined,
    confidence: 0.5,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<string>('');
  const [detectionResult, setDetectionResult] = useState<YoloDetectionResponse | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [editedDetections, setEditedDetections] = useState<Detection[] | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(600);
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string>('');
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.5);
  const [showCameraCapture, setShowCameraCapture] = useState(false);
  const [showSubmitDatasetModal, setShowSubmitDatasetModal] = useState(false);

  // Adjustment dialog states
  const [showAdjustmentDialog, setShowAdjustmentDialog] = useState(false);
  const [fabrics, setFabrics] = useState<any[]>([]);
  const [imports, setImports] = useState<FabricShelfImportItem[]>([]);
  const [selectedFabricId, setSelectedFabricId] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [adjustmentForm, setAdjustmentForm] = useState({
    importId: '',
    quantity: '',
    type: 'IMPORT' as AdjustmentType,
    reason: '',
  });
  const [isSubmittingAdjustment, setIsSubmittingAdjustment] = useState(false);

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

  // Load fabrics when adjustment dialog opens
  const handleOpenAdjustmentDialog = async () => {
    try {
      if (shelfId) {
        const shelfData = await warehouseService.getShelfById(shelfId);
        setFabrics(shelfData.fabricShelf || []);
        // Set current fabric as default
        if (fabricId) {
          setSelectedFabricId(String(fabricId));
        }
      } else {
        toast.error('Không có thông tin kệ (shelfId)');
      }
      setShowAdjustmentDialog(true);
    } catch (error) {
      toast.error('Không thể tải danh sách vải trong kệ');
    }
  };

  // Load imports when fabric is selected
  useEffect(() => {
    if (selectedFabricId && shelfId) {
      const loadImports = async () => {
        try {
          const response = await warehouseService.getFabricShelfDetail(shelfId, selectedFabricId);
          setImports(response.imports || []);
          setAdjustmentForm(prev => ({ ...prev, importId: '' }));
        } catch (error) {
          toast.error('Không thể tải danh sách lô nhập');
          setImports([]);
        }
      };
      loadImports();
    }
  }, [selectedFabricId, shelfId]);

  // Handle adjustment form change
  const handleAdjustmentFormChange = (field: string, value: any) => {
    setAdjustmentForm(prev => ({
      ...prev,
      [field]: value,
    }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  // Submit adjustment
  const handleAdjustmentSubmit = async () => {
    setFieldErrors({});

    if (!selectedFabricId || !adjustmentForm.importId || !adjustmentForm.quantity || !adjustmentForm.reason) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setIsSubmittingAdjustment(true);
      if (!shelfId) {
        toast.error('Không có thông tin kệ');
        return;
      }
      await warehouseService.adjustFabricQuantity(shelfId, {
        fabricId: parseInt(selectedFabricId),
        importId: parseInt(adjustmentForm.importId),
        quantity: parseInt(adjustmentForm.quantity),
        type: adjustmentForm.type,
        reason: adjustmentForm.reason,
      });

      toast.success('Điều chỉnh số lượng vải thành công');
      setShowAdjustmentDialog(false);
      setSelectedFabricId('');
      setAdjustmentForm({
        importId: '',
        quantity: '',
        type: 'IMPORT',
        reason: '',
      });
    } catch (err) {
      const errors = extractFieldErrors(err);
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
      }
      const message = getServerErrorMessage(err) || 'Không thể điều chỉnh số lượng vải';
      toast.error(message);
    } finally {
      setIsSubmittingAdjustment(false);
    }
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto"  maxWidth = "sm:max-w-5xl">
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
              {/* Comparison Alert */}
              <div
                className={`p-6 rounded-lg border ${
                  difference === 0
                    ? 'bg-green-50 border-green-200'
                    : difference > 0
                      ? 'bg-orange-50 border-orange-200'
                      : 'bg-red-50 border-red-200'
                }`}
              >
                  <div className="flex gap-4 items-start mb-4">
                    <AlertCircle
                      className={`h-6 w-6 shrink-0 mt-1 ${
                        difference === 0
                          ? 'text-green-600'
                          : difference > 0
                            ? 'text-orange-600'
                            : 'text-red-600'
                      }`}
                    />
                    <div className="flex-1">
                      <h3 className={`font-semibold mb-4 ${
                        difference === 0
                          ? 'text-green-900'
                          : difference > 0
                            ? 'text-orange-900'
                            : 'text-red-900'
                      }`}>
                        Kết quả so sánh số lượng
                      </h3>
                      
                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                          <p className="text-xs font-medium text-gray-600 mb-2">Số lượng đếm được</p>
                          <p className="text-2xl font-bold text-gray-900">{countedQuantity}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                          <p className="text-xs font-medium text-gray-600 mb-2">Chênh lệch</p>
                          <p
                            className={`text-2xl font-bold ${
                              difference === 0
                                ? 'text-green-600'
                                : difference > 0
                                  ? 'text-orange-600'
                                  : 'text-red-600'
                            }`}
                          >
                            {difference >= 0 ? '+' : ''}{difference}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            ({diffPercentage}%)
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                          <p className="text-xs font-medium text-gray-600 mb-2">Trong hệ thống</p>
                          <p className="text-2xl font-bold text-gray-900">{currentQuantity}</p>
                        </div>
                      </div>
                      {/* Status Message */}
                      <div className="mt-4">
                        {difference === 0 ? (
                          <p className="text-sm text-green-700 font-semibold">
                            ✓ Số lượng khớp hoàn toàn với hệ thống
                          </p>
                        ) : difference > 0 ? (
                          <p className="text-sm text-orange-700 font-semibold">
                            ⚠ Có thêm {difference} vải so với hệ thống
                          </p>
                        ) : (
                          <p className="text-sm text-red-700 font-semibold">
                            ✗ Thiếu {Math.abs(difference)} vải so với hệ thống
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
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
                imageInfo={detectionResult?.data.image_info}
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
                      editedDetections?.length || detectionResult?.data.detections.length || 0
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
              onClick={() => {
                handleOpenAdjustmentDialog();
              }}
              className="flex-1"
            >
              <Settings className="h-4 w-4 mr-2" />
              Điều chỉnh số lượng
            </Button>
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

        {/* Adjustment Dialog */}
        <Dialog open={showAdjustmentDialog} onOpenChange={setShowAdjustmentDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Điều chỉnh số lượng vải</DialogTitle>
              <DialogDescription>
                Chọn loại vải, lô nhập, loại điều chỉnh, số lượng và lý do
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Fabric selection */}
              <div className="space-y-2">
                <Label htmlFor="fabric">Chọn loại vải *</Label>
                <Select value={selectedFabricId} onValueChange={setSelectedFabricId}>
                  <SelectTrigger id="fabric">
                    <SelectValue placeholder="Chọn loại vải..." />
                  </SelectTrigger>
                  <SelectContent>
                    {fabrics.map((item) => (
                      <SelectItem key={item.fabricId} value={String(item.fabricId)}>
                        {item.fabric?.category?.name || 'Loại vải'} - Số lượng: {item.quantity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Import selection */}
              <div className="space-y-2">
                <Label htmlFor="import">Chọn lô nhập *</Label>
                <Select
                  value={adjustmentForm.importId}
                  onValueChange={(value) => handleAdjustmentFormChange('importId', value)}
                  disabled={!selectedFabricId}
                >
                  <SelectTrigger id="import">
                    <SelectValue placeholder="Chọn lô nhập..." />
                  </SelectTrigger>
                  <SelectContent>
                    {imports.map((imp) => (
                      <SelectItem key={imp.importId} value={String(imp.importId)}>
                        Lô #{imp.importId} - {imp.currentQuantity} cái
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type selection */}
              <div className="space-y-2">
                <Label htmlFor="type">Loại điều chỉnh *</Label>
                <Select
                  value={adjustmentForm.type}
                  onValueChange={(value) => handleAdjustmentFormChange('type', value as AdjustmentType)}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IMPORT">Tăng (Nhập)</SelectItem>
                    <SelectItem value="DESTROY">Giảm (Hủy)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity input */}
              <div className="space-y-2">
                <Label htmlFor="quantity">Số lượng *</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="Nhập số lượng"
                  value={adjustmentForm.quantity}
                  onChange={(e) => handleAdjustmentFormChange('quantity', e.target.value)}
                  min="1"
                  className={fieldErrors.quantity ? 'border-red-500 focus:ring-red-500' : ''}
                />
                {fieldErrors.quantity && (
                  <p className="text-xs text-red-500">{fieldErrors.quantity}</p>
                )}
              </div>

              {/* Reason textarea */}
              <div className="space-y-2">
                <Label htmlFor="reason">Lý do điều chỉnh *</Label>
                <Textarea
                  id="reason"
                  placeholder="Nhập lý do điều chỉnh..."
                  value={adjustmentForm.reason}
                  onChange={(e) => handleAdjustmentFormChange('reason', e.target.value)}
                  rows={3}
                  className={fieldErrors.reason ? 'border-red-500 focus:ring-red-500' : ''}
                />
                {fieldErrors.reason && (
                  <p className="text-xs text-red-500">{fieldErrors.reason}</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAdjustmentDialog(false)}
                disabled={isSubmittingAdjustment}
              >
                Hủy
              </Button>
              <Button
                onClick={handleAdjustmentSubmit}
                disabled={isSubmittingAdjustment}
              >
                {isSubmittingAdjustment ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  'Xác nhận'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
