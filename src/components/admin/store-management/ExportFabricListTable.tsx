'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VisibilityState } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { createExportFabricColumns } from './exportFabricColumns';
import { exportFabricService } from '@/services/exportFabric.service';
import { useServerTable } from '@/hooks/useServerTable';
import { useRouteAccess } from '@/hooks/useRouteAccess';
import { useAuth } from '@/hooks/useAuth';
import type { ExportFabricListItem, ExportFabricListParams } from '@/types/exportFabric';
import { Search, RefreshCw } from 'lucide-react';

export type ExportFabricListTableProps = {
  initialParams?: ExportFabricListParams;
  hideWarehouseColumn?: boolean;
  hideStoreColumn?: boolean;
  warehouseId?: string | number;
  storeId?: string | number;
};

export function ExportFabricListTable({ initialParams, hideWarehouseColumn, hideStoreColumn, warehouseId, storeId }: ExportFabricListTableProps) {
  const router = useRouter();
  const { canAccess } = useRouteAccess();
  const { hasPermission } = useAuth();
  const [tempSearchQuery, setTempSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // Use custom hook for table state and data fetching
  const {
    data: exportFabrics,
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
  } = useServerTable<ExportFabricListItem, ExportFabricListParams>({
    fetchData: exportFabricService.list,
    initialParams: initialParams || { page: 1, limit: 10 },
    filterConfig: {
      arrayFilters: {
        status: 'status',
        warehouse: 'warehouseId',
        store: 'storeId',
      },
      sortingFieldMap: {
        id: 'id',
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
        status: 'status',
        warehouse: 'warehouse.name',
        warehouseId: 'warehouse.name',
        store: 'store.name',
        storeId: 'store.name',
      },
      customTransform: (filter) => {
        const result: Record<string, string> = {};
        // Handle warehouse filter - extract ID from nested object
        if (filter.id === 'warehouse' && filter.value && filter.value.length > 0) {
          result['warehouseId'] = filter.value.join(',');
          return result;
        }
        // Handle store filter - extract ID from nested object
        if (filter.id === 'store' && filter.value && filter.value.length > 0) {
          result['storeId'] = filter.value.join(',');
          return result;
        }
        // Handle status filter
        if (filter.id === 'status' && filter.value && filter.value.length > 0) {
          result['status'] = filter.value.join(',');
          return result;
        }
        return result;
      },
    },
    onError: (err) => {
      console.error('Failed to fetch export fabrics:', err);
    },
  });

  /**
   * Handle view detail
   */
  const handleViewClick = (exportFabricId: number) => {
    // If warehouseId is provided, navigate to warehouse-specific detail page
    if (warehouseId) {
      router.push(`/admin/warehouses/${warehouseId}/export-fabrics/${exportFabricId}`);
    } else {
      // Otherwise navigate to global export fabric detail page
      router.push(`/admin/export-fabrics/${exportFabricId}`);
    }
  };

  /**
   * Handle search
   */
  const handleSearchSubmit = () => {
    handleSearch(tempSearchQuery);
    setTempSearchQuery('');
  };

  /**
   * Reset filters and search
   */
  const handleResetFilters = () => {
    reset();
    setTempSearchQuery('');
  };

  /**
   * Create columns with action handlers
   */
  const columns = createExportFabricColumns({
    onView: handleViewClick,
    hideWarehouseColumn,
    hideStoreColumn,
  });

  // Show loading state
  if (loading && exportFabrics.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          <p className="text-gray-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Show error state
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
      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-1 gap-2">
          <Input
            placeholder="Tìm kiếm theo tên kho, cửa hàng, hoặc người tạo..."
            value={tempSearchQuery}
            onChange={(e) => setTempSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearchSubmit();
              }
            }}
            className="flex-1"
            disabled={loading}
          />
          <Button
            onClick={handleSearchSubmit}
            disabled={loading}
            variant="outline"
            className="gap-2"
          >
            <Search className="h-4 w-4" />
            Tìm
          </Button>
        </div>
        <Button
          onClick={handleResetFilters}
          disabled={loading}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Làm mới
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={exportFabrics}
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
    </div>
  );
}
