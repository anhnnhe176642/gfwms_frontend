'use client';

import { ColumnDef } from '@tanstack/react-table';
import type { YoloModelListItem, YoloModelStatus } from '@/types/yolo-model';
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
import { SortButton } from '@/components/admin/table/SortButton';
import { CheckboxFilterHeader } from '@/components/admin/table/CheckboxFilterHeader';

// Status badge config
const STATUS_CONFIG: Record<YoloModelStatus, { label: string; className: string; value: YoloModelStatus }> = {
  ACTIVE: {
    label: 'Hoạt động',
    className: 'bg-green-100 text-green-800',
    value: 'ACTIVE',
  },
  TESTING: {
    label: 'Đang kiểm tra',
    className: 'bg-blue-100 text-blue-800',
    value: 'TESTING',
  },
  DEPRECATED: {
    label: 'Không dùng',
    className: 'bg-red-100 text-red-800',
    value: 'DEPRECATED',
  },
};

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Hoạt động' },
  { value: 'TESTING', label: 'Đang kiểm tra' },
  { value: 'DEPRECATED', label: 'Không dùng' },
];

export type YoloModelColumnActions = {
  onView?: (modelId: number) => void;
  onDelete?: (modelId: number) => void;
  onActivate?: (modelId: number) => void;
  onDeactivate?: (modelId: number) => void;
};

export const createModelColumns = (
  actions: YoloModelColumnActions
): ColumnDef<YoloModelListItem>[] => [
  {
    id: 'stt',
    header: 'STT',
    cell: ({ row, table }) => {
      const pageIndex = table.getState().pagination.pageIndex;
      const pageSize = table.getState().pagination.pageSize;
      return <div className="font-medium">{pageIndex * pageSize + row.index + 1}</div>;
    },
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Tên Model</span>
        <SortButton column={column} label="Sắp xếp theo tên" />
      </div>
    ),
    cell: ({ row }) => {
      const name = row.getValue('name') as string;
      const isActive = row.original.isActive;
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{name}</span>
          {isActive && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Đang dùng
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'version',
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Phiên bản</span>
        <SortButton column={column} label="Sắp xếp theo phiên bản" />
      </div>
    ),
    cell: ({ row }) => <span className="text-sm">{row.getValue('version')}</span>,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <CheckboxFilterHeader column={column} title="Trạng thái" options={STATUS_OPTIONS} />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as YoloModelStatus;
      const config = STATUS_CONFIG[status];
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
          {config.label}
        </span>
      );
    },
    filterFn: (row, id, value) => {
      if (!value || value.length === 0) return true;
      return value.includes(row.getValue(id));
    },
    sortingFn: 'text',
  },
  {
    accessorKey: 'description',
    header: 'Mô tả',
    cell: ({ row }) => {
      const desc = row.getValue('description') as string | undefined;
      return <span className="text-sm text-muted-foreground line-clamp-2">{desc || '-'}</span>;
    },
  },
  {
    accessorKey: 'fileName',
    header: 'Tên file',
    cell: ({ row }) => <span className="text-xs font-mono truncate">{row.getValue('fileName')}</span>,
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
      const date = new Date(row.getValue('createdAt') as string);
      return <span className="text-sm">{date.toLocaleString('vi-VN')}</span>;
    },
  },
  {
    id: 'actions',
    header: 'Hành động',
    cell: ({ row }) => {
      const isDefault = row.original.isDefault;
      const isActive = row.original.isActive;

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
            {!isDefault && actions.onView && (
              <DropdownMenuItem onClick={() => actions.onView?.(row.original.id)}>
                Xem chi tiết
              </DropdownMenuItem>
            )}
            {isDefault && actions.onActivate && (
              <DropdownMenuItem onClick={() => actions.onActivate?.(row.original.id)}>
                Kích hoạt Model mặc định
              </DropdownMenuItem>
            )}
            {!isDefault && !isActive && actions.onActivate && (
              <DropdownMenuItem onClick={() => actions.onActivate?.(row.original.id)}>
                Kích hoạt
              </DropdownMenuItem>
            )}
            {!isDefault && isActive && actions.onDeactivate && (
              <DropdownMenuItem onClick={() => actions.onDeactivate?.(row.original.id)}>
                Hủy kích hoạt
              </DropdownMenuItem>
            )}
            {!isDefault && actions.onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => actions.onDelete?.(row.original.id)}
                  className="text-destructive"
                >
                  Xóa
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableHiding: false,
  },
];
