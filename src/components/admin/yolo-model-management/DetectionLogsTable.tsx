'use client';

import { useMemo, useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataTablePagination } from '@/components/common/DataTablePagination';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { YoloDetectionLog } from '@/types/yolo-model';

export interface DetectionLogsTableProps {
  logs: YoloDetectionLog[];
  isLoading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  onPageChange?: (page: number) => void;
  onSortChange?: (sortBy: string, order: 'asc' | 'desc') => void;
}

const SortButton = ({ column }: { column: any }) => {
  if (!column.getCanSort()) {
    return <span className="text-muted-foreground">↕️</span>;
  }

  const sorted = column.getIsSorted();
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 data-[state=open]:bg-accent"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      {sorted === 'desc' ? (
        <ArrowDown className="ml-2 h-4 w-4" />
      ) : sorted === 'asc' ? (
        <ArrowUp className="ml-2 h-4 w-4" />
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4" />
      )}
    </Button>
  );
};

export function DetectionLogsTable({
  logs,
  isLoading = false,
  pagination,
  onPageChange,
  onSortChange,
}: DetectionLogsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<YoloDetectionLog>[] = useMemo(
    () => [
      {
        id: 'imagePath',
        accessorKey: 'imagePath',
        header: 'Tên ảnh',
        cell: ({ row }) => (
          <div className="text-sm">
            <code className="px-2 py-1 bg-muted rounded text-xs break-all">
              {row.original.imagePath}
            </code>
          </div>
        ),
      },
      {
        id: 'totalObjects',
        accessorKey: 'totalObjects',
        header: 'Số đối tượng',
        cell: ({ row }) => (
          <div className="text-center font-medium">{row.original.totalObjects}</div>
        ),
      },
      {
        id: 'confidence',
        accessorKey: 'confidence',
        header: 'Độ tin cậy',
        cell: ({ row }) => (
          <div className="text-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {(row.original.confidence * 100).toFixed(1)}%
            </span>
          </div>
        ),
      },
      {
        id: 'detectionTime',
        accessorKey: 'detectionTime',
        header: 'Thời gian phát hiện',
        cell: ({ row }) => (
          <div className="text-center text-sm">
            {row.original.detectionTime.toFixed(2)}ms
          </div>
        ),
      },
      {
        id: 'detectedAt',
        accessorKey: 'detectedAt',
        header: 'Ngày phát hiện',
        cell: ({ row }) => (
          <div className="text-sm">
            {new Date(row.original.detectedAt).toLocaleString('vi-VN')}
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: logs,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lịch sử phát hiện</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="h-12">
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center gap-1">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <SortButton column={header.column} />
                          )}
                        </div>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {pagination && (
          <DataTablePagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            hasNextPage={pagination.hasNext}
            hasPreviousPage={pagination.hasPrev}
            onPageChange={onPageChange || (() => {})}
          />
        )}
      </CardContent>
    </Card>
  );
}
