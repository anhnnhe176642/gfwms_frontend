'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { yoloModelService } from '@/services/yolo-model.service';
import { getServerErrorMessage, extractFieldErrors } from '@/lib/errorHandler';
import { ArrowLeft, Loader, Edit, Trash2, Check, TrendingUp } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';
import { DetectionLogsTable } from './DetectionLogsTable';
import type { YoloModel, YoloModelStatus, YoloModelStatistics, YoloDetectionLog } from '@/types/yolo-model';

export interface ModelDetailViewProps {
  modelId: string | number;
}

const STATUS_CONFIG: Record<YoloModelStatus, { label: string; className: string }> = {
  ACTIVE: {
    label: 'Hoạt động',
    className: 'bg-green-100 text-green-800',
  },
  TESTING: {
    label: 'Đang kiểm tra',
    className: 'bg-blue-100 text-blue-800',
  },
  DEPRECATED: {
    label: 'Không dùng',
    className: 'bg-red-100 text-red-800',
  },
};

export function ModelDetailView({ modelId }: ModelDetailViewProps) {
  const router = useRouter();
  const { handleGoBack } = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [model, setModel] = useState<YoloModel | null>(null);
  const [stats, setStats] = useState<YoloModelStatistics | null>(null);
  const [logs, setLogs] = useState<YoloDetectionLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const [logsPagination, setLogsPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });

  const [editForm, setEditForm] = useState({
    description: '',
    version: '',
    status: 'ACTIVE' as YoloModelStatus,
  });

  // Fetch model data
  useEffect(() => {
    const fetchModel = async () => {
      try {
        setIsLoading(true);
        setError('');
        const response = await yoloModelService.getModelById(parseInt(modelId as string));
        setModel(response.data);
        setEditForm({
          description: response.data.description || '',
          version: response.data.version || '',
          status: response.data.status || 'ACTIVE',
        });
      } catch (err) {
        const message = getServerErrorMessage(err) || 'Không thể tải dữ liệu model';
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModel();
  }, [modelId]);

  // Fetch stats
  useEffect(() => {
    if (!model) return;

    const fetchStats = async () => {
      try {
        const response = await yoloModelService.getModelStats(model.id);
        setStats(response.data.statistics);
        if (response.data.recentLogs) {
          setLogs(response.data.recentLogs);
        }
      } catch (err) {
        console.error('Failed to fetch model stats:', err);
      }
    };

    fetchStats();
  }, [model]);

  // Fetch detection logs
  const fetchLogs = async (page: number = 1) => {
    if (!model) return;

    setLogsLoading(true);
    try {
      const response = await yoloModelService.getDetectionLogs(model.id, {
        page,
        limit: logsPagination.limit,
      });
      setLogs(response.data);
      setLogsPagination({
        page: response.pagination.page,
        limit: response.pagination.limit,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages,
        hasNext: response.pagination.hasNext,
        hasPrev: response.pagination.hasPrev,
      });
    } catch (err) {
      console.error('Failed to fetch detection logs:', err);
      toast.error('Không thể tải lịch sử phát hiện');
    } finally {
      setLogsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditOpen(true);
  };

  const handleSaveChanges = async () => {
    if (!model) return;

    setIsSaving(true);
    try {
      const response = await yoloModelService.updateModel(model.id, editForm);
      setModel(response.data);
      setIsEditOpen(false);
      toast.success('Cập nhật model thành công');
    } catch (err) {
      const fieldErrors = extractFieldErrors(err);
      if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([field, message]) => {
          toast.error(`${field}: ${message}`);
        });
      } else {
        const message = getServerErrorMessage(err) || 'Không thể cập nhật model';
        toast.error(message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleActivate = async () => {
    if (!model) return;

    setIsActivating(true);
    try {
      await yoloModelService.activateModel(model.id);
      toast.success('Kích hoạt model thành công');
      const response = await yoloModelService.getModelById(model.id);
      setModel(response.data);
    } catch (err) {
      const message = getServerErrorMessage(err) || 'Không thể kích hoạt model';
      toast.error(message);
    } finally {
      setIsActivating(false);
    }
  };

  const handleDelete = async () => {
    if (!model) return;

    setIsDeleting(true);
    try {
      await yoloModelService.deleteModel(model.id);
      toast.success('Xóa model thành công');
      router.push('/admin/yolo-models');
    } catch (err) {
      const message = getServerErrorMessage(err) || 'Không thể xóa model';
      toast.error(message);
    } finally {
      setIsDeleting(false);
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

  if (error || !model) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleGoBack} className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Chi tiết Model</h1>
          </div>
        </div>

        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
          {error || 'Không tìm thấy model'}
        </div>

        <Button onClick={handleGoBack} variant="outline">
          Quay lại
        </Button>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[model.status];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleGoBack} className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{model.name}</h1>
            <p className="text-muted-foreground mt-1">Chi tiết mô hình YOLO</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!model.isActive && (
            <Button onClick={handleActivate} disabled={isActivating} className="gap-2">
              {isActivating ? <Loader className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Kích hoạt
            </Button>
          )}
          <Button onClick={handleEdit} className="gap-2">
            <Edit className="h-4 w-4" />
            Chỉnh sửa
          </Button>
          <Button onClick={() => setIsDeleteOpen(true)} variant="destructive" className="gap-2">
            <Trash2 className="h-4 w-4" />
            Xóa
          </Button>
        </div>
      </div>

      {/* Main Information Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Thông tin cơ bản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">ID</p>
              <p className="text-sm font-semibold">{model.id}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Phiên bản</p>
              <p className="text-sm font-semibold">{model.version}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Trạng thái</p>
              <div className="mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.className}`}>
                  {statusConfig.label}
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">File</p>
              <p className="text-sm font-mono text-muted-foreground truncate">{model.fileName}</p>
            </div>
          </div>

          {model.description && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">Mô tả</p>
              <p className="text-sm line-clamp-2">{model.description}</p>
            </div>
          )}

          <div className="border-t pt-3 mt-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Lịch sử</p>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <p className="text-muted-foreground">Tạo</p>
                <p className="font-medium">{new Date(model.createdAt).toLocaleDateString('vi-VN')}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Cập nhật</p>
                <p className="font-medium">{new Date(model.updatedAt).toLocaleDateString('vi-VN')}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tải lên</p>
                <p className="font-medium">{new Date(model.metadata.uploadedAt).toLocaleDateString('vi-VN')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Card */}
      {stats && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              <div>
                <CardTitle>Thống kê Model</CardTitle>
                <CardDescription>Thông tin hiệu suất và phát hiện</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs font-medium text-blue-600 mb-1">Tổng số phát hiện</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalDetections}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-xs font-medium text-green-600 mb-1">Độ tin cậy trung bình</p>
                <p className="text-2xl font-bold text-green-900">
                  {(parseFloat(stats.averageConfidence) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-xs font-medium text-purple-600 mb-1">Tổng đối tượng phát hiện</p>
                <p className="text-2xl font-bold text-purple-900">{stats.totalObjectsDetected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detection Logs Table */}
      <DetectionLogsTable
        logs={logs}
        isLoading={logsLoading}
        pagination={logsPagination}
        onPageChange={(page) => fetchLogs(page)}
      />

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Model</DialogTitle>
            <DialogDescription>Cập nhật thông tin mô hình YOLO</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Phiên bản</label>
              <Input
                value={editForm.version}
                onChange={(e) => setEditForm({ ...editForm, version: e.target.value })}
                placeholder="e.g., 1.0.0"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Trạng thái</label>
              <Select value={editForm.status} onValueChange={(val) => setEditForm({ ...editForm, status: val as YoloModelStatus })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                  <SelectItem value="TESTING">Đang kiểm tra</SelectItem>
                  <SelectItem value="DEPRECATED">Không dùng</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Mô tả</label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Nhập mô tả model..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setIsEditOpen(false)} variant="outline">
              Hủy
            </Button>
            <Button onClick={handleSaveChanges} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                'Lưu'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa Model YOLO</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa model "{model.name}"? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button onClick={() => setIsDeleteOpen(false)} variant="outline">
              Hủy
            </Button>
            <Button onClick={handleDelete} disabled={isDeleting} variant="destructive">
              {isDeleting ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                'Xóa'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
