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
import { createUserColumns } from './columns';
import { userService } from '@/services/user.service';
import { useServerTable } from '@/hooks/useServerTable';
import { useRoles } from '@/hooks/useRoles';
import { getServerErrorMessage } from '@/lib/errorHandler';
import type { UserListItem, UserListParams, UserStatus } from '@/types/user';
import { Search, RefreshCw } from 'lucide-react';

export type UserManagementTableProps = {
  initialParams?: UserListParams;
};

export function UserManagementTable({ initialParams }: UserManagementTableProps) {
  const [tempSearchQuery, setTempSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | number | null>(null);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    email: false, // Hide email column by default
  });

  // Fetch roles from API
  const { roles: roleOptions, loading: roleOptionsLoading } = useRoles();

  // Use custom hook for table state and data fetching
  const {
    data: users,
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
  } = useServerTable<UserListItem, UserListParams>({
    fetchData: userService.getUsers,
    initialParams,
    filterConfig: {
      // Define which filters are array-based (multi-select)
      arrayFilters: {
        status: 'status',
        role: 'role',
        gender: 'gender',
      },
      // Define which filters are date ranges
      dateRangeFilters: {
        createdAt: {
          from: 'createdFrom',
          to: 'createdTo',
        },
      },
    },
    onError: (err) => {
      console.error('Failed to fetch users:', err);
    },
  });

  /**
   * Handle status change with optimistic UI update
   */
  const handleStatusChange = async (userId: string, status: UserStatus) => {
    setActionLoading(true);
    try {
      await userService.updateUserStatus({ userId, status });
      toast.success('Cập nhật trạng thái thành công');
      await refresh();
    } catch (err) {
      const message = getServerErrorMessage(err) || 'Không thể cập nhật trạng thái';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Handle role change
   */
  const handleRoleChange = async (userId: string, roleName: string) => {
    setActionLoading(true);
    try {
      await userService.updateUserRole({ userId, roleName });
      toast.success('Cập nhật vai trò thành công');
      await refresh();
    } catch (err) {
      const message = getServerErrorMessage(err) || 'Không thể cập nhật vai trò';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Handle delete with confirmation dialog
   */
  const handleDeleteClick = (userId: string | number) => {
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };

  /**
   * Confirm and execute delete
   */
  const confirmDelete = async () => {
    if (!userToDelete) return;

    setActionLoading(true);
    try {
      await userService.deleteUser(userToDelete);
      toast.success('Xóa người dùng thành công');
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      await refresh();
    } catch (err) {
      const message = getServerErrorMessage(err) || 'Không thể xóa người dùng';
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

  const columns = createUserColumns(
    {
      onStatusChange: handleStatusChange,
      onRoleChange: handleRoleChange,
      onDelete: handleDeleteClick,
    },
    {
      roleOptions,
      roleOptionsLoading,
    }
  );

  if (loading && users.length === 0) {
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
            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
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
          Tổng: <span className="font-medium">{pagination.total}</span> người dùng
        </p>
      </div>

      {/* DataTable */}
      <DataTable 
        columns={columns} 
        data={users}
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
        pageIndex={pagination.page - 1} // DataTable uses 0-based indexing
        pageSize={pagination.limit}
        onPaginationChange={handlePaginationChange}
      />

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa người dùng</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.
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

export default UserManagementTable;
