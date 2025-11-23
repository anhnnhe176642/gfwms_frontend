'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IMAGE_STATUS_CONFIG } from '@/constants/yolo-dataset';
import { SortButton } from '@/components/admin/table/SortButton';
import { CheckboxFilterHeader } from '@/components/admin/table/CheckboxFilterHeader';
import { DateRangeFilterHeader } from '@/components/admin/table/DateRangeFilterHeader';
import type { DatasetImage } from '@/types/yolo-dataset';
import { Eye, Download, ImageOff, MoreHorizontal, Tag, Trash2, CheckCircle } from 'lucide-react';
import Image from 'next/image';

const IMAGE_STATUS_OPTIONS = [
  { label: 'Chờ xử lý', value: 'PENDING' },
  { label: 'Đang xử lý', value: 'PROCESSING' },
  { label: 'Hoàn thành', value: 'COMPLETED' },
  { label: 'Thất bại', value: 'FAILED' },
];

export type DatasetImageColumnActions = {
  onView?: (imageId: string) => void;
  onDownload?: (imageId: string) => void;
  onLabel?: (imageId: string) => void;
  onUpdateStatus?: (imageId: string) => void;
  onDelete?: (imageId: string) => void;
};

export function createDatasetImageColumns(
  actions?: DatasetImageColumnActions
): ColumnDef<DatasetImage>[] {
  return [
    {
      accessorKey: 'imageUrl',
      header: ({ column }) => (
        <div className="font-medium">Ảnh xem trước</div>
      ),
      cell: ({ row }) => {
        const imageUrl = row.getValue('imageUrl') as string | undefined;

        if (!imageUrl) {
          return (
            <div className="flex items-center justify-center w-16 h-16 bg-muted rounded">
              <ImageOff className="h-4 w-4 text-muted-foreground" />
            </div>
          );
        }

        return (
          <div className="relative w-16 h-16 rounded overflow-hidden bg-muted shrink-0">
            <Image
              src={imageUrl}
              alt="preview"
              fill
              className="object-cover"
              sizes="64px"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        );
      },
      enableSorting: false,
      meta: {
        title: 'Ảnh xem trước',
      },
    },
    {
      accessorKey: 'filename',
      header: ({ column }) => (
        <div className="flex items-center gap-1">
          <span className="font-medium">Tên file</span>
          <SortButton column={column} label="Sắp xếp theo tên file" />
        </div>
      ),
      cell: ({ row }) => (
        <div className="max-w-xs truncate font-medium">
          {row.getValue('filename')}
        </div>
      ),
      meta: {
        title: 'Tên file',
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <CheckboxFilterHeader column={column} title="Trạng thái" options={IMAGE_STATUS_OPTIONS} />
      ),
      cell: ({ row }) => {
        const status = row.getValue('status') as DatasetImage['status'];
        return (
          <Badge value={status} config={IMAGE_STATUS_CONFIG} />
        );
      },
      filterFn: (row, id, value) => {
        if (!value || value.length === 0) return true;
        return value.includes(row.getValue(id));
      },
      meta: {
        title: 'Trạng thái',
      },
    },
    {
      accessorKey: 'objectCount',
      header: ({ column }) => (
        <div className="flex items-center gap-1">
          <span className="font-medium">Số đối tượng</span>
          <SortButton column={column} label="Sắp xếp theo số đối tượng" />
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {row.getValue('objectCount')}
        </div>
      ),
      meta: {
        title: 'Số đối tượng',
      },
    },
    {
      accessorKey: 'uploadedByUser.fullname',
      header: ({ column }) => (
        <div className="flex items-center gap-1">
          <span className="font-medium">Người tải lên</span>
          <SortButton column={column} label="Sắp xếp theo người tải lên" />
        </div>
      ),
      cell: ({ row }) => {
        const user = row.original.uploadedByUser;
        return (
          <div className="text-sm">
            {user?.fullname || 'N/A'}
          </div>
        );
      },
      meta: {
        title: 'Người tải lên',
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DateRangeFilterHeader column={column} title="Ngày tạo" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue('createdAt'));
        return (
          <div className="text-sm">
            {date.toLocaleString('vi-VN')}
          </div>
        );
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
        const image = row.original;

        return (
          <div className="flex items-center gap-2">
            {actions?.onView && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => actions.onView?.(image.id)}
                title="Xem chi tiết"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            
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

                {actions?.onLabel && (
                  <DropdownMenuItem onClick={() => actions.onLabel?.(image.id)}>
                    <Tag className="h-4 w-4 mr-2" />
                    Gán nhãn ảnh
                  </DropdownMenuItem>
                )}

                {actions?.onUpdateStatus && (
                  <DropdownMenuItem onClick={() => actions.onUpdateStatus?.(image.id)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Cập nhật trạng thái
                  </DropdownMenuItem>
                )}

                {actions?.onDownload && (
                  <DropdownMenuItem onClick={() => actions.onDownload?.(image.id)}>
                    <Download className="h-4 w-4 mr-2" />
                    Tải xuống
                  </DropdownMenuItem>
                )}

                {actions?.onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => actions.onDelete?.(image.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Xóa ảnh
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
