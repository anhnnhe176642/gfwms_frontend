'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useServerTable } from '@/hooks/useServerTable';
import { createImportFabricColumns } from './importFabricColumns';
import { importFabricService } from '@/services/importFabric.service';
import { getServerErrorMessage } from '@/lib/errorHandler';
import type { ImportFabricListItem, ImportFabricListParams } from '@/types/importFabric';
import { Search, ArrowLeft, Loader, Plus } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { useAuth } from '@/hooks/useAuth';
import { PERMISSIONS } from '@/constants/permissions';

export interface WarehouseImportFabricsListProps {
  warehouseId: string | number;
}

export function WarehouseImportFabricsList({ warehouseId }: WarehouseImportFabricsListProps) {
  const router = useRouter();
  const { hasPermission } = useAuth();
  const [tempSearchQuery, setTempSearchQuery] = useState('');

  // Use custom hook for table state and data fetching
  const {
    data: importFabrics,
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
  } = useServerTable<ImportFabricListItem, ImportFabricListParams>({
    fetchData: async (params: ImportFabricListParams) => {
      return await importFabricService.getImportFabrics(params);
    },
    initialParams: { warehouseId: Number(warehouseId) },
    filterConfig: {
      dateRangeFilters: {
        importDate: {
          from: 'importDateFrom',
          to: 'importDateTo',
        },
        createdAt: {
          from: 'createdFrom',
          to: 'createdTo',
        },
      },
      // Map custom sort IDs to API field names
      sortingFieldMap: {
        importUserId: 'importUser.fullname',
      },
    },
    onError: (err) => {
      console.error('Failed to fetch import fabrics:', err);
    },
  });

  /**
   * Handle search button click
   */
  const handleSearchClick = useCallback(() => {
    handleSearch(tempSearchQuery);
  }, [tempSearchQuery, handleSearch]);

  /**
   * Handle search on Enter key
   */
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  /**
   * Handle clear search
   */
  const handleClearSearch = useCallback(() => {
    setTempSearchQuery('');
    handleSearch('');
  }, [handleSearch]);

  const handleGoBack = () => {
    router.push(`/admin/warehouses/${warehouseId}`);
  };

  /**
   * Handle view import fabric detail
   */
  const handleViewImportFabric = (importId: number) => {
    router.push(`/admin/warehouses/${warehouseId}/import-fabrics/${importId}`);
  };

  /**
   * Handle create new import fabric
   */
  const handleCreateImportFabric = () => {
    router.push(`/admin/warehouses/${warehouseId}/import`);
  };

  const columns = createImportFabricColumns({
    onView: hasPermission(PERMISSIONS.IMPORT_FABRICS.VIEW_DETAIL.key) ? handleViewImportFabric : undefined,
  });

  if (loading && importFabrics.length === 0) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleGoBack}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Danh sách phiếu nhập kho</h1>
            <p className="text-muted-foreground mt-1">Danh sách các phiếu nhập vải vào kho</p>
          </div>
        </div>

        <Card className="bg-card">
          <CardContent className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center gap-2">
              <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Đang tải...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleGoBack}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Danh sách phiếu nhập kho</h1>
            <p className="text-muted-foreground mt-1">Danh sách các phiếu nhập vải vào kho</p>
          </div>
        </div>

        <Card className="bg-card">
          <CardContent className="flex justify-center items-center h-64">
            <div className="text-center">
              <p className="text-red-500 mb-2">{error}</p>
              <Button onClick={() => { reset(); refresh(); }} variant="outline">
                Thử lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleGoBack}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Danh sách phiếu nhập kho</h1>
            <p className="text-muted-foreground mt-1">Danh sách các phiếu nhập vải vào kho</p>
          </div>
        </div>
        {hasPermission(PERMISSIONS.IMPORT_FABRICS.CREATE.key) && (
          <Button onClick={handleCreateImportFabric} className="gap-2">
            <Plus className="h-4 w-4" />
            Tạo đơn nhập mới
          </Button>
        )}
      </div>

      {/* Table Card */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Danh sách phiếu nhập kho</CardTitle>
          <CardDescription>Quản lý các phiếu nhập vải vào kho</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo ID phiếu nhập..."
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
            {tempSearchQuery && (
              <Button onClick={handleClearSearch} disabled={loading} variant="outline">
                Xóa
              </Button>
            )}
          </div>

          {/* Info bar */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Tổng: <span className="font-medium">{pagination.total}</span> phiếu nhập
            </p>
          </div>

          {/* DataTable */}
          <DataTable
            columns={columns}
            data={importFabrics}
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
        </CardContent>
      </Card>
    </div>
  );
}

export default WarehouseImportFabricsList;
