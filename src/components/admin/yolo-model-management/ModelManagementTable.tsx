'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { VisibilityState } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { createModelColumns, type YoloModelColumnActions } from './modelColumns';
import { yoloModelService } from '@/services/yolo-model.service';
import { useServerTable } from '@/hooks/useServerTable';
import { useAuth } from '@/hooks/useAuth';
import { getServerErrorMessage } from '@/lib/errorHandler';
import { PERMISSIONS } from '@/constants/permissions';
import type { YoloModelListItem, YoloModelListParams } from '@/types/yolo-model';
import { Search, RefreshCw } from 'lucide-react';

export type ModelManagementTableProps = {
  initialParams?: YoloModelListParams;
};

export function ModelManagementTable({ initialParams }: ModelManagementTableProps) {
  const router = useRouter();
  const { hasPermission } = useAuth();
  const [tempSearchQuery, setTempSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<number | null>(null);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // Use custom hook for table state and data fetching
  const {
    data: models,
    loading,
    error,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    pagination,
    handlePaginationChange,
    handleSearch,
    refresh,
    reset,
  } = useServerTable<YoloModelListItem, YoloModelListParams>({
    fetchData: yoloModelService.getModels,
    initialParams: {
      page: 1,
      limit: 10,
      ...initialParams,
    },
    onError: (err) => {
      console.error('Failed to fetch models:', err);
    },
  });

  /**
   * Handle view detail
   */
  const handleViewClick = (modelId: number) => {
    router.push(`/admin/yolo-models/${modelId}`);
  };

  /**
   * Handle activate model
   */
  const handleActivateClick = async (modelId: number) => {
    setActionLoading(true);
    try {
      // Check if it's the default model (id = 0)
      if (modelId === 0) {
        await yoloModelService.useDefaultModel();
        toast.success('Sử dụng model mặc định thành công');
      } else {
        await yoloModelService.activateModel(modelId);
        toast.success('Kích hoạt model thành công');
      }
      await refresh();
    } catch (err) {
      const message = getServerErrorMessage(err) || 'Không thể kích hoạt model';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Handle deactivate model (clear isActive from current active model)
   */
  const handleDeactivateClick = async (modelId: number) => {
    setActionLoading(true);
    try {
      await yoloModelService.useDefaultModel();
      toast.success('Chuyển sang model mặc định thành công');
      await refresh();
    } catch (err) {
      const message = getServerErrorMessage(err) || 'Không thể hủy kích hoạt model';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Handle delete with confirmation dialog
   */
  const handleDeleteClick = (modelId: number) => {
    setModelToDelete(modelId);
    setDeleteDialogOpen(true);
  };

  /**
   * Confirm and execute delete
   */
  const confirmDelete = async () => {
    if (modelToDelete === null) return;

    setActionLoading(true);
    try {
      await yoloModelService.deleteModel(modelToDelete);
      toast.success('Xóa model thành công');
      setDeleteDialogOpen(false);
      setModelToDelete(null);
      await refresh();
    } catch (err) {
      const message = getServerErrorMessage(err) || 'Không thể xóa model';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Handle search button click
   */
  const handleSearchClick = () => {
    handleSearch(tempSearchQuery);
  };

  /**
   * Handle search on Enter key
   */
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  const columnActions: YoloModelColumnActions = {
    onView: handleViewClick,
    onDelete: hasPermission(PERMISSIONS.YOLO.DELETE_MODEL.key) ? handleDeleteClick : undefined,
    onActivate: hasPermission(PERMISSIONS.YOLO.ACTIVATE_MODEL.key) ? handleActivateClick : undefined,
    onDeactivate: hasPermission(PERMISSIONS.YOLO.ACTIVATE_MODEL.key) ? handleDeactivateClick : undefined,
  };

  const columns = createModelColumns(columnActions);

  if (loading && models.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          <p className="text-gray-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <Button onClick={() => { reset(); refresh(); }} variant="outline">
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo tên model..."
            value={tempSearchQuery}
            onChange={(e) => setTempSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="pl-10"
            disabled={loading}
          />
        </div>
        <Button onClick={handleSearchClick} disabled={loading}>
          <Search className="h-4 w-4 mr-2" />
          Tìm kiếm
        </Button>
      </div>

      {/* Info bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Tổng: <span className="font-medium">{pagination.total}</span> model
        </p>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={models}
        sorting={sorting}
        onSortingChange={setSorting}
        columnFilters={columnFilters}
        onColumnFiltersChange={setColumnFilters}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        manualSorting={true}
        manualFiltering={true}
        manualPagination={true}
        pageCount={pagination.totalPages}
        pageIndex={pagination.page - 1}
        pageSize={pagination.limit}
        onPaginationChange={handlePaginationChange}
      />

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa Model YOLO</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa model này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={actionLoading}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={actionLoading}
            >
              {actionLoading ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ModelManagementTable;
