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
import type { ShelfListItem } from "@/types/warehouse"
import { SortButton } from "@/components/admin/table/SortButton"
import { DateRangeFilterHeader } from "@/components/admin/table/DateRangeFilterHeader"

export type ShelfColumnActions = {
  onDelete?: (shelfId: number) => void
  onEdit?: (shelfId: number) => void
  onView?: (shelfId: number) => void
}

export const createShelfColumns = (
  actions: ShelfColumnActions
): ColumnDef<ShelfListItem>[] => [
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
    accessorKey: "code",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Mã kệ</span>
        <SortButton column={column} label="Sắp xếp theo mã kệ" />
      </div>
    ),
    meta: {
      title: "Mã kệ"
    }
  },
  {
    accessorKey: "currentQuantity",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Số lượng hiện tại</span>
        <SortButton column={column} label="Sắp xếp theo số lượng hiện tại" />
      </div>
    ),
    cell: ({ row }) => {
      const current = row.getValue("currentQuantity") as number
      return <div className="text-center">{current}</div>
    },
    meta: {
      title: "Số lượng hiện tại"
    }
  },
  {
    accessorKey: "maxQuantity",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Sức chứa tối đa</span>
        <SortButton column={column} label="Sắp xếp theo sức chứa tối đa" />
      </div>
    ),
    cell: ({ row }) => {
      const max = row.getValue("maxQuantity") as number
      return <div className="text-center">{max}</div>
    },
    meta: {
      title: "Sức chứa tối đa"
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
    sortingFn: "datetime", // Enable datetime sorting
    meta: {
      title: "Ngày tạo"
    }
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Ngày cập nhật</span>
        <SortButton column={column} label="Sắp xếp theo ngày cập nhật" />
      </div>
    ),
    cell: ({ row }) => {
      const date = row.getValue("updatedAt") as string
      return date ? new Date(date).toLocaleString('vi-VN') : '-'
    },
    meta: {
      title: "Ngày cập nhật"
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
      const shelf = row.original

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
              <DropdownMenuItem
                onClick={() => actions.onView?.(shelf.id)}
              >
                Xem chi tiết
              </DropdownMenuItem>
            )}
            {actions.onEdit && (
              <DropdownMenuItem
                onClick={() => actions.onEdit?.(shelf.id)}
              >
                Chỉnh sửa
              </DropdownMenuItem>
            )}
            {actions.onDelete && (
              <DropdownMenuItem
                onClick={() => actions.onDelete?.(shelf.id)}
                className="text-red-600"
              >
                Xóa
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
