'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Eye, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { OrderListItem } from '@/types/order';
import { SortButton } from '@/components/admin/table/SortButton';
import { CheckboxFilterHeader } from '@/components/admin/table/CheckboxFilterHeader';
import { OrderStatusBadge, PaymentTypeBadge } from '@/components/admin/table/Badges';
import { ORDER_STATUS_OPTIONS, PAYMENT_TYPE_OPTIONS } from '@/constants/order';

export type OrderColumnActions = {
  onView?: (orderId: number) => void;
  onMarkDelivered?: (orderId: number) => Promise<void>;
  markDeliveredLoading?: number | null;
};

export const createOrderColumns = ({
  onView,
  onMarkDelivered,
  markDeliveredLoading,
}: OrderColumnActions): ColumnDef<OrderListItem>[] => {
  const columns: ColumnDef<OrderListItem>[] = [
    {
      id: 'stt',
      header: 'STT',
      cell: ({ row, table }) => {
        const pageIndex = table.getState().pagination.pageIndex;
        const pageSize = table.getState().pagination.pageSize;
        return <div className="font-medium">{pageIndex * pageSize + row.index + 1}</div>;
      },
      enableHiding: false,
      meta: {
        title: 'STT',
      },
    },
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <div className="flex items-center gap-1">
          <span className="font-medium">ID Đơn hàng</span>
          <SortButton column={column} label="Sắp xếp theo ID" />
        </div>
      ),
      cell: ({ row }) => <span className="font-mono text-sm">#{row.getValue('id')}</span>,
      meta: {
        title: 'ID Đơn hàng',
      },
    },
    {
      accessorKey: 'user',
      header: 'Khách hàng',
      cell: ({ row }) => {
        const order = row.original;
        const user = order.user;
        return (
          <div className="space-y-1">
            <p className="font-medium">{user?.fullname || user?.username || '-'}</p>
            <p className="text-xs text-muted-foreground">
              {order.customerPhone || user?.phone || '-'}
            </p>
          </div>
        );
      },
      meta: {
        title: 'Khách hàng',
      },
    },
    {
      accessorKey: 'orderDate',
      header: ({ column }) => (
        <div className="flex items-center gap-1">
          <span className="font-medium">Ngày đặt</span>
          <SortButton column={column} label="Sắp xếp theo ngày đặt" />
        </div>
      ),
      cell: ({ row }) => {
        const date = row.getValue('orderDate') as string;
        return date ? new Date(date).toLocaleDateString('vi-VN') : '-';
      },
      meta: {
        title: 'Ngày đặt',
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <CheckboxFilterHeader
          column={column}
          title="Trạng thái"
          options={ORDER_STATUS_OPTIONS}
        />
      ),
      cell: ({ row }) => <OrderStatusBadge status={row.getValue('status')} />,
      filterFn: (row, id, value) => {
        if (!value || value.length === 0) return true;
        return value.includes(row.getValue(id));
      },
      sortingFn: 'text',
      meta: {
        title: 'Trạng thái',
      },
    },
    {
      id: 'paymentType',
      accessorFn: (row) => row.invoice?.paymentType,
      header: ({ column }) => (
        <CheckboxFilterHeader
          column={column}
          title="Loại thanh toán"
          options={PAYMENT_TYPE_OPTIONS}
        />
      ),
      cell: ({ row }) => {
        const invoice = row.original.invoice;
        return invoice ? <PaymentTypeBadge type={invoice.paymentType} /> : '-';
      },
      filterFn: (row, id, value) => {
        if (!value || value.length === 0) return true;
        return value.includes(row.getValue(id));
      },
      sortingFn: 'text',
      meta: {
        title: 'Loại thanh toán',
      },
    },
    {
      accessorKey: 'isOffline',
      header: 'Kênh',
      cell: ({ row }) => {
        const isOffline = row.getValue('isOffline') as boolean;
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              isOffline
                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                : 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300'
            }`}
          >
            {isOffline ? 'Offline' : 'Online'}
          </span>
        );
      },
      meta: {
        title: 'Kênh',
      },
    },
    {
      accessorKey: 'totalAmount',
      header: ({ column }) => (
        <div className="flex items-center gap-1">
          <span className="font-medium">Tổng tiền</span>
          <SortButton column={column} label="Sắp xếp theo tổng tiền" />
        </div>
      ),
      cell: ({ row }) => {
        const amount = row.getValue('totalAmount') as number;
        return (
          <span className="font-medium">
            {amount?.toLocaleString('vi-VN')} ₫
          </span>
        );
      },
      meta: {
        title: 'Tổng tiền',
      },
    },
    {
      accessorKey: 'invoice.paidAmount',
      header: 'Đã thanh toán',
      cell: ({ row }) => {
        const invoice = row.original.invoice;
        if (!invoice || invoice.paymentType !== 'CREDIT') return '-';
        return (
          <span className="font-medium text-green-600 dark:text-green-400">
            {invoice.paidAmount?.toLocaleString('vi-VN')} ₫
          </span>
        );
      },
      meta: {
        title: 'Đã thanh toán',
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <div className="flex items-center gap-1">
          <span className="font-medium">Ngày tạo</span>
          <SortButton column={column} label="Sắp xếp theo ngày tạo" />
        </div>
      ),
      cell: ({ row }) => {
        const date = row.getValue('createdAt') as string;
        return date ? new Date(date).toLocaleString('vi-VN') : '-';
      },
      meta: {
        title: 'Ngày tạo',
      },
    },
    {
      id: 'actions',
      header: 'Hành động',
      enableHiding: false,
      meta: {
        title: 'Hành động',
      },
      cell: ({ row }) => {
        const order = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Mở menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Hành động</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {onView && (
                <DropdownMenuItem onClick={() => onView(order.id)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Xem chi tiết
                </DropdownMenuItem>
              )}

              {onMarkDelivered && order.status === 'PROCESSING' && (
                <DropdownMenuItem
                  onClick={() => onMarkDelivered(order.id)}
                  disabled={markDeliveredLoading === order.id}
                >
                  {markDeliveredLoading === order.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang cập nhật...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Đánh dấu đã hoàn thành
                    </>
                  )}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return columns;
};
