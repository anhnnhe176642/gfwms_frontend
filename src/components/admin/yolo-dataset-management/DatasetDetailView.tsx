'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { yoloDatasetService } from '@/services/yolo-dataset.service';
import { getServerErrorMessage } from '@/lib/errorHandler';
import { ArrowLeft, RefreshCw, Edit, Loader, Copy, Download, Upload } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';
import { ImportDatasetToExistingDialog } from './ImportDatasetToExistingDialog';
import type { DatasetDetail, DatasetStatus } from '@/types/yolo-dataset';

const DATASET_STATUS_COLORS: Record<DatasetStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  ARCHIVED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
};

const DATASET_STATUS_LABELS: Record<DatasetStatus, string> = {
  ACTIVE: 'Hoạt động',
  ARCHIVED: 'Lưu trữ',
};

export interface DatasetDetailViewProps {
  datasetId: string | number;
  onEdit?: (datasetId: string | number) => void;
}

export function DatasetDetailView({ datasetId, onEdit }: DatasetDetailViewProps) {
  const router = useRouter();
  const { handleGoBack } = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [dataset, setDataset] = useState<DatasetDetail | null>(null);
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  // Fetch dataset data
  useEffect(() => {
    const fetchDataset = async () => {
      try {
        setIsLoading(true);
        setError('');
        const data = await yoloDatasetService.getDatasetById(datasetId);
        setDataset(data);
      } catch (err) {
        const message = getServerErrorMessage(err) || 'Không thể tải dữ liệu dataset';
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDataset();
  }, [datasetId]);

  const handleEdit = () => {
    if (onEdit && dataset) {
      onEdit(dataset.id);
    } else if (dataset) {
      router.push(`/admin/yolo-datasets/${dataset.id}/edit`);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      const data = await yoloDatasetService.getDatasetById(datasetId);
      setDataset(data);
      toast.success('Dữ liệu đã được làm mới');
    } catch (err) {
      const message = getServerErrorMessage(err) || 'Không thể làm mới dữ liệu';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyId = async () => {
    if (dataset?.id) {
      await navigator.clipboard.writeText(dataset.id.toString());
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleExport = async () => {
    if (!dataset?.id) return;

    setIsExporting(true);
    try {
      const blob = await yoloDatasetService.exportDataset(dataset.id);
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${dataset.name || 'dataset'}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Xuất dataset thành công');
    } catch (err) {
      const message = getServerErrorMessage(err) || 'Không thể xuất dataset';
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-2">
          <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error || !dataset) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleGoBack}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Chi tiết Dataset</h1>
          </div>
        </div>

        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-destructive">{error || 'Không tìm thấy dataset'}</p>
              <Button onClick={handleGoBack} variant="outline">
                Quay lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusColor = DATASET_STATUS_COLORS[dataset.status];
  const statusLabel = DATASET_STATUS_LABELS[dataset.status];
  const progress = dataset.totalImages && dataset.totalImages > 0 
    ? Math.round((dataset.totalLabels || 0) / dataset.totalImages * 100)
    : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleGoBack}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{dataset.name}</h1>
            <p className="text-sm text-muted-foreground">Xem thông tin chi tiết dataset</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-9 w-9"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={handleExport} disabled={isExporting} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            {isExporting ? 'Đang xuất...' : 'Xuất ZIP'}
          </Button>
          <Button onClick={() => setImportDialogOpen(true)} variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Nhập ảnh
          </Button>
          <Button onClick={handleEdit} className="gap-2">
            <Edit className="h-4 w-4" />
            Chỉnh sửa
          </Button>
        </div>
      </div>

      {/* Main Information */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin chung</CardTitle>
          <CardDescription>Thông tin cơ bản về dataset</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* ID and Status Row */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">ID Dataset</label>
              <div className="flex items-center gap-2 mt-2">
                <code className="flex-1 px-3 py-2 bg-muted rounded text-sm">{dataset.id}</code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyId}
                  className="h-9 w-9"
                  title={isCopied ? 'Đã sao chép!' : 'Sao chép ID'}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Trạng thái</label>
              <div className="mt-2">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
                  {statusLabel}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          {dataset.description && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Mô tả</label>
              <p className="mt-2 text-sm leading-relaxed">{dataset.description}</p>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Ngày tạo</label>
              <p className="mt-2 text-sm">
                {new Date(dataset.createdAt).toLocaleString('vi-VN')}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Cập nhật lần cuối</label>
              <p className="mt-2 text-sm">
                {new Date(dataset.updatedAt).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Thống kê</CardTitle>
          <CardDescription>Thông tin về hình ảnh và nhãn</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Tổng số ảnh</label>
              <p className="text-2xl font-bold">{dataset.totalImages || 0}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Ảnh được gán nhãn</label>
              <p className="text-2xl font-bold">{dataset.totalLabels || 0}</p>
            </div>
          </div>

          <Separator />

          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-muted-foreground">Tiến độ gán nhãn</label>
              <span className="text-sm font-medium">{progress}%</span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Classes */}
      {dataset.classes && dataset.classes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Các lớp đối tượng</CardTitle>
            <CardDescription>Danh sách các lớp được sử dụng trong dataset này</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {dataset.classes.map((cls, index) => (
                <span 
                  key={index} 
                  className="inline-block px-3 py-1 bg-muted rounded-full text-sm font-medium"
                >
                  {cls}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Dialog */}
      <ImportDatasetToExistingDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        datasetId={dataset.id}
        datasetName={dataset.name}
        onSuccess={async () => {
          await handleRefresh();
        }}
      />
    </div>
  );
}
