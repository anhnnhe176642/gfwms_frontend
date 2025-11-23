'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { YOLOImageLabeling } from '@/components/admin/yolo-dataset-labeling/YOLOImageLabeling';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { yoloDatasetService } from '@/services/yolo-dataset.service';
import { getServerErrorMessage } from '@/lib/errorHandler';
import { Loader2, ArrowLeft } from 'lucide-react';

interface ImageLabelPageParams {
  datasetId: string;
  imageId: string;
}

interface ExistingLabel {
  classId: number;
  className: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const ImageLabelPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const datasetId = Array.isArray(params.datasetId) ? params.datasetId[0] : params.datasetId;
  const imageId = Array.isArray(params.imageId) ? params.imageId[0] : params.imageId;

  const [classes, setClasses] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [existingLabels, setExistingLabels] = useState<ExistingLabel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch dataset info (classes) và image details
  useEffect(() => {
    const fetchData = async () => {
      if (!datasetId || !imageId) {
        toast.error('Dataset ID hoặc Image ID không hợp lệ');
        return;
      }

      setLoading(true);
      try {
        // Lấy thông tin dataset để có danh sách classes
        const datasetInfo = await yoloDatasetService.getDatasetWithClasses(datasetId);
        
        if (!datasetInfo) {
          throw new Error('Không thể lấy thông tin dataset');
        }

        const datasetClasses = datasetInfo.classes || [];
        if (datasetClasses.length === 0) {
          toast.warning('Dataset không có classes được cấu hình');
        }
        setClasses(datasetClasses);

        // Lấy thông tin chi tiết ảnh
        const imageDetail = await yoloDatasetService.getImageById(imageId);
        
        if (!imageDetail) {
          throw new Error('Không thể lấy thông tin ảnh');
        }

        if (imageDetail.imageUrl) {
          setImageUrl(imageDetail.imageUrl);
          
          // Load image để lấy kích thước
          const img = new Image();
          img.onload = () => {
            setImageDimensions({ width: img.width, height: img.height });
          };
          img.onerror = () => {
            console.warn('Failed to load image dimensions');
          };
          img.src = imageDetail.imageUrl;
        } else {
          throw new Error('Ảnh không có URL');
        }

        // Lấy annotations hiện tại (nếu có)
        if (imageDetail.annotations && Array.isArray(imageDetail.annotations)) {
          // Annotations (pixel format) - Source of truth
          // Array of: {class_id, class_name, x1, y1, x2, y2, confidence}
          // x1, y1 = top-left corner; x2, y2 = bottom-right corner (pixel coordinates)
          const pixelLabels: ExistingLabel[] = imageDetail.annotations.map((ann: any) => {
            const x1Pixel = ann.x1 || 0;
            const y1Pixel = ann.y1 || 0;
            const x2Pixel = ann.x2 || 0;
            const y2Pixel = ann.y2 || 0;
            
            const width = Math.max(0, x2Pixel - x1Pixel);
            const height = Math.max(0, y2Pixel - y1Pixel);

            // Tìm class index từ danh sách classes dataset
            const classIndex = datasetClasses.indexOf(ann.class_name || '');

            return {
              classId: classIndex >= 0 ? classIndex : (ann.class_id || 0),
              className: ann.class_name || '',
              x: x1Pixel,
              y: y1Pixel,
              width: width,
              height: height,
            };
          });
          setExistingLabels(pixelLabels);
        }
      } catch (err) {
        const message = getServerErrorMessage(err) || 'Không thể tải thông tin ảnh';
        toast.error(message);
        console.error('Error fetching image data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (datasetId && imageId) {
      fetchData();
    }
  }, [datasetId, imageId]);

  const handleSave = async (labels: ExistingLabel[], status?: 'draft' | 'completed') => {
    if (!imageId) {
      toast.error('Image ID không hợp lệ');
      return;
    }

    setSaving(true);
    try {
      await yoloDatasetService.saveImageAnnotations(imageId, labels);
      
      // Map component status to API status
      if (status === 'draft') {
        // Cập nhật trạng thái = PROCESSING (đang xử lý nháp)
        await yoloDatasetService.updateImage(imageId, { status: 'PROCESSING' });
        toast.success(`Đã lưu nháp ${labels.length} bounding boxes`);
      } else if (status === 'completed') {
        // Cập nhật trạng thái = COMPLETED (hoàn thành)
        await yoloDatasetService.updateImage(imageId, { status: 'COMPLETED' });
        toast.success(`Đã lưu hoàn thành ${labels.length} bounding boxes`);
        
        // Quay lại trang danh sách ảnh sau 1 giây
        setTimeout(() => {
          router.push(`/admin/yolo-datasets/${datasetId}/images`);
        }, 1000);
      }
    } catch (err) {
      const message = getServerErrorMessage(err) || 'Không thể lưu labels';
      toast.error(message);
      console.error('Error saving annotations:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Đang tải thông tin ảnh...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!imageUrl || classes.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleCancel}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Gán nhãn ảnh</h1>
        </div>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">
              {!imageUrl 
                ? 'Không thể tải URL ảnh. Vui lòng kiểm tra lại.' 
                : 'Dataset không có class labels. Vui lòng cấu hình classes trước.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleCancel}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gán nhãn ảnh</h1>
            <p className="text-muted-foreground mt-1">
              Dataset: {datasetId} • Ảnh: {imageId}
            </p>
          </div>
        </div>
      </div>

      {/* Image Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Dataset ID:</span>
              <p className="font-mono text-primary">{datasetId}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Image ID:</span>
              <p className="font-mono text-primary">{imageId}</p>
            </div>
            {imageDimensions && (
              <div>
                <span className="text-muted-foreground">Kích thước:</span>
                <p className="font-medium">{imageDimensions.width} × {imageDimensions.height}px</p>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Classes:</span>
              <p className="font-medium">{classes.length} classes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Labeling Component */}
      <YOLOImageLabeling
        imageSrc={imageUrl}
        classes={classes}
        existingLabels={existingLabels}
        onSave={handleSave}
        onCancel={handleCancel}
        disabled={saving}
      />

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hướng dẫn</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <strong>1. Chọn class:</strong> Chọn class label từ dropdown trước khi vẽ box
          </div>
          <div>
            <strong>2. Vẽ bounding box:</strong> Click và kéo chuột để vẽ box xung quanh đối tượng
          </div>
          <div>
            <strong>3. Chỉnh sửa:</strong> Kéo góc/cạnh để resize, kéo bên trong để di chuyển
          </div>
          <div>
            <strong>4. Thay đổi class:</strong> Chọn class khác từ dropdown trong danh sách boxes
          </div>
          <div>
            <strong>5. Xóa:</strong> Chọn box và nhấn <kbd className="px-1.5 py-0.5 bg-muted rounded border text-xs">Delete</kbd>
          </div>
          <div>
            <strong>6. Undo/Redo:</strong> <kbd className="px-1.5 py-0.5 bg-muted rounded border text-xs">Ctrl+Z</kbd> / <kbd className="px-1.5 py-0.5 bg-muted rounded border text-xs">Ctrl+Shift+Z</kbd>
          </div>
          <div>
            <strong>7. Zoom:</strong> <kbd className="px-1.5 py-0.5 bg-muted rounded border text-xs">Ctrl+Scroll</kbd> để zoom
          </div>
          <div>
            <strong>8. Lưu:</strong> Click "Lưu labels" để lưu annotations về database
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageLabelPage;
