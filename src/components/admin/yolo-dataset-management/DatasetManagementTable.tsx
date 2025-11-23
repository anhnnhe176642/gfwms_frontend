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
import { createDatasetColumns } from './datasetColumns';
import { ImportDatasetZipDialog } from './ImportDatasetZipDialog';
import { yoloDatasetService } from '@/services/yolo-dataset.service';
import { useServerTable } from '@/hooks/useServerTable';
import { useRouteAccess } from '@/hooks/useRouteAccess';
import { useAuth } from '@/hooks/useAuth';
import { getServerErrorMessage } from '@/lib/errorHandler';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/config/routes';
import type { DatasetListItem, DatasetListParams } from '@/types/yolo-dataset';
import { Search, RefreshCw, Upload } from 'lucide-react';

export type DatasetManagementTableProps = {
  initialParams?: DatasetListParams;
};

export function DatasetManagementTable({ initialParams }: DatasetManagementTableProps) {
  const router = useRouter();
  const { canAccess } = useRouteAccess();
  const { hasPermission } = useAuth();
  const [tempSearchQuery, setTempSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [datasetToDelete, setDatasetToDelete] = useState<string | number | null>(null);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // Use custom hook for table state and data fetching
  const {
    data: datasets,
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
    reset
  } = useServerTable<DatasetListItem, DatasetListParams>({
    fetchData: yoloDatasetService.getDatasets,
    initialParams,
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
        name: 'name',
        createdAt: 'createdAt',
        totalImages: 'totalImages',
        totalLabels: 'totalLabels',
        status: 'status',
      },
    },
    onError: (err) => {
      console.error('Failed to fetch datasets:', err);
    },
  });

  /**
   * Handle view detail
   */
  const handleViewClick = (datasetId: string | number) => {
    router.push(`/admin/yolo-datasets/${datasetId}`);
  };

  /**
   * Handle view images
   */
  const handleViewImagesClick = (datasetId: string | number) => {
    router.push(`/admin/yolo-datasets/${datasetId}/images`);
  };

  /**
   * Handle edit
   */
  const handleEditClick = (datasetId: string | number) => {
    router.push(`/admin/yolo-datasets/${datasetId}/edit`);
  };

  /**
   * Handle delete with confirmation dialog
   */
  const handleDeleteClick = (datasetId: string | number) => {
    setDatasetToDelete(datasetId);
    setDeleteDialogOpen(true);
  };

  /**
   * Confirm and execute delete
   */
  const confirmDelete = async () => {
    if (datasetToDelete === null) return;

    setActionLoading(true);
    try {
      await yoloDatasetService.deleteDataset(datasetToDelete);
      toast.success('Xóa dataset thành công');
      setDeleteDialogOpen(false);
      setDatasetToDelete(null);
      await refresh();
    } catch (err) {
      const message = getServerErrorMessage(err) || 'Không thể xóa dataset';
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

  const columns = createDatasetColumns({
    onDelete: hasPermission(PERMISSIONS.YOLO.MANAGE_DATASET.key) ? handleDeleteClick : undefined,
    onEdit: hasPermission(PERMISSIONS.YOLO.MANAGE_DATASET.key) ? handleEditClick : undefined,
    onView: hasPermission(PERMISSIONS.YOLO.VIEW_DATASET.key) ? handleViewClick : undefined,
    onViewImages: hasPermission(PERMISSIONS.YOLO.VIEW_DATASET.key) ? handleViewImagesClick : undefined,
  });

  if (loading && datasets.length === 0) {
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
          <Button onClick={() => {reset(); refresh();}} variant="outline">
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Import bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo tên dataset..."
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
        {hasPermission(PERMISSIONS.YOLO.MANAGE_DATASET.key) && (
          <Button
            onClick={() => setImportDialogOpen(true)}
            disabled={loading}
            variant="outline"
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Import ZIP
          </Button>
        )}
      </div>

      {/* Info bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Tổng: <span className="font-medium">{pagination.total}</span> dataset
        </p>
      </div>

      {/* DataTable */}
      <DataTable 
        columns={columns} 
        data={datasets}
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
            <DialogTitle>Xóa dataset</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa dataset này? Hành động này không thể hoàn tác.
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

      {/* Import Dataset ZIP Dialog */}
      <ImportDatasetZipDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onSuccess={async () => {
          await refresh();
        }}
      />
    </div>
  );
}

export default DatasetManagementTable;
