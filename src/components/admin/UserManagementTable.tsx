'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { createUserColumns } from './columns';
import { userService } from '@/services/user.service';
import type { UserListItem, UserListParams, UserStatus, UserRole } from '@/types/user';
import { Search } from 'lucide-react';
import type { SortingState, ColumnFiltersState } from '@tanstack/react-table';

export type UserManagementTableProps = {
  initialParams?: UserListParams;
};

export function UserManagementTable({ initialParams }: UserManagementTableProps) {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Convert TanStack sorting state to API params
  const getSortParams = useCallback(() => {
    if (sorting.length === 0) return {};
    
    const sortBy = sorting.map(s => s.id).join(',');
    const order = sorting.map(s => s.desc ? 'desc' : 'asc').join(',');
    
    return { sortBy, order };
  }, [sorting]);

  // Convert TanStack filters to API params
  const getFilterParams = useCallback(() => {
    const params: Record<string, string> = {};
    
    columnFilters.forEach(filter => {
      if (filter.id === 'status' || filter.id === 'role') {
        // Filter value is array of strings
        const values = filter.value as string[];
        if (values && values.length > 0) {
          params[filter.id] = values.join(',');
        }
      } else if (filter.id === 'createdAt') {
        // Filter value is date range object
        const dateRange = filter.value as { from?: string; to?: string };
        if (dateRange?.from) {
          params['createdFrom'] = dateRange.from;
        }
        if (dateRange?.to) {
          params['createdTo'] = dateRange.to;
        }
      }
    });
    
    return params;
  }, [columnFilters]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: UserListParams = {
        ...initialParams,
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery || undefined,
        ...getSortParams(),
        ...getFilterParams(),
      };
      
      const response = await userService.getUsers(params);
      setUsers(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  }, [initialParams, pagination.page, pagination.limit, searchQuery, getSortParams, getFilterParams]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Re-fetch when sorting changes (filters will be applied via button click)
  useEffect(() => {
    if (!loading) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorting]);

  // Re-fetch when columnFilters change (when user clicks "Áp dụng" button)
  useEffect(() => {
    if (!loading) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnFilters]);

  const handleStatusChange = async (userId: string | number, status: UserStatus) => {
    try {
      await userService.updateUserStatus({ userId, status });
      await fetchUsers();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  const handleRoleChange = async (userId: string | number, role: UserRole) => {
    try {
      await userService.updateUserRole({ userId, role });
      await fetchUsers();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Không thể cập nhật vai trò');
    }
  };

  const handleDelete = async (userId: string | number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;
    try {
      await userService.deleteUser(userId);
      await fetchUsers();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Không thể xóa người dùng');
    }
  };

  const handleSearch = () => {
    fetchUsers();
  };

  const handleSortingChange = (updater: any) => {
    setSorting(updater);
  };

  const handleColumnFiltersChange = (updater: any) => {
    setColumnFilters(updater);
  };

  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    setPagination(prev => ({
      ...prev,
      page: pageIndex + 1, // API uses 1-based indexing
      limit: pageSize,
    }));
  };

  const columns = createUserColumns({
    onStatusChange: handleStatusChange,
    onRoleChange: handleRoleChange,
    onDelete: handleDelete,
  });

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Đang tải...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <Button onClick={fetchUsers} variant="outline">
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch}>Tìm kiếm</Button>
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
        manualSorting={true}
        manualFiltering={true}
        manualPagination={true}
        pageCount={pagination.totalPages}
        pageIndex={pagination.page - 1} // DataTable uses 0-based indexing
        pageSize={pagination.limit}
        onPaginationChange={handlePaginationChange}
      />
    </div>
  );
}

export default UserManagementTable;
