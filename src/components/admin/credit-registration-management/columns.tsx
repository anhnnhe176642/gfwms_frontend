"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Lock, LockOpen, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { CreditRegistrationListItem } from "@/types/creditRegistration"
import { SortButton } from "@/components/admin/table/SortButton"
import { CheckboxFilterHeader } from "@/components/admin/table/CheckboxFilterHeader"
import { CreditRegistrationStatusBadge } from "@/components/admin/table/Badges"
import { CREDIT_REGISTRATION_STATUS_OPTIONS } from "@/constants/creditRegistration"

export type CreditRegistrationColumnActions = {
  onView?: (registrationId: number) => void
}

export const createCreditRegistrationColumns = (
  actions: CreditRegistrationColumnActions
): ColumnDef<CreditRegistrationListItem>[] => [
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
    id: "username",
    accessorFn: (row) => row.user.username,
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Tên người dùng</span>
        <SortButton column={column} label="Sắp xếp theo tên người dùng" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.original.user.username}</div>
    ),
  },
  {
    id: "fullname",
    accessorFn: (row) => row.user.fullname,
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Họ tên</span>
        <SortButton column={column} label="Sắp xếp theo họ tên" />
      </div>
    ),
    cell: ({ row }) => row.original.user.fullname,
  },
  {
    id: "email",
    accessorFn: (row) => row.user.email,
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Email</span>
        <SortButton column={column} label="Sắp xếp theo email" />
      </div>
    ),
    cell: ({ row }) => row.original.user.email,
  },
  {
    id: "creditLimit",
    accessorKey: "creditLimit",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Hạn mức</span>
        <SortButton column={column} label="Sắp xếp theo hạn mức" />
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue("creditLimit") as number
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(value)
    },
  },
  {
    id: "creditUsed",
    accessorKey: "creditUsed",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Đã sử dụng</span>
        <SortButton column={column} label="Sắp xếp theo đã sử dụng" />
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue("creditUsed") as number
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(value)
    },
  },
  {
    id: "approver",
    accessorFn: (row) => row.approver?.fullname || "-",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Người duyệt</span>
        <SortButton column={column} label="Sắp xếp theo người duyệt" />
      </div>
    ),
    cell: ({ row }) => row.original.approver?.fullname || "-",
  },
  {
    id: "status",
    accessorKey: "status",
    header: ({ column }) => (
      <div className="flex items-center gap-2">
        <CheckboxFilterHeader
          column={column}
          title="Trạng thái"
          options={CREDIT_REGISTRATION_STATUS_OPTIONS}
        />
      </div>
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as CreditRegistrationListItem['status']
      return <CreditRegistrationStatusBadge status={status} />
    },
  },
  {
    id: "isLocked",
    accessorKey: "isLocked",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Khóa</span>
        <SortButton column={column} label="Sắp xếp theo trạng thái khóa" />
      </div>
    ),
    cell: ({ row }) => {
      const isLocked = row.getValue("isLocked") as boolean
      return (
        <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md w-fit">
          {isLocked ? (
            <>
              <Lock className="h-3.5 w-3.5" />
              <span>Khóa</span>
            </>
          ) : (
            <>
              <LockOpen className="h-3.5 w-3.5" />
              <span>Mở</span>
            </>
          )}
        </span>
      )
    },
  },
  {
    id: "approvalDate",
    accessorKey: "approvalDate",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Ngày duyệt</span>
        <SortButton column={column} label="Sắp xếp theo ngày duyệt" />
      </div>
    ),
    cell: ({ row }) => {
      const date = row.getValue("approvalDate") as string | null
      if (!date) return "-"
      return new Date(date).toLocaleDateString("vi-VN")
    },
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Ngày tạo</span>
        <SortButton column={column} label="Sắp xếp theo ngày tạo" />
      </div>
    ),
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string
      return new Date(date).toLocaleDateString("vi-VN")
    },
  },
  {
    id: "actions",
    header: "Hành động",
    enableHiding: false,
    meta: {
      title: "Hành động"
    },
    cell: ({ row }) => {
      const registration = row.original

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
                onClick={() => actions.onView?.(registration.id)}
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
