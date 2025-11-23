'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { DatasetImagesTable } from '@/components/admin/yolo-dataset-management';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';
import { yoloDatasetService } from '@/services/yolo-dataset.service';
import { getServerErrorMessage } from '@/lib/errorHandler';
import { ArrowLeft, Loader } from 'lucide-react';
import { toast } from 'sonner';

export default function DatasetImagesPage({
  params,
}: {
  params: Promise<{ datasetId: string }>;
}) {
  const router = useRouter();
  const [datasetId, setDatasetId] = useState<string | null>(null);
  const [datasetName, setDatasetName] = useState<string>('');
  const [isLoadingDataset, setIsLoadingDataset] = useState(true);

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
                onViewImage={(imageId) => {
                  // TODO: Navigate to image detail view
                  console.log('View image:', imageId);
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
