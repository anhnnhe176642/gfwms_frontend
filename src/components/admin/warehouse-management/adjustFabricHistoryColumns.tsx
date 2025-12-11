"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { AdjustFabricHistoryItem } from "@/types/warehouse"
import { SortButton } from "@/components/admin/table/SortButton"
import { DateRangeFilterHeader } from "@/components/admin/table/DateRangeFilterHeader"
import { InfiniteScrollCategoryFilter } from "@/components/admin/table/InfiniteScrollCategoryFilter"
import { InfiniteScrollColorFilter } from "@/components/admin/table/InfiniteScrollColorFilter"
import { InfiniteScrollSupplierFilter } from "@/components/admin/table/InfiniteScrollSupplierFilter"
import { InfiniteScrollUserFilter } from "@/components/admin/table/InfiniteScrollUserFilter"
import { InfiniteScrollWarehouseFilter } from "@/components/admin/table/InfiniteScrollWarehouseFilter"
import { LocalDataFilter } from "@/components/admin/table/LocalDataFilter"
import { cn } from "@/lib/utils"

export const createAdjustFabricHistoryColumns = (): ColumnDef<AdjustFabricHistoryItem>[] => [
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
    accessorKey: "id",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">ID</span>
        <SortButton column={column} label="Sắp xếp theo ID" />
      </div>
    ),
    cell: ({ row }) => <div className="font-medium">#{row.getValue("id")}</div>,
    meta: {
      title: "ID"
    }
  },
  {
    id: "categoryId",
    accessorFn: (row) => row.fabric.categoryId,
    header: ({ column }) => (
      <InfiniteScrollCategoryFilter column={column} title="Loại vải" />
    ),
    cell: ({ row }) => row.original.fabric.category.name,
    filterFn: (row, id, value) => {
      if (!value || value.length === 0) return true
      const categoryId = row.original.fabric.categoryId
      return value.includes(String(categoryId))
    },
    meta: {
      title: "Loại vải"
    }
  },
  {
    id: "colorId",
    accessorFn: (row) => row.fabric.colorId,
    header: ({ column }) => (
      <InfiniteScrollColorFilter column={column} title="Màu sắc" />
    ),
    cell: ({ row }) => {
      const color = row.original.fabric.color
      return (
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded border border-gray-300"
            style={{ backgroundColor: color.hexCode }}
          />
          <span>{color.name}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      if (!value || value.length === 0) return true
      const colorId = row.original.fabric.colorId
      return value.includes(colorId)
    },
    meta: {
      title: "Màu sắc"
    }
  },
  {
    id: "supplierId",
    accessorFn: (row) => row.fabric.supplierId,
    header: ({ column }) => (
      <InfiniteScrollSupplierFilter column={column} title="Nhà cung cấp" />
    ),
    cell: ({ row }) => row.original.fabric.supplier.name,
    filterFn: (row, id, value) => {
      if (!value || value.length === 0) return true
      const supplierId = row.original.fabric.supplierId
      return value.includes(String(supplierId))
    },
    meta: {
      title: "Nhà cung cấp"
    }
  },
  {
    id: "shelfCode",
    accessorFn: (row) => row.shelf.code,
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Mã kệ</span>
        <SortButton column={column} label="Sắp xếp theo mã kệ" />
      </div>
    ),
    cell: ({ row }) => <div className="font-medium">{row.original.shelf.code}</div>,
    meta: {
      title: "Mã kệ"
    }
  },
  {
    id: "warehouseId",
    accessorFn: (row) => row.shelf.warehouse.id,
    header: ({ column }) => (
      <InfiniteScrollWarehouseFilter column={column} title="Kho" />
    ),
    cell: ({ row }) => row.original.shelf.warehouse.name,
    filterFn: (row, id, value) => {
      if (!value || value.length === 0) return true
      const warehouseId = row.original.shelf.warehouse.id
      return value.includes(String(warehouseId))
    },
    meta: {
      title: "Kho"
    }
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <LocalDataFilter
        column={column}
        title="Loại"
        options={[
          { value: "IMPORT", label: "Nhập" },
          { value: "DESTROY", label: "Hủy" },
        ]}
      />
    ),
    cell: ({ row }) => {
      const type = row.getValue("type") as string
      return (
        <span
          className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            type === "IMPORT"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          )}
        >
          {type === "IMPORT" ? "Nhập" : "Hủy"}
        </span>
      )
    },
    filterFn: (row, id, value) => {
      if (!value || value.length === 0) return true
      const type = row.getValue(id) as string
      return value.includes(type)
    },
    meta: {
      title: "Loại"
    }
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Số lượng</span>
        <SortButton column={column} label="Sắp xếp theo số lượng" />
      </div>
    ),
    cell: ({ row }) => {
      const quantity = row.getValue("quantity") as number
      return <div className="font-mono">{new Intl.NumberFormat('vi-VN').format(quantity)}</div>
    },
    meta: {
      title: "Số lượng"
    }
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Giá</span>
        <SortButton column={column} label="Sắp xếp theo giá" />
      </div>
    ),
    cell: ({ row }) => {
      const price = row.getValue("price") as number
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(price)
    },
    meta: {
      title: "Giá"
    }
  },
  {
    accessorKey: "reason",
    header: "Lý do",
    cell: ({ row }) => {
      const reason = row.getValue("reason") as string
      return (
        <div className="max-w-xs truncate" title={reason}>
          {reason}
        </div>
      )
    },
    meta: {
      title: "Lý do"
    }
  },
  {
    id: "userId",
    accessorFn: (row) => row.userId,
    header: ({ column }) => (
      <InfiniteScrollUserFilter column={column} title="Người thực hiện" />
    ),
    cell: ({ row }) => {
      const user = row.original.user
      return (
        <div>
          <div className="font-medium">{user.fullname}</div>
          <div className="text-xs text-muted-foreground">@{user.username}</div>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      if (!value || value.length === 0) return true
      const userId = row.original.userId
      return value.includes(String(userId))
    },
    meta: {
      title: "Người thực hiện"
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
]
