'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
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
import Image from 'next/image';
import type { DatasetImage } from '@/types/yolo-dataset';

export default function DatasetImagesPage({
  params,
}: {
  params: Promise<{ datasetId: string }>;
}) {
  const router = useRouter();
  const [datasetId, setDatasetId] = useState<string | null>(null);
  const [datasetName, setDatasetName] = useState<string>('');
  const [isLoadingDataset, setIsLoadingDataset] = useState(true);
  const [viewImageDialogOpen, setViewImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<DatasetImage | null>(null);
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

  const handleViewImage = async (imageId: string) => {
    setLoadingImage(true);
    try {
      const image = await yoloDatasetService.getImageById(imageId);
      setSelectedImage(image);
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                {/* Image Preview */}
                <div className="relative w-full bg-muted rounded-lg overflow-hidden">
                  {selectedImage.imageUrl ? (
                    <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
                      <Image
                        src={selectedImage.imageUrl}
                        alt={selectedImage.filename}
                        fill
                        className="object-contain"
                      />
                    </div>
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
