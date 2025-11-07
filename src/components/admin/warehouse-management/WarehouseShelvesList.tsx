'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useServerTable } from '@/hooks/useServerTable';
import { createShelfColumns } from './shelfColumns';
import { warehouseService } from '@/services/warehouse.service';
import { getServerErrorMessage } from '@/lib/errorHandler';
import type { ShelfListItem, ShelfListParams } from '@/types/warehouse';
import { Search, ArrowLeft, Plus, Loader } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { useAuth } from '@/hooks/useAuth';
import { PERMISSIONS } from '@/constants/permissions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { CreateShelfForm } from './CreateShelfForm';
import { EditShelfForm } from './EditShelfForm';

export interface WarehouseShelvesListProps {
  warehouseId: string | number;
}

export function WarehouseShelvesList({ warehouseId }: WarehouseShelvesListProps) {
  const router = useRouter();
  const { hasPermission } = useAuth();
  const [tempSearchQuery, setTempSearchQuery] = useState('');
  const [createShelfOpen, setCreateShelfOpen] = useState(false);
  const [editShelfOpen, setEditShelfOpen] = useState(false);
  const [selectedShelf, setSelectedShelf] = useState<ShelfListItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shelfToDelete, setShelfToDelete] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Use custom hook for table state and data fetching
  const {
    data: shelves,
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
  } = useServerTable<ShelfListItem, ShelfListParams>({
    fetchData: async (params: ShelfListParams) => {
      return await warehouseService.getShelves(params);
    },
    initialParams: { warehouseId: Number(warehouseId) },
    filterConfig: {
      // Define which filters are date ranges
      dateRangeFilters: {
        createdAt: {
          from: 'createdFrom',
          to: 'createdTo',
        },
      },
    },
    onError: (err) => {
      console.error('Failed to fetch shelves:', err);
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

  /**
   * Handle edit shelf
   */
  const handleEditShelf = (shelfId: number) => {
    const shelf = shelves.find(s => s.id === shelfId);
    if (shelf) {
      setSelectedShelf(shelf);
      setEditShelfOpen(true);
    }
  };

  /**
   * Handle delete shelf
   */
  const handleDeleteClick = (shelfId: number) => {
    setShelfToDelete(shelfId);
    setDeleteDialogOpen(true);
  };

  /**
   * Confirm and execute delete
   */
  const confirmDelete = async () => {
    if (!shelfToDelete) return;

    setActionLoading(true);
    try {
      await warehouseService.deleteShelf(shelfToDelete);
      toast.success('Xóa kệ thành công');
      setDeleteDialogOpen(false);
      setShelfToDelete(null);
      await refresh();
    } catch (err) {
      const message = getServerErrorMessage(err) || 'Không thể xóa kệ';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Handle view shelf detail
   */
  const handleViewShelf = (shelfId: number) => {
    router.push(`/admin/warehouses/${warehouseId}/shelves/${shelfId}`);
  };

  const handleGoBack = () => {
    router.push(`/admin/warehouses/${warehouseId}`);
  };

  const columns = createShelfColumns({
    onDelete: hasPermission(PERMISSIONS.SHELVES.DELETE.key) ? handleDeleteClick : undefined,
    onEdit: hasPermission(PERMISSIONS.SHELVES.UPDATE.key) ? handleEditShelf : undefined,
    onView: hasPermission(PERMISSIONS.SHELVES.VIEW_DETAIL.key) ? handleViewShelf : undefined,
  });

  if (loading && shelves.length === 0) {
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
            <h1 className="text-3xl font-bold tracking-tight">Danh sách kệ</h1>
            <p className="text-muted-foreground mt-1">Quản lý các kệ trong kho</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Danh sách kệ</h1>
            <p className="text-muted-foreground mt-1">Quản lý các kệ trong kho</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Danh sách kệ</h1>
          <p className="text-muted-foreground mt-1">Quản lý các kệ trong kho</p>
        </div>
      </div>

      {/* Table Card */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Danh sách kệ</CardTitle>
          <CardDescription>Quản lý các kệ trong kho</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo mã kệ..."
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
            {hasPermission(PERMISSIONS.SHELVES.CREATE.key) && (
              <Button onClick={() => setCreateShelfOpen(true)} className="ml-auto gap-2">
                <Plus className="h-4 w-4" />
                Tạo kệ
              </Button>
            )}
          </div>

          {/* Info bar */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Tổng: <span className="font-medium">{pagination.total}</span> kệ
            </p>
          </div>

          {/* DataTable */}
          <DataTable
            columns={columns}
            data={shelves}
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

      {/* Create Shelf Form */}
      <CreateShelfForm
        warehouseId={Number(warehouseId)}
        open={createShelfOpen}
        onOpenChange={setCreateShelfOpen}
        onSuccess={refresh}
      />

      {/* Edit Shelf Form */}
      <EditShelfForm
        shelf={selectedShelf}
        warehouseId={Number(warehouseId)}
        open={editShelfOpen}
        onOpenChange={setEditShelfOpen}
        onSuccess={refresh}
      />

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa kệ</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa kệ này? Hành động này không thể hoàn tác.
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

export default WarehouseShelvesList;
