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
import type { ImportFabricListItem } from "@/types/importFabric"
import { ImportFabricStatus } from "@/types/importFabric"
import { SortButton } from "@/components/admin/table/SortButton"
import { DateRangeFilterHeader } from "@/components/admin/table/DateRangeFilterHeader"
import { CheckboxFilterHeader } from "@/components/admin/table/CheckboxFilterHeader"
import { ImportFabricStatusBadge } from "@/components/admin/table/Badges"
import { IMPORT_FABRIC_STATUS_OPTIONS } from "@/constants/importFabric"

export type ImportFabricColumnActions = {
  onView?: (importId: number) => void
  onArrangeShelf?: (importId: number) => void
}

export const createImportFabricColumns = (
  actions: ImportFabricColumnActions = {}
): ColumnDef<ImportFabricListItem>[] => [
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
    accessorKey: "importDate",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Ngày nhập</span>
        <SortButton column={column} label="Sắp xếp theo ngày nhập" />
      </div>
    ),
    cell: ({ row }) => {
      const date = row.getValue("importDate") as string
      return date ? new Date(date).toLocaleString('vi-VN') : '-'
    },
    meta: {
      title: "Ngày nhập"
    }
  },
  {
    id: "importUserId",
    accessorKey: "importUser.fullname",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Người nhập</span>
        <SortButton column={column} label="Sắp xếp theo người nhập" />
      </div>
    ),
    cell: ({ row }) => row.original.importUser?.fullname || '-',
    sortingFn: "text",
    meta: {
      title: "Người nhập"
    }
  },
  {
    accessorKey: "totalPrice",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Tổng giá trị</span>
        <SortButton column={column} label="Sắp xếp theo tổng giá trị" />
      </div>
    ),
    cell: ({ row }) => {
      const price = row.getValue("totalPrice") as number
      return <div>{price.toLocaleString('vi-VN')} ₫</div>
    },
    meta: {
      title: "Tổng giá trị"
    }
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <CheckboxFilterHeader column={column} title="Trạng thái" options={IMPORT_FABRIC_STATUS_OPTIONS} />
    ),
    cell: ({ row }) => {
      const importFabric = row.original
      const isPending = importFabric.status === ImportFabricStatus.PENDING

      return (
        <div className="flex items-center justify-between gap-2">
          <ImportFabricStatusBadge status={row.getValue("status")} />
          {actions.onArrangeShelf && isPending && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => actions.onArrangeShelf?.(importFabric.id)}
              className="text-xs whitespace-nowrap"
            >
              Xếp vào kệ
            </Button>
          )}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      if (!value || value.length === 0) return true
      return value.includes(row.getValue(id))
    },
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
      const importFabric = row.original

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
                onClick={() => actions.onView?.(importFabric.id)}
              >
                Xem chi tiết
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
