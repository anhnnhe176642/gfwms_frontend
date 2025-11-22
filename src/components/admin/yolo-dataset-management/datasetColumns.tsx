"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { DatasetListItem } from "@/types/yolo-dataset"
import { SortButton } from "@/components/admin/table/SortButton"
import { CheckboxFilterHeader } from "@/components/admin/table/CheckboxFilterHeader"
import { DateRangeFilterHeader } from "@/components/admin/table/DateRangeFilterHeader"
import { StatusBadge } from "@/components/admin/table/Badges"

const DATASET_STATUS_OPTIONS = [
  { label: 'Hoạt động', value: 'ACTIVE' },
  { label: 'Lưu trữ', value: 'ARCHIVED' },
]

export type DatasetColumnActions = {
  onView?: (datasetId: string | number) => void
  onEdit?: (datasetId: string | number) => void
  onDelete?: (datasetId: string | number) => void
  onLabel?: (datasetId: string | number) => void
}

export const createDatasetColumns = (
  actions: DatasetColumnActions
): ColumnDef<DatasetListItem>[] => [
  {
    id: "stt",
    header: "STT",
    cell: ({ row, table }) => {
      const pageIndex = table.getState().pagination.pageIndex
      const pageSize = table.getState().pagination.pageSize
      return <div className="font-medium">{pageIndex * pageSize + row.index + 1}</div>
    },
    enableHiding: false,
    meta: {
      title: "STT"
    }
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Tên dataset</span>
        <SortButton column={column} label="Sắp xếp theo tên dataset" />
      </div>
    ),
    meta: {
      title: "Tên dataset"
    }
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Mô tả</span>
        <SortButton column={column} label="Sắp xếp theo mô tả" />
      </div>
    ),
    cell: ({ row }) => {
      const description = row.getValue("description") as string | undefined
      return description ? (
        <div className="max-w-xs truncate" title={description}>{description}</div>
      ) : (
        <span className="text-muted-foreground">-</span>
      )
    },
    meta: {
      title: "Mô tả"
    }
  },
  {
    accessorKey: "totalImages",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Tổng ảnh</span>
        <SortButton column={column} label="Sắp xếp theo tổng ảnh" />
      </div>
    ),
    cell: ({ row }) => <span className="font-medium">{row.getValue("totalImages") || row.original.imageCount || 0}</span>,
    meta: {
      title: "Tổng ảnh"
    }
  },
  {
    accessorKey: "totalLabels",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Ảnh được gán nhãn</span>
        <SortButton column={column} label="Sắp xếp theo ảnh được gán nhãn" />
      </div>
    ),
    cell: ({ row }) => {
      const imageCount = (row.original.totalImages ?? row.original.imageCount ?? 0) as number
      const labeledCount = (row.getValue("totalLabels") ?? row.original.labeledCount ?? 0) as number
      const progress = imageCount > 0 ? Math.round((labeledCount / imageCount) * 100) : 0
      
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{labeledCount}/{imageCount}</span>
          <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{progress}%</span>
        </div>
      )
    },
    meta: {
      title: "Ảnh được gán nhãn"
    }
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <CheckboxFilterHeader column={column} title="Trạng thái" options={DATASET_STATUS_OPTIONS} />
    ),
    cell: ({ row }) => <div className="ms-3"><StatusBadge status={row.getValue("status")} /></div>,
    filterFn: (row, id, value) => {
      if (!value || value.length === 0) return true
      return value.includes(row.getValue(id))
    },
    sortingFn: "text",
    meta: {
      title: "Trạng thái"
    }
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DateRangeFilterHeader column={column} title="Ngày tạo" />,
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string
      return date ? new Date(date).toLocaleString('vi-VN') : '-'
    },
    filterFn: (row, id, value) => {
      if (!value || (!value.from && !value.to)) return true
      const rowDate = new Date(row.getValue(id) as string)
      const from = value.from ? new Date(value.from) : null
      const to = value.to ? new Date(value.to) : null

      if (from && to) {
        return rowDate >= from && rowDate <= to
      } else if (from) {
        return rowDate >= from
      } else if (to) {
        return rowDate <= to
      }
      return true
    },
    meta: {
      title: "Ngày tạo"
    }
  },
  {
    id: "actions",
    header: "Hành động",
    enableHiding: false,
    meta: {
      title: "Hành động"
    },
    cell: ({ row }) => {
      const dataset = row.original

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
            
            {actions.onLabel && (
              <DropdownMenuItem
                onClick={() => actions.onLabel?.(dataset.id)}
              >
                Gán nhãn ảnh
              </DropdownMenuItem>
            )}

            {actions.onView && (
              <DropdownMenuItem
                onClick={() => actions.onView?.(dataset.id)}
              >
                Xem chi tiết
              </DropdownMenuItem>
            )}

            {actions.onEdit && (
              <DropdownMenuItem
                onClick={() => actions.onEdit?.(dataset.id)}
              >
                Chỉnh sửa
              </DropdownMenuItem>
            )}
            
            {actions.onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => actions.onDelete?.(dataset.id)}
                  className="text-red-600"
                >
                  Xóa
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
