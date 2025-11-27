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
import type { ExportFabricListItem } from "@/types/exportFabric"
import { SortButton } from "@/components/admin/table/SortButton"
import { CheckboxFilterHeader } from "@/components/admin/table/CheckboxFilterHeader"
import { InfiniteScrollWarehouseFilter } from "@/components/admin/table/InfiniteScrollWarehouseFilter"
import { InfiniteScrollStoreFilter } from "@/components/admin/table/InfiniteScrollStoreFilter"
import { ExportFabricStatusBadge } from "@/components/admin/table/Badges"
import { EXPORT_FABRIC_STATUS_OPTIONS } from "@/constants/exportFabric"

export type ExportFabricColumnActions = {
  onView?: (exportFabricId: number) => void
  onEdit?: (exportFabricId: number) => void
  onDelete?: (exportFabricId: number) => void
  hideWarehouseColumn?: boolean
}

export const createExportFabricColumns = (
  { onView, hideWarehouseColumn }: ExportFabricColumnActions
): ColumnDef<ExportFabricListItem>[] => {
  const columns: ColumnDef<ExportFabricListItem>[] = [
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
          <span className="font-medium">ID Phiếu</span>
          <SortButton column={column} label="Sắp xếp theo ID" />
        </div>
      ),
      cell: ({ row }) => <span className="font-mono text-sm">#{row.getValue("id")}</span>,
      meta: {
        title: "ID Phiếu"
      }
    },
    ...(hideWarehouseColumn ? [] : [{
      accessorKey: "warehouse",
      header: ({ column }) => (
        <InfiniteScrollWarehouseFilter column={column} title="Kho xuất" />
      ),
      cell: ({ row }) => {
        const warehouse = row.getValue("warehouse") as ExportFabricListItem['warehouse']
        return warehouse?.name || "-"
      },
      filterFn: (row, id, value) => {
        if (!value || value.length === 0) return true
        const warehouse = (row.getValue(id) as ExportFabricListItem['warehouse'])
        return value.includes(String(warehouse?.id))
      },
      sortingFn: "text",
      meta: {
        title: "Kho xuất"
      }
    } as ColumnDef<ExportFabricListItem>]),
    {
      accessorKey: "store",
      header: ({ column }) => (
        <InfiniteScrollStoreFilter column={column} title="Cửa hàng nhận" />
      ),
      cell: ({ row }) => {
        const store = row.getValue("store") as ExportFabricListItem['store']
        return store?.name || "-"
      },
      filterFn: (row, id, value) => {
        if (!value || value.length === 0) return true
        const store = (row.getValue(id) as ExportFabricListItem['store'])
        return value.includes(String(store?.id))
      },
      sortingFn: "text",
      meta: {
        title: "Cửa hàng nhận"
      }
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <CheckboxFilterHeader 
          column={column} 
          title="Trạng thái" 
          options={EXPORT_FABRIC_STATUS_OPTIONS} 
        />
      ),
      cell: ({ row }) => <ExportFabricStatusBadge status={row.getValue("status")} />,
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
      accessorKey: "createdBy",
      header: "Người tạo",
      cell: ({ row }) => {
        const createdBy = row.getValue("createdBy") as ExportFabricListItem['createdBy']
        return createdBy?.username || "-"
      },
      meta: {
        title: "Người tạo"
      }
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <div className="flex items-center gap-1">
          <span className="font-medium">Ngày tạo</span>
          <SortButton column={column} label="Sắp xếp theo ngày tạo" />
        </div>
      ),
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string
        return date ? new Date(date).toLocaleString('vi-VN') : '-'
      },
      meta: {
        title: "Ngày tạo"
      }
    },
    {
      accessorKey: "note",
      header: "Ghi chú",
      cell: ({ row }) => {
        const note = row.getValue("note") as string | null
        return note ? (
          <div className="max-w-xs truncate text-sm text-muted-foreground" title={note}>
            {note}
          </div>
        ) : (
          "-"
        )
      },
      meta: {
        title: "Ghi chú"
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
        const exportFabric = row.original

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
              
              {onView && (
                <DropdownMenuItem
                  onClick={() => onView?.(exportFabric.id)}
                >
                  Xem chi tiết
                </DropdownMenuItem>
              )}

              {/* {actions.onEdit && (
                <DropdownMenuItem
                  onClick={() => actions.onEdit?.(exportFabric.id)}
                >
                  Chỉnh sửa
                </DropdownMenuItem>
              )}
              
              {actions.onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => actions.onDelete?.(exportFabric.id)}
                    className="text-red-600"
                  >
                    Xóa
                  </DropdownMenuItem>
                </>
              )} */}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return columns
}
