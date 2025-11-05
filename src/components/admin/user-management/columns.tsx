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
import type { UserListItem, UserStatus } from "@/types/user"
import type { RoleOption } from "@/types/role"
import { SortButton } from "@/components/admin/table/SortButton"
import { CheckboxFilterHeader } from "@/components/admin/table/CheckboxFilterHeader"
import { DateRangeFilterHeader } from "@/components/admin/table/DateRangeFilterHeader"
import { StatusBadge, RoleBadge } from "@/components/admin/table/Badges"
import { USER_STATUS_OPTIONS } from "@/constants/user"

export type UserColumnActions = {
  onStatusChange: (userId: string, status: UserStatus) => void
  onRoleChange: (userId: string, roleName: string) => void
  onDelete: (userId: string) => void
}

export type UserColumnsOptions = {
  roleOptions: RoleOption[];
  roleOptionsLoading?: boolean;
}

export const createUserColumns = (
  actions: UserColumnActions, 
  options: UserColumnsOptions
): ColumnDef<UserListItem>[] => [
  {
    id: "stt",
    header: "STT",
    cell: ({ row, table }) => {
      const pageIndex = table.getState().pagination.pageIndex
      const pageSize = table.getState().pagination.pageSize
      return <div className="font-medium">{pageIndex * pageSize + row.index + 1}</div>
    },
    enableHiding: false, // STT column should always be visible
    meta: {
      title: "STT"
    }
  },
  {
    accessorKey: "username",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Tên người dùng</span>
        <SortButton column={column} label="Sắp xếp theo tên người dùng" />
      </div>
    ),
    meta: {
      title: "Tên người dùng"
    }
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Email</span>
        <SortButton column={column} label="Sắp xếp theo email" />
      </div>
    ),
    meta: {
      title: "Email"
    },
    enableHiding: true,
  },
  {
    accessorKey: "fullname",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Họ tên</span>
        <SortButton column={column} label="Sắp xếp theo họ tên" />
      </div>
    ),
    cell: ({ row }) => row.getValue("fullname") || "-",
    meta: {
      title: "Họ tên"
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
    cell: ({ row }) => row.getValue("phone") || "-",
    meta: {
      title: "Số điện thoại"
    }
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <CheckboxFilterHeader 
        column={column} 
        title="Vai trò" 
        options={options.roleOptions}
        loading={options.roleOptionsLoading}
      />
    ),
    cell: ({ row }) => <RoleBadge role={row.getValue("role")} roleOptions={options.roleOptions} />,
    filterFn: (row, id, value) => {
      if (!value || value.length === 0) return true
      const role = row.getValue(id) as { name: string; description?: string | null };
      return value.includes(role?.name)
    },
    sortingFn: "text", // Enable text sorting
    meta: {
      title: "Vai trò"
    }
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <CheckboxFilterHeader column={column} title="Trạng thái" options={USER_STATUS_OPTIONS} />
    ),
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    filterFn: (row, id, value) => {
      if (!value || value.length === 0) return true
      return value.includes(row.getValue(id))
    },
    sortingFn: "text", // Enable text sorting
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
    sortingFn: "datetime", // Enable datetime sorting
    meta: {
      title: "Ngày tạo"
    }
  },
  {
    id: "actions",
    header: "Hành động",
    enableHiding: false, // Actions column should always be visible
    meta: {
      title: "Hành động"
    },
    cell: ({ row }) => {
      const user = row.original

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
            {USER_STATUS_OPTIONS.map((status) => (
              <DropdownMenuItem
                key={status.value}
                onClick={() => actions.onStatusChange(user.id, status.value)}
                disabled={user.status === status.value}
              >
                {status.label}
              </DropdownMenuItem>
            ))}
            
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-normal text-gray-500">
              Thay đổi vai trò
            </DropdownMenuLabel>
            {options.roleOptionsLoading ? (
              <DropdownMenuItem disabled>
                Đang tải...
              </DropdownMenuItem>
            ) : options.roleOptions.length === 0 ? (
              <DropdownMenuItem disabled>
                Không có vai trò
              </DropdownMenuItem>
            ) : (
              options.roleOptions.map((role) => (
                <DropdownMenuItem
                  key={role.value}
                  onClick={() => actions.onRoleChange(user.id, role.value)}
                  disabled={user.role.name === role.value}
                >
                  {role.label}
                </DropdownMenuItem>
              ))
            )}
            
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => actions.onDelete(user.id)}
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
