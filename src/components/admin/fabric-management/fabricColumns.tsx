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
import type { FabricListItem } from "@/types/fabric"
import { SortButton } from "@/components/admin/table/SortButton"
import { DateRangeFilterHeader } from "@/components/admin/table/DateRangeFilterHeader"

export type FabricColumnActions = {
  onDelete?: (fabricId: number) => void
}

export const createFabricColumns = (
  actions: FabricColumnActions
): ColumnDef<FabricListItem>[] => [
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
    id: "categoryName",
    accessorKey: "category.name",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Loại vải</span>
        <SortButton column={column} label="Sắp xếp theo loại vải" />
      </div>
    ),
    cell: ({ row }) => row.original.category.name,
    meta: {
      title: "Loại vải"
    }
  },
  {
    id: "colorName",
    accessorKey: "color.name",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Màu sắc</span>
        <SortButton column={column} label="Sắp xếp theo màu sắc" />
      </div>
    ),
    cell: ({ row }) => row.original.color.name,
    meta: {
      title: "Màu sắc"
    }
  },
  {
    id: "glossDescription",
    accessorKey: "gloss.description",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Độ bóng</span>
        <SortButton column={column} label="Sắp xếp theo độ bóng" />
      </div>
    ),
    cell: ({ row }) => row.original.gloss.description,
    meta: {
      title: "Độ bóng"
    }
  },
  {
    id: "supplierName",
    accessorKey: "supplier.name",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Nhà cung cấp</span>
        <SortButton column={column} label="Sắp xếp theo nhà cung cấp" />
      </div>
    ),
    cell: ({ row }) => row.original.supplier.name,
    meta: {
      title: "Nhà cung cấp"
    }
  },
  {
    accessorKey: "quantityInStock",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Số lượng tồn</span>
        <SortButton column={column} label="Sắp xếp theo số lượng tồn" />
      </div>
    ),
    cell: ({ row }) => {
      const quantity = row.getValue("quantityInStock") as number
      return new Intl.NumberFormat('vi-VN').format(quantity)
    },
    meta: {
      title: "Số lượng tồn"
    }
  },
  {
    accessorKey: "sellingPrice",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Giá bán/cuộn</span>
        <SortButton column={column} label="Sắp xếp theo Giá bán/cuộn" />
      </div>
    ),
    cell: ({ row }) => {
      const price = row.getValue("sellingPrice") as number
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
    accessorKey: "weight",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Trọng lượng (kg)</span>
        <SortButton column={column} label="Sắp xếp theo trọng lượng" />
      </div>
    ),
    cell: ({ row }) => {
      const weight = row.getValue("weight") as number
      return weight.toFixed(2)
    },
    meta: {
      title: "Trọng lượng (kg)"
    }
  },
  {
    accessorKey: "length",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Chiều dài (m)</span>
        <SortButton column={column} label="Sắp xếp theo chiều dài" />
      </div>
    ),
    cell: ({ row }) => {
      const length = row.getValue("length") as number
      return length.toFixed(2)
    },
    meta: {
      title: "Chiều dài (m)"
    }
  },
  {
    accessorKey: "width",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Chiều rộng (m)</span>
        <SortButton column={column} label="Sắp xếp theo chiều rộng" />
      </div>
    ),
    cell: ({ row }) => {
      const width = row.getValue("width") as number
      return width.toFixed(2)
    },
    meta: {
      title: "Chiều rộng (m)"
    }
  },
  {
    accessorKey: "thickness",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Độ dày (mm)</span>
        <SortButton column={column} label="Sắp xếp theo độ dày" />
      </div>
    ),
    cell: ({ row }) => {
      const thickness = row.getValue("thickness") as number
      return thickness.toFixed(2)
    },
    meta: {
      title: "Độ dày (mm)"
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
    sortingFn: "datetime",
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
      const fabric = row.original

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
            {actions.onDelete && (
              <DropdownMenuItem
                onClick={() => actions.onDelete?.(fabric.id)}
                className="text-red-600"
              >
                Xóa
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  },
]
