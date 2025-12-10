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
import type { Role } from "@/types/role"
import { SortButton } from "@/components/admin/table/SortButton"

export type RoleColumnActions = {
  onDelete?: (roleName: string) => void
  onEdit?: (roleName: string) => void
  onView?: (roleName: string) => void
  onDuplicate?: (roleName: string) => void
}

export const createRoleColumns = (
  actions: RoleColumnActions
): ColumnDef<Role>[] => [
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
        <span className="font-medium">Tên vai trò</span>
        <SortButton column={column} label="Sắp xếp theo tên vai trò" />
      </div>
    ),
    meta: {
      title: "Tên vai trò"
    }
  },
  {
    accessorKey: "fullName",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Tên đầy đủ</span>
        <SortButton column={column} label="Sắp xếp theo tên đầy đủ" />
      </div>
    ),
    meta: {
      title: "Tên đầy đủ"
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
      const role = row.original

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
                onClick={() => actions.onView?.(role.name)}
              >
                Xem chi tiết
              </DropdownMenuItem>
            )}
            {actions.onEdit && (
              <DropdownMenuItem
                onClick={() => actions.onEdit?.(role.name)}
              >
                Chỉnh sửa
              </DropdownMenuItem>
            )}
            {actions.onDuplicate && (
              <DropdownMenuItem
                onClick={() => actions.onDuplicate?.(role.name)}
              >
                Sao chép
              </DropdownMenuItem>
            )}
            {actions.onDelete && (
              <DropdownMenuItem
                onClick={() => actions.onDelete?.(role.name)}
                className="text-red-600"
              >
                Xóa
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
