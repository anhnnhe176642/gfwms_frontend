'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VisibilityState } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { createCreditRegistrationColumns } from './columns';
import { creditRegistrationService } from '@/services/creditRegistration.service';
import { useServerTable } from '@/hooks/useServerTable';
import type { CreditRegistrationListItem, CreditRegistrationListParams } from '@/types/creditRegistration';
import { Search, RefreshCw } from 'lucide-react';

export type CreditRegistrationTableProps = {
  initialParams?: CreditRegistrationListParams;
};

export function CreditRegistrationTable({ initialParams }: CreditRegistrationTableProps) {
  const router = useRouter();
  const [tempSearchQuery, setTempSearchQuery] = useState('');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    email: false, // Hide email column by default
  });

  // Use custom hook for table state and data fetching
  const {
    data: registrations,
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
  } = useServerTable<CreditRegistrationListItem, CreditRegistrationListParams>({
    fetchData: creditRegistrationService.list,
    initialParams,
    filterConfig: {
      // Define which filters are array-based (multi-select)
      arrayFilters: {
        status: 'status',
      },
      // Map column ID to actual API field names
      sortingFieldMap: {
        username: 'user.username',
        email: 'user.email',
        fullname: 'user.fullname',
        approver: 'approver.fullname',
        isLocked: 'isLocked',
      },
    },
    onError: (err) => {
      console.error('Failed to fetch credit registrations:', err);
    },
  });

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempSearchQuery(e.currentTarget.value);
  };

  // Handle search submission
  const handleSearchSubmit = () => {
    handleSearch(tempSearchQuery);
  };

  // Handle search clear
  const handleSearchClear = () => {
    setTempSearchQuery('');
    handleSearch('');
  };

  // Handle key press in search input
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  // Handle view detail
  const handleViewClick = (registrationId: number) => {
    router.push(`/admin/credits/${registrationId}`);
  };

  const columns = createCreditRegistrationColumns({
    onView: handleViewClick,
  });

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
        <p className="font-medium">Lỗi khi tải dữ liệu</p>
        <p className="text-sm">{error}</p>
        <Button
          onClick={refresh}
          variant="outline"
          size="sm"
          className="mt-2"
        >
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Search and filter section */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên, email, họ tên..."
            className="pl-8"
            value={tempSearchQuery}
            onChange={handleSearchChange}
            onKeyPress={handleSearchKeyPress}
          />
        </div>
        <Button onClick={handleSearchSubmit} variant="outline" size="icon">
          <Search className="h-4 w-4" />
        </Button>
        {tempSearchQuery && (
          <Button onClick={handleSearchClear} variant="ghost" size="sm">
            Xóa
          </Button>
        )}
        <Button
          onClick={refresh}
          variant="outline"
          size="icon"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={registrations}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        sorting={sorting}
        onSortingChange={setSorting}
        columnFilters={columnFilters}
        onColumnFiltersChange={setColumnFilters}
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
