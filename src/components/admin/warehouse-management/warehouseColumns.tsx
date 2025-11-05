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
import type { WarehouseListItem, WarehouseStatus } from "@/types/warehouse"
import { SortButton } from "@/components/admin/table/SortButton"
import { CheckboxFilterHeader } from "@/components/admin/table/CheckboxFilterHeader"
import { DateRangeFilterHeader } from "@/components/admin/table/DateRangeFilterHeader"
import { StatusBadge } from "@/components/admin/table/Badges"
import { WAREHOUSE_STATUS_OPTIONS } from "@/constants/warehouse"

export type WarehouseColumnActions = {
  onStatusChange: (warehouseId: number, status: WarehouseStatus) => void
  onDelete: (warehouseId: number) => void
}

export const createWarehouseColumns = (
  actions?: WarehouseColumnActions
): ColumnDef<WarehouseListItem>[] => [
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
        <span className="font-medium">Tên kho</span>
        <SortButton column={column} label="Sắp xếp theo tên kho" />
      </div>
    ),
    meta: {
      title: "Tên kho"
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
    cell: ({ row }) => row.getValue("address") || "-",
    meta: {
      title: "Địa chỉ"
    }
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <CheckboxFilterHeader column={column} title="Trạng thái" options={WAREHOUSE_STATUS_OPTIONS} />
    ),
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
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
      const warehouse = row.original

      if (!actions) {
        return null
      }

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
            
            <DropdownMenuLabel className="text-xs font-normal text-gray-500">
              Thay đổi trạng thái
            </DropdownMenuLabel>
            {WAREHOUSE_STATUS_OPTIONS.map((status) => (
              <DropdownMenuItem
                key={status.value}
                onClick={() => actions.onStatusChange(warehouse.id, status.value)}
                disabled={warehouse.status === status.value}
              >
                {status.label}
              </DropdownMenuItem>
            ))}
            
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => actions.onDelete(warehouse.id)}
              className="text-red-600"
            >
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
