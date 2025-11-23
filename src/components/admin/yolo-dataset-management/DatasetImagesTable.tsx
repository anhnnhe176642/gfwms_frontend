'use client';

import { useState, useMemo } from 'react';
import { VisibilityState } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { createDatasetImageColumns } from './datasetImageColumns';
import { UploadImageForm } from './UploadImageForm';
import { EditImageStatusDialog } from './EditImageStatusDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { yoloDatasetService } from '@/services/yolo-dataset.service';
import { useServerTable } from '@/hooks/useServerTable';
import { getServerErrorMessage } from '@/lib/errorHandler';
import type { DatasetImage, DatasetImageListParams } from '@/types/yolo-dataset';
import { Search, RefreshCw, Plus } from 'lucide-react';
import { toast } from 'sonner';

export type DatasetImagesTableProps = {
  datasetId: string | number;
  onViewImage?: (imageId: string) => void;
};

export function DatasetImagesTable({ datasetId, onViewImage }: DatasetImagesTableProps) {
  const [tempSearchQuery, setTempSearchQuery] = useState('');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editStatusDialogOpen, setEditStatusDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Use custom hook for table state and data fetching
  const {
    data: images,
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
  } = useServerTable<DatasetImage, DatasetImageListParams>({
    fetchData: (params) => yoloDatasetService.getDatasetImages(datasetId, params),
    filterConfig: {
      arrayFilters: {
        status: 'status',
      },
      dateRangeFilters: {
        createdAt: {
          from: 'createdFrom',
          to: 'createdTo',
        },
      },
      sortingFieldMap: {
        filename: 'filename',
        status: 'status',
        objectCount: 'objectCount',
        'uploadedByUser.fullname': 'uploadedByUser.fullname',
        uploadedByUser_fullname: 'uploadedByUser.fullname', // TanStack converts . to _
        createdAt: 'createdAt',
      },
    },
    onError: (err) => {
      console.error('Failed to fetch dataset images:', err);
    },
  });

  /**
   * Handle confirm delete image
   */
  const handleConfirmDelete = async () => {
    if (!selectedImageId) return;

    setActionLoading(true);
    try {
      await yoloDatasetService.deleteImage(selectedImageId);
      toast.success('Xóa ảnh thành công');
      setDeleteDialogOpen(false);
      setSelectedImageId(null);
      await refresh();
    } catch (err) {
      const message = getServerErrorMessage(err) || 'Không thể xóa ảnh';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const columns = useMemo(
    () =>
      createDatasetImageColumns({
        onView: (imageId) => {
          onViewImage?.(imageId);
        },
        onLabel: (imageId) => {
          setSelectedImageId(imageId);
          // TODO: Implement label functionality
          toast.info('Chức năng gán nhãn sẽ được phát triển');
        },
        onUpdateStatus: (imageId) => {
          setSelectedImageId(imageId);
          setEditStatusDialogOpen(true);
        },
        onDelete: (imageId) => {
          setSelectedImageId(imageId);
          setDeleteDialogOpen(true);
        },
      }),
    [onViewImage]
  );

  const handleSearch_click = () => {
    handleSearch(tempSearchQuery);
  };

  const handleSearch_enter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(tempSearchQuery);
    }
  };

  const handleRefresh = async () => {
    try {
      await refresh();
      toast.success('Dữ liệu đã được làm mới');
    } catch (err) {
      const message = getServerErrorMessage(err) || 'Không thể làm mới dữ liệu';
      toast.error(message);
    }
  };

  const handleUploadSuccess = async () => {
    await refresh();
  };

  return (
    <div className="space-y-4">
      {/* Search and Action Bar */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên file..."
            className="pl-8"
            value={tempSearchQuery}
            onChange={(e) => setTempSearchQuery(e.target.value)}
            onKeyDown={handleSearch_enter}
          />
        </div>
        <Button onClick={handleSearch_click} variant="outline">
          Tìm kiếm
        </Button>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="icon"
          disabled={loading}
          title="Làm mới"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
        <Button 
          onClick={() => setUploadDialogOpen(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Tải ảnh lên
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={images}
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

      {/* Upload Image Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tải ảnh lên</DialogTitle>
            <DialogDescription>
              Tải ảnh lên dataset để bắt đầu gán nhãn
            </DialogDescription>
          </DialogHeader>
          <UploadImageForm
            datasetId={datasetId}
            onSuccess={handleUploadSuccess}
            onClose={() => setUploadDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Image Status Dialog */}
      {selectedImageId && (
        <EditImageStatusDialog
          open={editStatusDialogOpen}
          onOpenChange={setEditStatusDialogOpen}
          imageId={selectedImageId}
          onSuccess={() => refresh()}
        />
      )}

      {/* Delete Image Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa ảnh</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa ảnh này? Hành động này không thể hoàn tác.
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
              onClick={handleConfirmDelete}
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
