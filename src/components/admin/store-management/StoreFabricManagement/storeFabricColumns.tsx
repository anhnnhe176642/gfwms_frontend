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
import type { StoreFabricListItem } from "@/types/storeFabric"
import { SortButton } from "@/components/admin/table/SortButton"
import { InfiniteScrollCategoryFilter } from "@/components/admin/table/InfiniteScrollCategoryFilter"
import { InfiniteScrollColorFilter } from "@/components/admin/table/InfiniteScrollColorFilter"
import { InfiniteScrollGlossFilter } from "@/components/admin/table/InfiniteScrollGlossFilter"
import { InfiniteScrollSupplierFilter } from "@/components/admin/table/InfiniteScrollSupplierFilter"

export type StoreFabricColumnActions = {
  onView?: (fabricId: number) => void
  onDelete?: (fabricId: number) => void
}

export const createStoreFabricColumns = (
  actions: StoreFabricColumnActions
): ColumnDef<StoreFabricListItem>[] => [
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
    id: "category",
    accessorKey: "fabricInfo.category",
    header: ({ column }) => (
      <InfiniteScrollCategoryFilter column={column} title="Loại vải" />
    ),
    cell: ({ row }) => row.original.fabricInfo.category,
    filterFn: (row, id, value) => {
      if (!value || value.length === 0) return true
      const categoryId = row.original.fabricInfo.categoryId
      return value.includes(String(categoryId))
    },
    sortingFn: "text",
    meta: {
      title: "Loại vải"
    }
  },
  {
    id: "color",
    accessorKey: "fabricInfo.color",
    header: ({ column }) => (
      <InfiniteScrollColorFilter column={column} title="Màu sắc" />
    ),
    cell: ({ row }) => row.original.fabricInfo.color,
    filterFn: (row, id, value) => {
      if (!value || value.length === 0) return true
      const colorId = row.original.fabricInfo.colorId
      return value.includes(colorId)
    },
    sortingFn: "text",
    meta: {
      title: "Màu sắc"
    }
  },
  {
    id: "gloss",
    accessorKey: "fabricInfo.gloss",
    header: ({ column }) => (
      <InfiniteScrollGlossFilter column={column} title="Độ bóng" />
    ),
    cell: ({ row }) => row.original.fabricInfo.gloss,
    filterFn: (row, id, value) => {
      if (!value || value.length === 0) return true
      const glossId = row.original.fabricInfo.glossId
      return value.includes(String(glossId))
    },
    sortingFn: "text",
    meta: {
      title: "Độ bóng"
    }
  },
  {
    id: "supplier",
    accessorKey: "fabricInfo.supplier",
    header: ({ column }) => (
      <InfiniteScrollSupplierFilter column={column} title="Nhà cung cấp" />
    ),
    cell: ({ row }) => row.original.fabricInfo.supplier,
    filterFn: (row, id, value) => {
      if (!value || value.length === 0) return true
      const supplierId = row.original.fabricInfo.supplierId
      return value.includes(String(supplierId))
    },
    sortingFn: "text",
    meta: {
      title: "Nhà cung cấp"
    }
  },
  {
    id: "uncutRolls",
    accessorKey: "inventory.uncutRolls",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Cuộn chưa cắt</span>
        <SortButton column={column} label="Sắp xếp theo cuộn chưa cắt" />
      </div>
    ),
    cell: ({ row }) => {
      const uncutRolls = row.original.inventory.uncutRolls
      return new Intl.NumberFormat('vi-VN').format(uncutRolls)
    },
    sortingFn: "auto",
    meta: {
      title: "Cuộn chưa cắt"
    }
  },
  {
    id: "totalMeters",
    accessorKey: "inventory.totalMeters",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Tổng mét</span>
        <SortButton column={column} label="Sắp xếp theo tổng mét" />
      </div>
    ),
    cell: ({ row }) => {
      const meters = row.original.inventory.totalMeters
      return new Intl.NumberFormat('vi-VN', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }).format(meters) + ' m'
    },
    sortingFn: "auto",
    meta: {
      title: "Tổng mét"
    }
  },
  {
    id: "sellingPrice",
    accessorKey: "fabricInfo.sellingPrice",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Giá bán/cuộn</span>
        <SortButton column={column} label="Sắp xếp theo giá bán" />
      </div>
    ),
    cell: ({ row }) => {
      const price = row.original.fabricInfo.sellingPrice
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(price)
    },
    sortingFn: "auto",
    meta: {
      title: "Giá bán/cuộn"
    }
  },
  {
    id: "totalValue",
    accessorKey: "inventory.totalValue",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Giá trị tồn</span>
        <SortButton column={column} label="Sắp xếp theo giá trị tồn" />
      </div>
    ),
    cell: ({ row }) => {
      const value = row.original.inventory.totalValue
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(value)
    },
    sortingFn: "auto",
    meta: {
      title: "Giá trị tồn"
    }
  },
  {
    id: "cuttingRollMeters",
    accessorKey: "inventory.cuttingRollMeters",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Mét lẻ</span>
        <SortButton column={column} label="Sắp xếp theo mét lẻ" />
      </div>
    ),
    cell: ({ row }) => {
      const meters = row.original.inventory.cuttingRollMeters
      return new Intl.NumberFormat('vi-VN', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }).format(meters) + ' m'
    },
    sortingFn: "auto",
    meta: {
      title: "Mét lẻ"
    }
  },
  {
    id: "actions",
    header: "Thao tác",
    cell: ({ row }) => {
      const fabricId = row.original.fabricId

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Mở menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
            {actions.onView && (
              <>
                <DropdownMenuItem onClick={() => actions.onView?.(fabricId)}>
                  Xem chi tiết
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            {actions.onDelete && (
              <DropdownMenuItem
                onClick={() => actions.onDelete?.(fabricId)}
                className="text-red-600"
              >
                Xóa
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    meta: {
      title: "Thao tác"
    }
  },
]
