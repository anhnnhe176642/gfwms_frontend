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
import { createCreditRequestColumns } from './columns';
import { creditRequestService } from '@/services/creditRequest.service';
import { useServerTable } from '@/hooks/useServerTable';
import { getServerErrorMessage } from '@/lib/errorHandler';
import type { CreditRequestListItem, CreditRequestListParams } from '@/types/creditRequest';
import { Search, RefreshCw } from 'lucide-react';

export type CreditRequestTableProps = {
  initialParams?: CreditRequestListParams;
};

export function CreditRequestTable({ initialParams }: CreditRequestTableProps) {
  const [tempSearchQuery, setTempSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [requestToAction, setRequestToAction] = useState<number | null>(null);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    email: false, // Hide email column by default
  });

  // Use custom hook for table state and data fetching
  const {
    data: requests,
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
  } = useServerTable<CreditRequestListItem, CreditRequestListParams>({
    fetchData: creditRequestService.getRequests,
    initialParams,
    filterConfig: {
      // Define which filters are array-based (multi-select)
      arrayFilters: {
        status: 'status',
        type: 'type',
      },
      // Map column ID to actual API field names
      sortingFieldMap: {
        username: 'user.username',
        email: 'user.email',
        fullname: 'user.fullname',
      },
    },
    onError: (err) => {
      console.error('Failed to fetch credit requests:', err);
    },
  });

  /**
   * Handle approve credit request
   */
  const handleApproveClick = (requestId: number) => {
    setRequestToAction(requestId);
    setActionType('approve');
    setActionDialogOpen(true);
  };

  /**
   * Handle reject credit request
   */
  const handleRejectClick = (requestId: number) => {
    setRequestToAction(requestId);
    setActionType('reject');
    setActionDialogOpen(true);
  };

  /**
   * Confirm and execute approve
   */
  const confirmApprove = async () => {
    if (!requestToAction) return;

    setActionLoading(true);
    try {
      await creditRequestService.approveCreditRequest({
        requestId: requestToAction,
        status: 'APPROVED',
      });
      toast.success('Phê duyệt đơn hạn mức thành công');
      setActionDialogOpen(false);
      setRequestToAction(null);
      setActionType(null);
      await refresh();
    } catch (err) {
      const message = getServerErrorMessage(err) || 'Không thể phê duyệt đơn hạn mức';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Confirm and execute reject
   */
  const confirmReject = async () => {
    if (!requestToAction) return;

    setActionLoading(true);
    try {
      await creditRequestService.rejectCreditRequest({
        requestId: requestToAction,
        status: 'REJECTED',
      });
      toast.success('Từ chối đơn hạn mức thành công');
      setActionDialogOpen(false);
      setRequestToAction(null);
      setActionType(null);
      await refresh();
    } catch (err) {
      const message = getServerErrorMessage(err) || 'Không thể từ chối đơn hạn mức';
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

  const columns = createCreditRequestColumns({
    onApprove: handleApproveClick,
    onReject: handleRejectClick,
  });

  if (loading && requests.length === 0) {
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
            placeholder="Tìm kiếm theo tên, email, username..."
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
          Tổng: <span className="font-medium">{pagination.total}</span> đơn hạn mức
        </p>
      </div>

      {/* DataTable */}
      <DataTable 
        columns={columns} 
        data={requests}
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

      {/* Action confirmation dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Phê duyệt đơn hạn mức' : 'Từ chối đơn hạn mức'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve'
                ? 'Bạn có chắc chắn muốn phê duyệt đơn hạn mức này?'
                : 'Bạn có chắc chắn muốn từ chối đơn hạn mức này?'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialogOpen(false)}
              disabled={actionLoading}
            >
              Hủy
            </Button>
            <Button
              variant={actionType === 'approve' ? 'default' : 'destructive'}
              onClick={actionType === 'approve' ? confirmApprove : confirmReject}
              disabled={actionLoading}
            >
              {actionLoading 
                ? (actionType === 'approve' ? 'Đang phê duyệt...' : 'Đang từ chối...')
                : (actionType === 'approve' ? 'Phê duyệt' : 'Từ chối')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreditRequestTable;
