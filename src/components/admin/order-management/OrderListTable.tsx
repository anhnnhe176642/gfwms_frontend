'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VisibilityState } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createOrderColumns } from './orderColumns';
import { orderService } from '@/services/order.service';
import { useServerTable } from '@/hooks/useServerTable';
import type { OrderListItem, OrderListParams } from '@/types/order';
import { IS_OFFLINE_OPTIONS } from '@/constants/order';
import { Search, RefreshCw, Calendar } from 'lucide-react';

export type OrderListTableProps = {
  storeId?: number | string;
  initialParams?: OrderListParams;
};

export function OrderListTable({ storeId, initialParams }: OrderListTableProps) {
  const router = useRouter();
  const [tempSearchQuery, setTempSearchQuery] = useState('');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // Use custom hook for table state and data fetching
  const {
    data: orders,
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
  } = useServerTable<OrderListItem, OrderListParams>({
    fetchData: storeId 
      ? async (params) => orderService.getByStore(storeId, params)
      : orderService.list,
    initialParams: initialParams || { page: 1, limit: 10 },
    filterConfig: {
      arrayFilters: {
        status: 'status',
        paymentType: 'paymentType',
        isOffline: 'isOffline',
      },
      dateRangeFilters: {
        createdAt: { from: 'createdFrom', to: 'createdTo' },
      },
      sortingFieldMap: {
        id: 'id',
        orderDate: 'orderDate',
        totalAmount: 'totalAmount',
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
      },
    },
    onError: (err) => {
      console.error('Failed to fetch orders:', err);
    },
  });

  /**
   * Handle view detail
   */
  const handleViewClick = (orderId: number) => {
    router.push(`/admin/orders/${orderId}`);
  };

  /**
   * Handle search
   */
  const handleSearchSubmit = () => {
    handleSearch(tempSearchQuery);
    setTempSearchQuery('');
  };

  /**
   * Handle isOffline filter change
   */
  const handleIsOfflineChange = (value: string) => {
    if (value === 'all') {
      // Remove isOffline filter
      setColumnFilters((prev) => prev.filter((f) => f.id !== 'isOffline'));
    } else {
      // Set isOffline filter
      setColumnFilters((prev) => {
        const others = prev.filter((f) => f.id !== 'isOffline');
        return [...others, { id: 'isOffline', value: [value] }];
      });
    }
  };

  /**
   * Handle date range filter
   */
  const handleDateRangeChange = (from: string, to: string) => {
    setColumnFilters((prev) => {
      const others = prev.filter((f) => f.id !== 'createdAt');
      if (!from && !to) return others;
      return [...others, { id: 'createdAt', value: { from, to } }];
    });
  };

  // Get current filter values for UI display
  const isOfflineFilter = columnFilters.find((f) => f.id === 'isOffline');
  const isOfflineValue = isOfflineFilter
    ? Array.isArray(isOfflineFilter.value)
      ? isOfflineFilter.value[0]
      : ''
    : '';
  const dateRangeFilter = columnFilters.find((f) => f.id === 'createdAt');
  const dateRangeValue = dateRangeFilter?.value as { from?: string; to?: string } | undefined;

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
  const columns = createOrderColumns({
    onView: handleViewClick,
  });

  // Show loading state
  if (loading && orders.length === 0) {
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
          <Button
            onClick={() => {
              reset();
              refresh();
            }}
            variant="outline"
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-4">
        {/* Row 1: Search and Reset */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-1 gap-2">
            <Input
              placeholder="Tìm kiếm theo số điện thoại khách hàng..."
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

        {/* Row 2: Filters */}
        <div className="flex flex-wrap gap-4 items-end">
          {/* IsOffline Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted-foreground">Kênh bán hàng</label>
            <Select value={isOfflineValue || 'all'} onValueChange={handleIsOfflineChange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {IS_OFFLINE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div className="flex items-end gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-muted-foreground">Từ ngày</label>
              <Input
                type="date"
                value={dateRangeValue?.from || ''}
                onChange={(e) =>
                  handleDateRangeChange(e.target.value, dateRangeValue?.to || '')
                }
                className="w-40"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-muted-foreground">Đến ngày</label>
              <Input
                type="date"
                value={dateRangeValue?.to || ''}
                onChange={(e) =>
                  handleDateRangeChange(dateRangeValue?.from || '', e.target.value)
                }
                className="w-40"
              />
            </div>
          </div>
        </div>
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
        data={orders}
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
