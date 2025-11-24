'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { StoreListItem } from '@/types/store';
import { SortButton } from '@/components/admin/table/SortButton';
import { CheckboxFilterHeader } from '@/components/admin/table/CheckboxFilterHeader';
import { DateRangeFilterHeader } from '@/components/admin/table/DateRangeFilterHeader';
import { STORE_ACTIVE_STATUS_OPTIONS } from '@/constants/store';

export type StoreColumnActions = {
  onView?: (storeId: number) => void;
  onEdit?: (storeId: number) => void;
  onDelete?: (storeId: number) => void;
};

const ActiveStatusBadge = ({ isActive }: { isActive: boolean }) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isActive
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
      }`}
    >
      {isActive ? 'Hoạt động' : 'Không hoạt động'}
    </span>
  );
};

export const createStoreColumns = (actions: StoreColumnActions): ColumnDef<StoreListItem>[] => [
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
    accessorKey: 'name',
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Tên cửa hàng</span>
        <SortButton column={column} label="Sắp xếp theo tên cửa hàng" />
      </div>
    ),
    meta: {
      title: 'Tên cửa hàng',
    },
  },
  {
    accessorKey: 'address',
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Địa chỉ</span>
        <SortButton column={column} label="Sắp xếp theo địa chỉ" />
      </div>
    ),
    cell: ({ row }) => row.getValue('address') || '-',
    meta: {
      title: 'Địa chỉ',
    },
  },
  {
    accessorKey: 'isActive',
    header: ({ column }) => (
      <CheckboxFilterHeader
        column={column}
        title="Trạng thái"
        options={STORE_ACTIVE_STATUS_OPTIONS}
      />
    ),
    cell: ({ row }) => <ActiveStatusBadge isActive={row.getValue('isActive')} />,
    filterFn: (row, id, value) => {
      if (!value || value.length === 0) return true;
      return value.includes(row.getValue(id));
    },
    sortingFn: 'basic',
    meta: {
      title: 'Trạng thái',
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <DateRangeFilterHeader column={column} title="Ngày tạo" />,
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string;
      return date ? new Date(date).toLocaleString('vi-VN') : '-';
    },
    filterFn: (row, id, value) => {
      if (!value || (!value.from && !value.to)) return true;
      const rowDate = new Date(row.getValue(id) as string);
      const from = value.from ? new Date(value.from) : null;
      const to = value.to ? new Date(value.to) : null;

      if (from && to) {
        return rowDate >= from && rowDate <= to;
      } else if (from) {
        return rowDate >= from;
      } else if (to) {
        return rowDate <= to;
      }
      return true;
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
      const store = row.original;

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

            {actions.onView && (
              <DropdownMenuItem onClick={() => actions.onView?.(store.id)}>
                Xem chi tiết
              </DropdownMenuItem>
            )}

            {actions.onEdit && (
              <DropdownMenuItem onClick={() => actions.onEdit?.(store.id)}>
                Chỉnh sửa
              </DropdownMenuItem>
            )}

            {actions.onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => actions.onDelete?.(store.id)}
                  className="text-red-600"
                >
                  Xóa
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
