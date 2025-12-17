'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { InvoiceListItem } from '@/types/invoice';
import { SortButton } from '@/components/admin/table/SortButton';
import { CheckboxFilterHeader } from '@/components/admin/table/CheckboxFilterHeader';
import { InvoiceStatusBadge } from '@/components/admin/table/Badges';
import { INVOICE_STATUS_OPTIONS } from '@/constants/invoice';

export type InvoiceColumnActions = {
  onView?: (invoiceId: number) => void;
};

export const createInvoiceColumns = ({
  onView,
}: InvoiceColumnActions): ColumnDef<InvoiceListItem>[] => {
  const columns: ColumnDef<InvoiceListItem>[] = [
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
          <span className="font-medium">ID Hóa đơn</span>
          <SortButton column={column} label="Sắp xếp theo ID" />
        </div>
      ),
      cell: ({ row }) => <span className="font-mono text-sm">#{row.getValue('id')}</span>,
      meta: {
        title: 'ID Hóa đơn',
      },
    },
    {
      accessorKey: 'order',
      header: 'Đơn hàng',
      cell: ({ row }) => {
        const order = row.getValue('order') as InvoiceListItem['order'];
        return (
          <div className="space-y-1">
            <span className="font-mono text-sm">#{order?.id}</span>
            <p className="text-xs text-muted-foreground">{order?.user?.username || '-'}</p>
          </div>
        );
      },
      meta: {
        title: 'Đơn hàng',
      },
    },
    {
      accessorKey: 'invoiceDate',
      header: ({ column }) => (
        <div className="flex items-center gap-1">
          <span className="font-medium">Ngày lập</span>
          <SortButton column={column} label="Sắp xếp theo ngày lập" />
        </div>
      ),
      cell: ({ row }) => {
        const date = row.getValue('invoiceDate') as string;
        return date ? new Date(date).toLocaleDateString('vi-VN') : '-';
      },
      meta: {
        title: 'Ngày lập',
      },
    },
    {
      accessorKey: 'invoiceStatus',
      header: ({ column }) => (
        <CheckboxFilterHeader
          column={column}
          title="Trạng thái"
          options={INVOICE_STATUS_OPTIONS}
        />
      ),
      cell: ({ row }) => <InvoiceStatusBadge status={row.getValue('invoiceStatus')} />,
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
        const invoice = row.original;

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
                <DropdownMenuItem onClick={() => onView(invoice.id)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Xem chi tiết
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
