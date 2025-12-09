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
import { createStoreFabricColumns } from './storeFabricColumns';
import { createStoreFabricService } from '@/services/storeFabric.service';
import { useServerTable } from '@/hooks/useServerTable';
import type { StoreFabricListItem, StoreFabricListParams } from '@/types/storeFabric';
import { Search, RefreshCw } from 'lucide-react';

export type StoreFabricManagementTableProps = {
  storeId: number | string;
  initialParams?: StoreFabricListParams;
  onViewDetail?: (fabricId: number) => void;
};

export function StoreFabricManagementTable({ 
  storeId, 
  initialParams,
  onViewDetail 
}: StoreFabricManagementTableProps) {
  const [tempSearchQuery, setTempSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fabricToDelete, setFabricToDelete] = useState<number | null>(null);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    // Hide some columns by default
    'fabricInfo.supplier': false,
    'inventory.uncutRolls': false,
    'inventory.cuttingRollMeters': false,
  });

  const fabricService = createStoreFabricService(storeId);

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
  } = useServerTable<StoreFabricListItem, StoreFabricListParams>({
    fetchData: fabricService.list,
    initialParams,
    filterConfig: {
      sortingFieldMap: {
        'fabricInfo.category': 'category',
        'fabricInfo.color': 'color',
        'fabricInfo.gloss': 'gloss',
        'fabricInfo.supplier': 'supplier',
        'inventory.totalMeters': 'totalMeters',
        'fabricInfo.sellingPrice': 'sellingPrice',
        'inventory.totalValue': 'totalValue',
        'inventory.uncutRolls': 'uncutRolls',
        'inventory.cuttingRollMeters': 'cuttingRollMeters',
      },
    },
    onError: (err) => {
      console.error('Failed to fetch store fabrics:', err);
    },
  });

  /**
   * Handle search with Enter key or button click
   */
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  /**
   * Trigger search
   */
  const handleSearchClick = () => {
    handleSearch(tempSearchQuery);
  };

  /**
   * Handle view detail click
   */
  const handleViewClick = (fabricId: number) => {
    onViewDetail?.(fabricId);
  };

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
      toast.error('Chức năng xóa chưa được hỗ trợ');
    } catch (error) {
      toast.error('Không thể xóa vải');
      console.error('Failed to delete fabric:', error);
    } finally {
      setActionLoading(false);
      setDeleteDialogOpen(false);
      setFabricToDelete(null);
    }
  };

  const columns = createStoreFabricColumns({
    onView: handleViewClick,
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
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo tên vải..."
            value={tempSearchQuery}
            onChange={(e) => setTempSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="pl-10"
            disabled={loading}
          />
        </div>
        <Button onClick={handleSearchClick} disabled={loading}>
          Tìm kiếm
        </Button>
        <Button 
          onClick={refresh} 
          variant="outline" 
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Làm mới
        </Button>
      </div>

      {/* Info bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Tổng: <span className="font-medium">{pagination.total}</span> loại vải
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
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa vải này khỏi cửa hàng? Hành động này không thể hoàn tác.
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

export default StoreFabricManagementTable;
