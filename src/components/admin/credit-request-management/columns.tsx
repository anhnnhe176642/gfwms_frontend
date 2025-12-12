"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Eye, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { CreditRequestListItem, CreditRequestStatus } from "@/types/creditRequest"
import { SortButton } from "@/components/admin/table/SortButton"
import { CheckboxFilterHeader } from "@/components/admin/table/CheckboxFilterHeader"
import { CreditRequestStatusBadge, CreditRequestTypeBadge } from "@/components/admin/table/Badges"
import { CREDIT_REQUEST_STATUS_OPTIONS, CREDIT_REQUEST_TYPE_OPTIONS } from "@/constants/creditRequest"
import { useRouter } from "next/navigation"

export type CreditRequestColumnActions = {
  onApprove: (requestId: number) => void
  onReject: (requestId: number) => void
}

export const createCreditRequestColumns = (
  actions: CreditRequestColumnActions
): ColumnDef<CreditRequestListItem>[] => [
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
    cell: ({ row }) => row.original.user.username,
    meta: {
      title: "Tên người dùng"
    }
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
    meta: {
      title: "Email"
    },
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
    cell: ({ row }) => row.original.user.fullname || "-",
    meta: {
      title: "Họ tên"
    }
  },
  {
    accessorKey: "requestLimit",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Hạn mức mong muốn</span>
        <SortButton column={column} label="Sắp xếp theo hạn mức" />
      </div>
    ),
    cell: ({ row }) => {
      const limit = row.getValue("requestLimit") as number
      return <div className="font-medium">{limit.toLocaleString('vi-VN')} VND</div>
    },
    meta: {
      title: "Hạn mức mong muốn"
    }
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <CheckboxFilterHeader column={column} title="Loại yêu cầu" options={CREDIT_REQUEST_TYPE_OPTIONS} />
    ),
    cell: ({ row }) => <CreditRequestTypeBadge type={row.getValue("type")} />,
    filterFn: (row, id, value) => {
      if (!value || value.length === 0) return true
      return value.includes(row.getValue(id))
    },
    sortingFn: "text",
    meta: {
      title: "Loại yêu cầu"
    }
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <CheckboxFilterHeader column={column} title="Trạng thái" options={CREDIT_REQUEST_STATUS_OPTIONS} />
    ),
    cell: ({ row }) => <CreditRequestStatusBadge status={row.getValue("status")} />,
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
    sortingFn: "datetime",
    meta: {
      title: "Ngày tạo"
    }
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Cập nhật lần cuối</span>
        <SortButton column={column} label="Sắp xếp theo ngày cập nhật" />
      </div>
    ),
    cell: ({ row }) => {
      const date = row.getValue("updatedAt") as string
      return date ? new Date(date).toLocaleString('vi-VN') : '-'
    },
    sortingFn: "datetime",
    meta: {
      title: "Cập nhật lần cuối"
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
      const request = row.original
      const router = useRouter()
      const isPending = request.status === 'PENDING'

      const handleViewDetails = () => {
        router.push(`/admin/credit-requests/${request.id}`)
      }

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewDetails}
            className="gap-1"
          >
            <Eye className="h-4 w-4" />
            Chi tiết
          </Button>
          {isPending && (
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
                <DropdownMenuItem
                  onClick={() => actions.onApprove(request.id)}
                  className="text-green-600"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Phê duyệt
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => actions.onReject(request.id)}
                  className="text-red-600"
                >
                  <X className="h-4 w-4 mr-2" />
                  Từ chối
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )
    },
  },
]
