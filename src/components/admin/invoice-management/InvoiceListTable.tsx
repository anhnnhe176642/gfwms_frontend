'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VisibilityState } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { createInvoiceColumns } from './invoiceColumns';
import { invoiceService } from '@/services/invoice.service';
import { useServerTable } from '@/hooks/useServerTable';
import type { InvoiceListItem, InvoiceListParams } from '@/types/invoice';
import { Search, RefreshCw } from 'lucide-react';

export type InvoiceListTableProps = {
  initialParams?: InvoiceListParams;
};

export function InvoiceListTable({ initialParams }: InvoiceListTableProps) {
  const router = useRouter();
  const [tempSearchQuery, setTempSearchQuery] = useState('');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // Use custom hook for table state and data fetching
  const {
    data: invoices,
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
  } = useServerTable<InvoiceListItem, InvoiceListParams>({
    fetchData: invoiceService.list,
    initialParams: initialParams || { page: 1, limit: 10 },
    filterConfig: {
      arrayFilters: {
        invoiceStatus: 'invoiceStatus',
      },
      sortingFieldMap: {
        id: 'id',
        invoiceDate: 'invoiceDate',
        dueDate: 'dueDate',
        totalAmount: 'totalAmount',
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
      },
    },
    onError: (err) => {
      console.error('Failed to fetch invoices:', err);
    },
  });

  /**
   * Handle view detail
   */
  const handleViewClick = (invoiceId: number) => {
    router.push(`/admin/invoices/${invoiceId}`);
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
  const columns = createInvoiceColumns({
    onView: handleViewClick,
  });

  // Show loading state
  if (loading && invoices.length === 0) {
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
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-1 gap-2">
          <Input
            placeholder="Tìm kiếm theo mã đơn hàng, tên khách hàng..."
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
        data={invoices}
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
