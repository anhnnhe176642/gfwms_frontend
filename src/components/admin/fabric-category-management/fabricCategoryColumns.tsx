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
import type { FabricCategoryListItem } from "@/types/fabricCategory"
import { SortButton } from "@/components/admin/table/SortButton"
import { DateRangeFilterHeader } from "@/components/admin/table/DateRangeFilterHeader"

export type FabricCategoryColumnActions = {
  onView?: (categoryId: number) => void
  onEdit?: (categoryId: number) => void
  onDelete?: (categoryId: number) => void
}

export const createFabricCategoryColumns = (
  actions: FabricCategoryColumnActions
): ColumnDef<FabricCategoryListItem>[] => [
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
        <span className="font-medium">Tên danh mục</span>
        <SortButton column={column} label="Sắp xếp theo tên danh mục" />
      </div>
    ),
    meta: {
      title: "Tên danh mục"
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
    cell: ({ row }) => row.getValue("description") || "-",
    meta: {
      title: "Mô tả"
    }
  },
  {
    accessorKey: "sellingPricePerMeter",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Giá bán/mét</span>
        <SortButton column={column} label="Sắp xếp theo giá bán/mét" />
      </div>
    ),
    cell: ({ row }) => {
      const price = row.getValue("sellingPricePerMeter") as number | undefined
      return price ? `${price.toLocaleString('vi-VN')} ₫` : "-"
    },
    meta: {
      title: "Giá bán/mét"
    }
  },
  {
    accessorKey: "sellingPricePerRoll",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Giá bán/cuộn</span>
        <SortButton column={column} label="Sắp xếp theo giá bán/cuộn" />
      </div>
    ),
    cell: ({ row }) => {
      const price = row.getValue("sellingPricePerRoll") as number | undefined
      return price ? `${price.toLocaleString('vi-VN')} ₫` : "-"
    },
    meta: {
      title: "Giá bán/cuộn"
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
      const category = row.original

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
                onClick={() => actions.onView?.(category.id)}
              >
                Xem chi tiết
              </DropdownMenuItem>
            )}

            {actions.onEdit && (
              <DropdownMenuItem
                onClick={() => actions.onEdit?.(category.id)}
              >
                Chỉnh sửa
              </DropdownMenuItem>
            )}
            
            {actions.onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => actions.onDelete?.(category.id)}
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
