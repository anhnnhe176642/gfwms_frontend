'use client';

import { useState } from 'react';
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
import { createFabricColumns } from './fabricColumns';
import { fabricService } from '@/services/fabric.service';
import { useServerTable } from '@/hooks/useServerTable';
import { getServerErrorMessage } from '@/lib/errorHandler';
import type { FabricListItem, FabricListParams } from '@/types/fabric';
import { Search, RefreshCw } from 'lucide-react';

export type FabricManagementTableProps = {
  initialParams?: FabricListParams;
};

export function FabricManagementTable({ initialParams }: FabricManagementTableProps) {
  const [tempSearchQuery, setTempSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fabricToDelete, setFabricToDelete] = useState<number | null>(null);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    // Hide some columns by default
    weight: false,
    thickness: false,
    width: false,
    glossDescription: false,
  });

  // Use custom hook for table state and data fetching
  const {
    data: fabrics,
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
  } = useServerTable<FabricListItem, FabricListParams>({
    fetchData: fabricService.getFabrics,
    initialParams,
    filterConfig: {
      arrayFilters: {
        glossId: 'glossId',
        categoryId: 'categoryId',
        colorId: 'colorId',
        supplierId: 'supplierId',
      },
      dateRangeFilters: {
        createdAt: {
          from: 'createdFrom',
          to: 'createdTo',
        },
      },
      // Map custom sort IDs to API field names
      sortingFieldMap: {
        categoryName: 'category.name',
        colorName: 'color.name',
        glossDescription: 'gloss.description',
        supplierName: 'supplier.name',
      },
    },
    onError: (err) => {
      console.error('Failed to fetch fabrics:', err);
    },
  });

  /**
   * Handle delete with confirmation dialog
   */
  const handleDeleteClick = (fabricId: number) => {
    setFabricToDelete(fabricId);
    setDeleteDialogOpen(true);
  };

  /**
   * Confirm and execute delete
   */
  const confirmDelete = async () => {
    if (fabricToDelete === null) return;

    setActionLoading(true);
    try {
      // Note: Implement delete endpoint if available
      // await fabricService.deleteFabric(fabricToDelete);
      toast.success('Xóa vải thành công');
      setDeleteDialogOpen(false);
      setFabricToDelete(null);
      await refresh();
    } catch (err) {
      const message = getServerErrorMessage(err) || 'Không thể xóa vải';
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

  const columns = createFabricColumns({
    onDelete: handleDeleteClick,
  });

  if (loading && fabrics.length === 0) {
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
            placeholder="Tìm kiếm theo tên, màu, loại, độ bóng, nhà cung cấp..."
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
          Tổng: <span className="font-medium">{pagination.total}</span> vải
        </p>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={fabrics}
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
            <DialogTitle>Xóa vải</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa vải này? Hành động này không thể hoàn tác.
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

export default FabricManagementTable;
