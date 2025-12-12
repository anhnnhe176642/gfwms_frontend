'use client';

import { useState } from 'react';
import { VisibilityState } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { createAdjustFabricHistoryColumns } from './adjustFabricHistoryColumns';
import { warehouseService } from '@/services/warehouse.service';
import { useServerTable } from '@/hooks/useServerTable';
import type { AdjustFabricHistoryItem, AdjustFabricHistoryParams } from '@/types/warehouse';
import { Search, RefreshCw } from 'lucide-react';

export type AdjustFabricHistoryTableProps = {
  initialParams?: AdjustFabricHistoryParams;
};

export function AdjustFabricHistoryTable({ initialParams }: AdjustFabricHistoryTableProps) {
  const [tempSearchQuery, setTempSearchQuery] = useState('');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    id: false,
    colorId: false,
    supplierId: false,
    createdAt: false,
  });

  // Use custom hook for table state and data fetching
  const {
    data: history,
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
  } = useServerTable<AdjustFabricHistoryItem, AdjustFabricHistoryParams>({
    fetchData: warehouseService.getAdjustFabricHistory,
    initialParams,
    filterConfig: {
      arrayFilters: {
        type: 'type',
        categoryId: 'categoryId',
        colorId: 'colorId',
        supplierId: 'supplierId',
        userId: 'userId',
        warehouseId: 'warehouseId',
      },
      dateRangeFilters: {
        createdAt: {
          from: 'createdFrom',
          to: 'createdTo',
        },
      },
      sortingFieldMap: {
        categoryId: 'fabric.category.name',
        colorId: 'fabric.color.name',
        supplierId: 'fabric.supplier.name',
        userId: 'user.fullname',
        shelfCode: 'shelf.code',
        warehouseId: 'shelf.warehouse.name',
      },
    },
    onError: (err) => {
      console.error('Failed to fetch adjust fabric history:', err);
    },
  });

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

  const columns = createAdjustFabricHistoryColumns();

  if (loading && history.length === 0) {
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
            placeholder="Tìm kiếm..."
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
          Tổng: <span className="font-medium">{pagination.total}</span> bản ghi
        </p>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={history}
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

export default AdjustFabricHistoryTable;
