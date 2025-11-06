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
import { createFabricCategoryColumns } from './fabricCategoryColumns';
import { fabricCategoryService } from '@/services/fabricCategory.service';
import { useServerTable } from '@/hooks/useServerTable';
import { useRouteAccess } from '@/hooks/useRouteAccess';
import { useAuth } from '@/hooks/useAuth';
import { getServerErrorMessage } from '@/lib/errorHandler';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/config/routes';
import type { FabricCategoryListItem, FabricCategoryListParams } from '@/types/fabricCategory';
import { Search, RefreshCw } from 'lucide-react';

export type FabricCategoryManagementTableProps = {
  initialParams?: FabricCategoryListParams;
};

export function FabricCategoryManagementTable({ initialParams }: FabricCategoryManagementTableProps) {
  const router = useRouter();
  const { canAccess } = useRouteAccess();
  const { hasPermission } = useAuth();
  const [tempSearchQuery, setTempSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // Use custom hook for table state and data fetching
  const {
    data: categories,
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
  } = useServerTable<FabricCategoryListItem, FabricCategoryListParams>({
    fetchData: fabricCategoryService.getFabricCategories,
    initialParams,
    filterConfig: {
      dateRangeFilters: {
        createdAt: {
          from: 'createdFrom',
          to: 'createdTo',
        },
      },
    },
    onError: (err) => {
      console.error('Failed to fetch fabric categories:', err);
    },
  });

  /**
   * Handle view detail
   */
  const handleViewClick = (categoryId: number) => {
    router.push(`/admin/fabrics/categories/${categoryId}`);
  };

  /**
   * Handle edit
   */
  const handleEditClick = (categoryId: number) => {
    router.push(`/admin/fabrics/categories/${categoryId}/edit`);
  };

  /**
   * Handle delete with confirmation dialog
   */
  const handleDeleteClick = (categoryId: number) => {
    setCategoryToDelete(categoryId);
    setDeleteDialogOpen(true);
  };

  /**
   * Confirm and execute delete
   */
  const confirmDelete = async () => {
    if (categoryToDelete === null) return;

    setActionLoading(true);
    try {
      await fabricCategoryService.deleteFabricCategory(categoryToDelete);
      toast.success('Xóa danh mục vải thành công');
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      await refresh();
    } catch (err) {
      const message = getServerErrorMessage(err) || 'Không thể xóa danh mục vải';
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

  const columns = createFabricCategoryColumns({
    onDelete: hasPermission(PERMISSIONS.FABRICS.MANAGE_CATEGORIES.key) ? handleDeleteClick : undefined,
    onEdit: canAccess(ROUTES.ADMIN.FABRICS.CATEGORIES) ? handleEditClick : undefined,
    onView: canAccess(ROUTES.ADMIN.FABRICS.CATEGORIES) ? handleViewClick : undefined,
  });

  if (loading && categories.length === 0) {
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
      {/* Search bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo tên danh mục..."
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
          Tổng: <span className="font-medium">{pagination.total}</span> danh mục
        </p>
      </div>

      {/* DataTable */}
      <DataTable 
        columns={columns} 
        data={categories}
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
            <DialogTitle>Xóa danh mục vải</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa danh mục vải này? Hành động này không thể hoàn tác.
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

export default FabricCategoryManagementTable;
