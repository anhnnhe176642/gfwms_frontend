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
    id: "fabricInfo.categoryId",
    accessorKey: "fabricInfo.category",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Loại vải</span>
        <SortButton column={column} label="Sắp xếp theo loại vải" />
      </div>
    ),
    cell: ({ row }) => row.original.fabricInfo.category,
    sortingFn: "text",
    meta: {
      title: "Loại vải"
    }
  },
  {
    id: "fabricInfo.colorId",
    accessorKey: "fabricInfo.color",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Màu sắc</span>
        <SortButton column={column} label="Sắp xếp theo màu sắc" />
      </div>
    ),
    cell: ({ row }) => row.original.fabricInfo.color,
    sortingFn: "text",
    meta: {
      title: "Màu sắc"
    }
  },
  {
    id: "fabricInfo.gloss",
    accessorKey: "fabricInfo.gloss",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Độ bóng</span>
        <SortButton column={column} label="Sắp xếp theo độ bóng" />
      </div>
    ),
    cell: ({ row }) => row.original.fabricInfo.gloss,
    sortingFn: "text",
    meta: {
      title: "Độ bóng"
    }
  },
  {
    id: "fabricInfo.supplier",
    accessorKey: "fabricInfo.supplier",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Nhà cung cấp</span>
        <SortButton column={column} label="Sắp xếp theo nhà cung cấp" />
      </div>
    ),
    cell: ({ row }) => row.original.fabricInfo.supplier,
    sortingFn: "text",
    meta: {
      title: "Nhà cung cấp"
    }
  },
  {
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
    meta: {
      title: "Cuộn chưa cắt"
    }
  },
  {
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
    meta: {
      title: "Tổng mét"
    }
  },
  {
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
    meta: {
      title: "Giá bán/cuộn"
    }
  },
  {
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
    meta: {
      title: "Giá trị tồn"
    }
  },
  {
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
