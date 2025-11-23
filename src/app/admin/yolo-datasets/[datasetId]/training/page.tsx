'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';
import { yoloDatasetService } from '@/services/yolo-dataset.service';
import { getServerErrorMessage } from '@/lib/errorHandler';
import { ArrowLeft, Loader, Copy, ExternalLink, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const COLAB_NOTEBOOK_URL = 'https://colab.research.google.com/github/anhnnhe176642/GFWMS_backend/blob/AnhNN/Train_YOLO_Models.ipynb';

export default function TrainingPage({
  params,
}: {
  params: Promise<{ datasetId: string }>;
}) {
  const router = useRouter();
  const [datasetId, setDatasetId] = useState<string | null>(null);
  const [datasetName, setDatasetName] = useState<string>('');
  const [isLoadingDataset, setIsLoadingDataset] = useState(true);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState<string>('');
  const [copied, setCopied] = useState(false);

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

  const handleGenerateToken = async () => {
    if (!datasetId) return;

    setIsGeneratingToken(true);
    try {
      const result = await yoloDatasetService.createExportToken(datasetId);
      setToken(result.token);
      setExpiresIn(result.expiresIn);
      toast.success('Token được tạo thành công');
    } catch (err) {
      const message = getServerErrorMessage(err) || 'Không thể tạo token';
      toast.error(message);
    } finally {
      setIsGeneratingToken(false);
    }
  };

  const handleCopyLink = async () => {
    if (!token) return;

    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000/api';
    const downloadLink = `${apiBase}/v1/yolo/download/${token}`;

    try {
      await navigator.clipboard.writeText(downloadLink);
      setCopied(true);
      toast.success('Đã sao chép đường dẫn');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Không thể sao chép đường dẫn');
    }
  };

  const handleOpenColab = () => {
    window.open(COLAB_NOTEBOOK_URL, '_blank');
  };

  const handleOpenModels = () => {
    router.push('/admin/yolo-models');
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
              <h1 className="text-2xl font-bold">Đào tạo mô hình</h1>
              <p className="text-sm text-muted-foreground">
                {datasetName || 'Dataset'}
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Export Token Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Bước 1: Tạo Token</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Tạo token để tải xuống dataset (hiệu lực 1 giờ)
                </p>
                <Button
                  onClick={handleGenerateToken}
                  disabled={isGeneratingToken}
                  className="w-full"
                  size="sm"
                >
                  {isGeneratingToken ? (
                    <>
                      <Loader className="h-3 w-3 mr-2 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    'Tạo Token'
                  )}
                </Button>

                {token && (
                  <div className="space-y-2 mt-3 p-3 bg-muted rounded-lg border">
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                      <span className="font-medium">Tạo thành công</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000/api'}/v1/yolo/download/${token}`}
                        readOnly
                        className="flex-1 px-2 py-1 text-xs bg-background border rounded font-mono truncate"
                      />
                      <Button
                        size="sm"
                        onClick={handleCopyLink}
                        variant={copied ? 'default' : 'outline'}
                        className="h-7"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Colab Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Bước 2: Huấn Luyện</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Mở Colab notebook để huấn luyện mô hình YOLO
                </p>
                <Button
                  onClick={handleOpenColab}
                  size="sm"
                  className="w-full gap-2"
                >
                  <ExternalLink className="h-3 w-3" />
                  Mở Colab
                </Button>
              </CardContent>
            </Card>

            {/* Model Management Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Bước 3: Quản Lý</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Xem thống kê và quản lý mô hình đã huấn luyện
                </p>
                <Button
                  onClick={handleOpenModels}
                  size="sm"
                  className="w-full gap-2"
                >
                  <ExternalLink className="h-3 w-3" />
                  Mở Model
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Instructions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Hướng dẫn sử dụng trong Colab</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ol className="space-y-3 text-sm">
                  <li className="flex gap-3">
                    <span className="font-semibold text-primary min-w-6">1.</span>
                    <span>Nhấn nút "Tạo Token" để tạo token xuất dataset (hiệu lực 1 giờ)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold text-primary min-w-6">2.</span>
                    <span>Nhấn nút "Sao chép" để sao chép đường dẫn tải xuống</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold text-primary min-w-6">3.</span>
                    <span>Nhấn nút "Mở Colab Notebook" để mở notebook huấn luyện</span>
                  </li>
                </ol>

                <div className="border-t pt-4">
                  <h3 className="font-semibold text-sm mb-3">Trong Colab:</h3>
                  <ol className="space-y-3 text-sm">
                    <li className="flex gap-3">
                      <span className="font-semibold text-primary min-w-6">1.</span>
                      <span>
                        <strong>Thời gian chạy (Runtime)</strong> → <strong>Thay đổi loại thời gian chạy (Change runtime type)</strong> → chọn <strong>GPU T4</strong> → <strong>Lưu</strong>
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-primary min-w-6">2.</span>
                      <span>Chạy ô code (▶︎) bên dưới</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-primary min-w-6">3.</span>
                      <span>Dán đường dẫn vào thẻ <strong>URL</strong> → ấn <strong>"Bắt đầu huấn luyện"</strong></span>
                    </li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
