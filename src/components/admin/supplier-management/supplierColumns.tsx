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
import type { SupplierListItem } from "@/types/supplier"
import { SortButton } from "@/components/admin/table/SortButton"
import { DateRangeFilterHeader } from "@/components/admin/table/DateRangeFilterHeader"

export type SupplierColumnActions = {
  onView?: (supplierId: number) => void
  onEdit?: (supplierId: number) => void
  onDelete?: (supplierId: number) => void
}

export const createSupplierColumns = (
  actions: SupplierColumnActions
): ColumnDef<SupplierListItem>[] => [
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
        <span className="font-medium">Tên nhà cung cấp</span>
        <SortButton column={column} label="Sắp xếp theo tên" />
      </div>
    ),
    meta: {
      title: "Tên nhà cung cấp"
    }
  },
  {
    accessorKey: "address",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Địa chỉ</span>
        <SortButton column={column} label="Sắp xếp theo địa chỉ" />
      </div>
    ),
    cell: ({ row }) => {
      const address = row.getValue("address") as string
      return <div className="max-w-md truncate" title={address}>{address}</div>
    },
    meta: {
      title: "Địa chỉ"
    }
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Số điện thoại</span>
        <SortButton column={column} label="Sắp xếp theo số điện thoại" />
      </div>
    ),
    meta: {
      title: "Số điện thoại"
    }
  },
  {
    accessorKey: "isActive",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Trạng thái</span>
        <SortButton column={column} label="Sắp xếp theo trạng thái" />
      </div>
    ),
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            isActive 
              ? "bg-green-100 text-green-700" 
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {isActive ? "Hoạt động" : "Ngừng hoạt động"}
        </span>
      )
    },
    meta: {
      title: "Trạng thái"
    }
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DateRangeFilterHeader column={column} title="Ngày tạo" />
    ),
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
      const supplier = row.original

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
                onClick={() => actions.onView?.(supplier.id)}
              >
                Xem chi tiết
              </DropdownMenuItem>
            )}

            {actions.onEdit && (
              <DropdownMenuItem
                onClick={() => actions.onEdit?.(supplier.id)}
              >
                Chỉnh sửa
              </DropdownMenuItem>
            )}
            
            {actions.onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => actions.onDelete?.(supplier.id)}
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
