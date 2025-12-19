'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { yoloDetectSchema, YoloDetectFormData } from '@/schemas/yolo.schema';
import { yoloService } from '@/services/yolo.service';
import { warehouseService } from '@/services/warehouse.service';
import { YoloDetectionResponse, Detection } from '@/types/yolo';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, Camera, Loader2, X, AlertCircle, Settings, Palette, ArrowLeft, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import {
  extractCircleColorsFromImage,
  matchMultipleColors,
  countByColor,
  type ColorBox,
  type PaletteColor,
} from '@/lib/colorExtractor';
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

export default function FabricCountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get params from URL
  const shelfId = searchParams.get('shelfId');
  const fabricId = searchParams.get('fabricId');

  // Shelf data states
  const [shelfData, setShelfData] = useState<any>(null);
  const [isLoadingShelf, setIsLoadingShelf] = useState(true);

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

  // Color detection states
  const [shelfColors, setShelfColors] = useState<PaletteColor[]>([]);
  const [colorTotalQuantities, setColorTotalQuantities] = useState<Record<string, number | string>>({});
  const [colorMatches, setColorMatches] = useState<any[]>([]);
  const [colorCounts, setColorCounts] = useState<Record<string, any>>({});
  const [isAnalyzingColors, setIsAnalyzingColors] = useState(false);
  const [extractedColors, setExtractedColors] = useState<any[]>([]);

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

  // Fetch shelf data on mount
  useEffect(() => {
    if (!shelfId) {
      toast.error('Không có thông tin kệ');
      router.back();
      return;
    }

    const fetchShelfData = async () => {
      try {
        setIsLoadingShelf(true);
        const data = await warehouseService.getShelfById(shelfId);
        setShelfData(data);
      } catch (error) {
        const message = getServerErrorMessage(error) || 'Không thể tải thông tin kệ';
        toast.error(message);
        router.back();
      } finally {
        setIsLoadingShelf(false);
      }
    };

    fetchShelfData();
  }, [shelfId, router]);

  // Lọc detections dựa trên confidence threshold
  const filteredDetections = React.useMemo(() => {
    if (!detectionResult?.data.detections) return [];
    const allDetections = editedDetections || detectionResult.data.detections;
    return allDetections.filter((d) => d.confidence >= confidenceThreshold);
  }, [detectionResult, editedDetections, confidenceThreshold]);

  const currentQuantity = shelfData?.currentQuantity || 0;
  const maxQuantity = shelfData?.maxQuantity || 0;
  const shelfCode = shelfData?.code || 'N/A';

  const countedQuantity = filteredDetections.length;
  const difference = countedQuantity - currentQuantity;
  const diffPercentage =
    currentQuantity > 0 ? ((difference / currentQuantity) * 100).toFixed(1) : '0';

  // Tính toán containerWidth responsive
  useEffect(() => {
    const updateWidth = () => {
      if (typeof window !== 'undefined') {
        const width = Math.min(window.innerWidth - 64, 800);
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

      const reader = new FileReader();
      reader.onload = async (event) => {
        const previewUrl = event.target?.result as string;
        setPreview(previewUrl);
        const response = await yoloService.detect({
          image: croppedFile,
          confidence: confidenceThreshold,
        });
        if (response.success) {
          setDetectionResult(response);
          setEditedDetections(null);
          toast.success('Phát hiện vật thể thành công');
          if (shelfColors.length > 0) {
            analyzeDetectionColors(response, previewUrl);
          }
        } else {
          toast.error(response.message || 'Lỗi phát hiện vật thể');
        }
        setIsDetecting(false);
      };
      reader.readAsDataURL(croppedFile);

      setFormData({ ...formData, image: croppedFile });
      setIsDetecting(true);
    } catch (error) {
      toast.error('Lỗi khi xử lý ảnh');
      setIsDetecting(false);
    }
  };

  const handleCropCancel = () => {
    setShowImageCropper(false);
    setTempImageSrc('');
  };

  const handleCameraCapture = async (file: File) => {
    try {
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

      const reader = new FileReader();
      reader.onload = async (event) => {
        const previewUrl = event.target?.result as string;
        setPreview(previewUrl);
        const response = await yoloService.detect({
          image: originalFile,
          confidence: confidenceThreshold,
        });
        if (response.success) {
          setDetectionResult(response);
          setEditedDetections(null);
          toast.success('Phát hiện vật thể thành công');
          if (shelfColors.length > 0) {
            analyzeDetectionColors(response, previewUrl);
          }
        } else {
          toast.error(response.message || 'Lỗi phát hiện vật thể');
        }
        setIsDetecting(false);
      };
      reader.readAsDataURL(originalFile);

      setFormData({ ...formData, image: originalFile });
      setIsDetecting(true);
    } catch (error) {
      toast.error('Lỗi khi xử lý ảnh');
      setIsDetecting(false);
    }
  };

  const detectObjects = async (file: File, confidence: number = 0.1, imageUrl?: string) => {
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

        if (shelfColors.length > 0 && imageUrl) {
          analyzeDetectionColors(response, imageUrl);
        }
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

  const analyzeDetectionColors = async (detection: YoloDetectionResponse, imageUrl: string) => {
    try {
      setIsAnalyzingColors(true);

      const boxes: ColorBox[] = (editedDetections || detection.data.detections)
        .filter((d) => {
          if (!d) return false;
          if (d.bbox && d.bbox.x1 !== undefined && d.bbox.y1 !== undefined && d.bbox.x2 !== undefined && d.bbox.y2 !== undefined) {
            return true;
          }
          if (d.center && d.dimensions && d.center.x !== undefined && d.center.y !== undefined && d.dimensions.width !== undefined && d.dimensions.height !== undefined) {
            return true;
          }
          return false;
        })
        .map((d) => {
          if (d.bbox && d.bbox.x1 !== undefined) {
            return {
              x: d.bbox.x1,
              y: d.bbox.y1,
              width: d.bbox.x2 - d.bbox.x1,
              height: d.bbox.y2 - d.bbox.y1,
            };
          } else if (d.center && d.dimensions) {
            const halfWidth = d.dimensions.width / 2;
            const halfHeight = d.dimensions.height / 2;
            return {
              x: d.center.x - halfWidth,
              y: d.center.y - halfHeight,
              width: d.dimensions.width,
              height: d.dimensions.height,
            };
          }
          return {
            x: 0,
            y: 0,
            width: 100,
            height: 100,
          };
        });

      if (boxes.length === 0) {
        setColorMatches([]);
        setColorCounts({});
        setIsAnalyzingColors(false);
        return;
      }

      const extracted = await extractCircleColorsFromImage(imageUrl, boxes, {
        resize: 80,
        minLabelSatDiff: 0.15,
        minLightness: 0.6,
      });

      setExtractedColors(extracted);
      const matches = matchMultipleColors(extracted, shelfColors);
      setColorMatches(matches);

      const counts = countByColor(matches, shelfColors, 0);
      
      // Add totalQuantity to each color count
      const countsWithQuantity = Object.entries(counts).reduce((acc, [colorId, data]) => {
        acc[colorId] = {
          ...data,
          totalQuantity: colorTotalQuantities[colorId] || 0,
        };
        return acc;
      }, {} as Record<string, any>);
      
      setColorCounts(countsWithQuantity);
    } catch (error: any) {
      console.error('Error analyzing colors:', error);
      toast.error('Lỗi khi phân tích màu sắc');
    } finally {
      setIsAnalyzingColors(false);
    }
  };

  // Load shelf colors
  useEffect(() => {
    if (shelfId) {
      const loadColors = async () => {
        try {
          const response = await warehouseService.getShelfColors(shelfId);
          const palette: PaletteColor[] = response.data.colors.map((c) => ({
            id: c.id,
            name: c.name,
            color: c.hexCode,
            hexCode: c.hexCode,
          }));
          setShelfColors(palette);
          
          // Store totalQuantity for each color
          const quantities: Record<string, number | string> = {};
          response.data.colors.forEach((c) => {
            quantities[c.id] = c.totalQuantity;
          });
          setColorTotalQuantities(quantities);
        } catch (error) {
          console.error('Error loading shelf colors:', error);
        }
      };
      loadColors();
    }
  }, [shelfId]);

  // Re-analyze colors when edited detections change
  useEffect(() => {
    if (
      detectionResult &&
      detectionResult.success &&
      preview &&
      shelfColors.length > 0 &&
      editedDetections !== null
    ) {
      analyzeDetectionColors(detectionResult, preview);
    }
  }, [editedDetections]);

  const handleReset = () => {
    setFormData({ image: undefined, confidence: 0.5 });
    setPreview('');
    setDetectionResult(null);
    setEditedDetections(null);
    setConfidenceThreshold(0.5);
    setColorMatches([]);
    setColorCounts({});
  };

  const handleOpenAdjustmentDialog = async () => {
    try {
      if (shelfId) {
        const shelfData = await warehouseService.getShelfById(shelfId);
        setFabrics(shelfData.fabricShelf || []);
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
      
      // Reload shelf data
      if (shelfId) {
        try {
          const data = await warehouseService.getShelfById(shelfId);
          setShelfData(data);
        } catch (error) {
          console.error('Error reloading shelf data:', error);
        }
      }
      
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

  const handleBack = () => {
    router.back();
  };

  // Show loading state while fetching shelf data
  if (isLoadingShelf) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          <p className="text-gray-500">Đang tải dữ liệu kệ...</p>
        </div>
      </div>
    );
  }

  if (!shelfData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Không thể tải dữ liệu kệ</p>
          <Button onClick={handleBack} variant="outline">
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
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

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBack}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold">Kiểm số lượng vải - Kệ {shelfCode}</h1>
        </div>

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
                extractedColors={extractedColors}
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

              {/* Color Analysis Card */}
              {shelfColors.length > 0 && (
                <div className="space-y-4">
                  <Card className="bg-purple-50 border-purple-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Palette className="w-5 h-5" />
                        Phân tích theo màu sắc
                      </CardTitle>
                      <CardDescription>
                        {isAnalyzingColors
                          ? 'Đang phân tích màu sắc...'
                          : `Đã phát hiện ${Object.values(colorCounts).reduce((sum, c) => sum + c.count, 0)} vật thể từ ${shelfColors.length} loại màu`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isAnalyzingColors ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          <span className="text-sm text-muted-foreground">
                            Phân tích màu sắc từ các detection...
                          </span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3">
                          {Object.entries(colorCounts)
                            .sort((a, b) => b[1].count - a[1].count)
                            .map(([colorId, data]) => {
                            return (
                              <div
                                key={colorId}
                                className={`flex items-center justify-between p-3 rounded-lg border ${
                                  (() => {
                                    const count = data.count;
                                    const total = parseInt(String(data.totalQuantity)) || 0;
                                    
                                    if (total === 0) {
                                      return 'bg-gray-50 border-gray-200 opacity-50';
                                    }
                                    
                                    if (count === total) {
                                      // Đủ
                                      return 'bg-green-50 border-green-300';
                                    } else if (count < total) {
                                      // Thiếu
                                      return 'bg-yellow-50 border-yellow-300';
                                    } else {
                                      // Thừa
                                      return 'bg-red-50 border-red-300';
                                    }
                                  })()
                                }`}
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <div
                                    className="w-8 h-8 rounded-full border-2 border-gray-300 shrink-0"
                                    style={{
                                      backgroundColor: data.hexCode || '#cccccc',
                                    }}
                                    title={data.name}
                                  />
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{data.name}</p>
                                    {data.count > 0 && (
                                      <p className="text-xs text-muted-foreground">
                                        Độ tin cậy: {(data.confidence * 100).toFixed(0)}%
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <div className="flex items-baseline justify-end gap-1">
                                    <span className={`text-2xl font-bold ${
                                      (() => {
                                        const count = data.count;
                                        const total = parseInt(String(data.totalQuantity)) || 0;
                                        
                                        if (total === 0) {
                                          return 'text-gray-400';
                                        }
                                        
                                        if (count === total) {
                                          // Đủ - xanh
                                          return 'text-green-600';
                                        } else if (count < total) {
                                          // Thiếu - vàng
                                          return 'text-yellow-600';
                                        } else {
                                          // Thừa - đỏ
                                          return 'text-red-600';
                                        }
                                      })()
                                    }`}>
                                      {data.count}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      / {data.totalQuantity || 0}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 mt-1">
                                    {(() => {
                                      const count = data.count;
                                      const total = parseInt(String(data.totalQuantity)) || 0;
                                      
                                      if (total === 0) {
                                        return null;
                                      }
                                      
                                      if (count === total) {
                                        return (
                                          <>
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                            <span className="text-xs font-semibold text-green-600">Đủ</span>
                                          </>
                                        );
                                      } else if (count < total) {
                                        return (
                                          <>
                                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                            <span className="text-xs font-semibold text-yellow-600">Thiếu {total - count}</span>
                                          </>
                                        );
                                      } else {
                                        return (
                                          <>
                                            <XCircle className="w-4 h-4 text-red-600" />
                                            <span className="text-xs font-semibold text-red-600">Thừa {count - total}</span>
                                          </>
                                        );
                                      }
                                    })()}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

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
              onClick={handleBack}
              className="flex-1"
            >
              Quay lại
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
      </div>
    </div>
  );
}
