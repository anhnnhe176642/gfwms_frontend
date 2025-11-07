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
import type { FabricGlossListItem } from "@/types/fabricGloss"
import { SortButton } from "@/components/admin/table/SortButton"
import { DateRangeFilterHeader } from "@/components/admin/table/DateRangeFilterHeader"

export type FabricGlossColumnActions = {
  onView?: (glossId: number) => void
  onEdit?: (glossId: number) => void
  onDelete?: (glossId: number) => void
}

export const createFabricGlossColumns = (
  actions: FabricGlossColumnActions
): ColumnDef<FabricGlossListItem>[] => [
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
    accessorKey: "description",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Mô tả độ bóng</span>
        <SortButton column={column} label="Sắp xếp theo mô tả độ bóng" />
      </div>
    ),
    meta: {
      title: "Mô tả độ bóng"
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
      const gloss = row.original

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
                onClick={() => actions.onView?.(gloss.id)}
              >
                Xem chi tiết
              </DropdownMenuItem>
            )}

            {actions.onEdit && (
              <DropdownMenuItem
                onClick={() => actions.onEdit?.(gloss.id)}
              >
                Chỉnh sửa
              </DropdownMenuItem>
            )}
            
            {actions.onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => actions.onDelete?.(gloss.id)}
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
