'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { DatasetImagesTable } from '@/components/admin/yolo-dataset-management';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ROUTES } from '@/config/routes';
import { yoloDatasetService } from '@/services/yolo-dataset.service';
import { getServerErrorMessage } from '@/lib/errorHandler';
import { ArrowLeft, Loader } from 'lucide-react';
import { toast } from 'sonner';
import type { DatasetImageDetail } from '@/types/yolo-dataset';

export default function DatasetImagesPage({
  params,
}: {
  params: Promise<{ datasetId: string }>;
}) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [datasetId, setDatasetId] = useState<string | null>(null);
  const [datasetName, setDatasetName] = useState<string>('');
  const [isLoadingDataset, setIsLoadingDataset] = useState(true);
  const [viewImageDialogOpen, setViewImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<DatasetImageDetail | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);

  useEffect(() => {
    const initPage = async () => {
      try {
        const { datasetId: id } = await params;
        setDatasetId(id);

        // Fetch dataset info to get name
        const dataset = await yoloDatasetService.getDatasetById(id);
        setDatasetName(dataset.name);
      } catch (err) {
        const message = getServerErrorMessage(err) || 'Không thể tải thông tin dataset';
        toast.error(message);
      } finally {
        setIsLoadingDataset(false);
      }
    };

    initPage();
  }, [params]);

  // Vẽ annotations lên canvas khi selectedImage thay đổi
  useEffect(() => {
    if (!selectedImage || !selectedImage.imageUrl) {
      return;
    }

    // Delay để đảm bảo canvas đã mount và visible trong DOM
    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }
      
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        return;
      }

      // Tạo mapping color cho từng class
      const classColorMap: Record<string, string> = {};
      const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
        '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
      ];
      let colorIndex = 0;

      // Gán màu cho các class
      if (selectedImage.annotations && selectedImage.annotations.length > 0) {
        selectedImage.annotations.forEach((ann) => {
          if (ann.class_name && !classColorMap[ann.class_name]) {
            classColorMap[ann.class_name] = colors[colorIndex % colors.length];
            colorIndex++;
          }
        });
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        // Set canvas kích thước bằng ảnh
        canvas.width = img.width;
        canvas.height = img.height;

        // Clear canvas trước
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Vẽ ảnh
        ctx.drawImage(img, 0, 0);

        // Vẽ các annotations
        if (selectedImage.annotations && selectedImage.annotations.length > 0) {
          
          selectedImage.annotations.forEach((ann, index) => {
            // Convert từ normalized coordinates (0-1) sang pixel coordinates
            const x1 = ann.x1 * img.width;
            const y1 = ann.y1 * img.height;
            const x2 = ann.x2 * img.width;
            const y2 = ann.y2 * img.height;
            const width = x2 - x1;
            const height = y2 - y1;

            // Lấy màu từ class name (cùng class = cùng màu)
            const color = ann.class_name ? classColorMap[ann.class_name] : '#4ECDC4';

            // Vẽ fill với alpha
            ctx.fillStyle = `${color}33`;
            ctx.fillRect(x1, y1, width, height);

            // Vẽ border
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.strokeRect(x1, y1, width, height);

            // Vẽ label text
            if (ann.class_name) {
              ctx.fillStyle = color;
              ctx.font = 'bold 14px Arial';
              const textMetrics = ctx.measureText(ann.class_name);
              const textPadding = 4;
              const textHeight = 18;

              // Background cho text
              ctx.fillRect(
                x1,
                Math.max(0, y1 - textHeight - textPadding),
                textMetrics.width + textPadding * 2,
                textHeight
              );

              // Text
              ctx.fillStyle = '#FFFFFF';
              ctx.fillText(ann.class_name, x1 + textPadding, Math.max(14, y1 - textPadding - 2));
            }
          });
        }
      };

      img.onerror = (e) => {
        toast.error('Không thể tải ảnh');
      };

      img.src = selectedImage.imageUrl || '';
    }, 200);

    return () => clearTimeout(timer);
  }, [selectedImage]);

  const handleViewImage = async (imageId: string) => {
    setLoadingImage(true);
    try {
      const imageDetail = await yoloDatasetService.getImageById(imageId);
      setSelectedImage(imageDetail);
      setViewImageDialogOpen(true);
    } catch (err) {
      const message = getServerErrorMessage(err) || 'Không thể tải thông tin ảnh';
      toast.error(message);
    } finally {
      setLoadingImage(false);
    }
  };

  if (isLoadingDataset) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-2">
          <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!datasetId) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-destructive">Không thể tải dữ liệu dataset</p>
              <Button onClick={() => router.back()} variant="outline">
                Quay lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.YOLO_DATASETS.DETAIL}>
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Quản lý ảnh Dataset</h1>
              <p className="text-sm text-muted-foreground">
                {datasetName || 'Dataset'}
              </p>
            </div>
          </div>

          {/* Main Content */}
          <Card>
            <CardHeader>
              <CardTitle>Danh sách ảnh</CardTitle>
              <CardDescription>
                Quản lý danh sách ảnh và nhãn cho dataset
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DatasetImagesTable
                datasetId={datasetId}
                onViewImage={handleViewImage}
              />
            </CardContent>
          </Card>
        </div>

        {/* Image Detail Dialog */}
        <Dialog open={viewImageDialogOpen} onOpenChange={setViewImageDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chi tiết ảnh</DialogTitle>
              <DialogDescription>
                {selectedImage?.filename}
              </DialogDescription>
            </DialogHeader>

            {loadingImage ? (
              <div className="flex justify-center py-8">
                <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : selectedImage ? (
              <div className="space-y-4">
                {/* Image Preview with Annotations */}
                <div className="flex flex-col items-center justify-center bg-muted/50 rounded-lg border p-4">
                  {selectedImage.imageUrl ? (
                    <canvas
                      ref={canvasRef}
                      style={{ 
                        maxWidth: '100%',
                        maxHeight: '70vh',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        backgroundColor: '#000'
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-48 bg-muted">
                      <p className="text-muted-foreground">Không có ảnh để hiển thị</p>
                    </div>
                  )}
                </div>

                {/* Image Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">Trạng thái</p>
                    <p className="font-semibold">{selectedImage.status}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Số đối tượng</p>
                    <p className="font-semibold">{selectedImage.objectCount}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Người tải lên</p>
                    <p className="font-semibold">{selectedImage.uploadedByUser?.fullname || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Ngày tạo</p>
                    <p className="font-semibold">
                      {new Date(selectedImage.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>

                {/* Notes */}
                {selectedImage.notes && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ghi chú</p>
                    <p className="text-sm p-2 bg-muted rounded word-break">
                      {selectedImage.notes}
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
