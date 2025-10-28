"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown, Filter, Calendar, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { UserListItem, UserStatus, UserRole, UserGender } from "@/types/user"
import { Column } from "@tanstack/react-table"

export type UserColumnActions = {
  onStatusChange: (userId: string | number, status: UserStatus) => void
  onRoleChange: (userId: string | number, role: UserRole) => void
  onDelete: (userId: string | number) => void
}

// Header component với sort
function SortableHeader({ column, title }: { column: Column<any>; title: string }) {
  const isSorted = column.getIsSorted()
  const sortIndex = column.getSortIndex()
  
  return (
    <Button
      variant="ghost"
      onClick={(e) => {
        // Always use multi-sort (append to existing sorts)
        const currentSorting = column.getIsSorted()
        
        if (currentSorting === "asc") {
          column.toggleSorting(true, true) // desc, keep existing
        } else if (currentSorting === "desc") {
          column.clearSorting() // Clear this column's sort
        } else {
          column.toggleSorting(false, true) // asc, keep existing
        }
      }}
      className="p-0 hover:bg-transparent font-medium"
    >
      {title}
      <div className="ml-2 flex items-center">
        {isSorted === "asc" ? (
          <ArrowUp className="h-4 w-4" />
        ) : isSorted === "desc" ? (
          <ArrowDown className="h-4 w-4" />
        ) : (
          <ArrowUpDown className="h-4 w-4 opacity-50" />
        )}
        {isSorted && sortIndex !== -1 && (
          <span className="ml-1 text-xs font-bold">{sortIndex + 1}</span>
        )}
      </div>
    </Button>
  )
}

// Header component với filter cho Status (có cả sort)
function StatusFilterHeader({ column }: { column: Column<any> }) {
  const [open, setOpen] = useState(false)
  const filterValue = (column.getFilterValue() as string[]) || []
  const [tempFilterValue, setTempFilterValue] = useState<string[]>([])
  const isSorted = column.getIsSorted()
  const sortIndex = column.getSortIndex()
  const statusOptions = [
    { value: 'ACTIVE', label: 'Hoạt động' },
    { value: 'INACTIVE', label: 'Không hoạt động' },
    { value: 'SUSPENDED', label: 'Bị cấm' },
  ]

  // Sync temp value when popover opens - only depend on open state
  useEffect(() => {
    if (open) {
      const currentFilter = (column.getFilterValue() as string[]) || []
      setTempFilterValue(currentFilter)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const toggleTempFilter = (value: string) => {
    const newFilter = tempFilterValue.includes(value)
      ? tempFilterValue.filter(v => v !== value)
      : [...tempFilterValue, value]
    
    setTempFilterValue(newFilter)
  }

  const applyFilter = () => {
    column.setFilterValue(tempFilterValue.length > 0 ? tempFilterValue : undefined)
    setOpen(false)
  }

  const clearFilter = () => {
    setTempFilterValue([])
    column.setFilterValue(undefined)
    setOpen(false)
  }

  const handleSort = () => {
    const currentSorting = column.getIsSorted()
    
    if (currentSorting === "asc") {
      column.toggleSorting(true, true) // desc, keep existing
    } else if (currentSorting === "desc") {
      column.clearSorting() // Clear this column's sort
    } else {
      column.toggleSorting(false, true) // asc, keep existing
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="p-0 hover:bg-transparent font-medium"
          >
            Trạng thái
            <Filter className={`ml-2 h-4 w-4 ${filterValue.length > 0 ? 'text-blue-600' : 'opacity-50'}`} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56" align="start">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Lọc trạng thái</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {statusOptions.map((option) => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={tempFilterValue.includes(option.value)}
                  onCheckedChange={() => toggleTempFilter(option.value)}
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
            <div className="flex gap-2 mt-3">
              {(tempFilterValue.length > 0 || filterValue.length > 0) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilter}
                  className="flex-1"
                >
                  Xóa bộ lọc
                </Button>
              )}
              <Button
                size="sm"
                onClick={applyFilter}
                className="flex-1"
              >
                Áp dụng
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSort}
        className="h-8 w-8 p-0"
      >
        <div className="flex items-center">
          {isSorted === "asc" ? (
            <ArrowUp className="h-4 w-4" />
          ) : isSorted === "desc" ? (
            <ArrowDown className="h-4 w-4" />
          ) : (
            <ArrowUpDown className="h-4 w-4 opacity-50" />
          )}
          {isSorted && sortIndex !== -1 && (
            <span className="ml-0.5 text-xs font-bold">{sortIndex + 1}</span>
          )}
        </div>
      </Button>
    </div>
  )
}

// Header component với filter cho Role (có cả sort)
function RoleFilterHeader({ column }: { column: Column<any> }) {
  const [open, setOpen] = useState(false)
  const filterValue = (column.getFilterValue() as string[]) || []
  const [tempFilterValue, setTempFilterValue] = useState<string[]>([])
  const isSorted = column.getIsSorted()
  const sortIndex = column.getSortIndex()
  const roleOptions = [
    { value: 'ADMIN', label: 'Quản trị viên' },
    { value: 'MANAGER', label: 'Quản lý' },
    { value: 'USER', label: 'Người dùng' },
  ]

  // Sync temp value when popover opens - only depend on open state
  useEffect(() => {
    if (open) {
      const currentFilter = (column.getFilterValue() as string[]) || []
      setTempFilterValue(currentFilter)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const toggleTempFilter = (value: string) => {
    const newFilter = tempFilterValue.includes(value)
      ? tempFilterValue.filter(v => v !== value)
      : [...tempFilterValue, value]
    
    setTempFilterValue(newFilter)
  }

  const applyFilter = () => {
    column.setFilterValue(tempFilterValue.length > 0 ? tempFilterValue : undefined)
    setOpen(false)
  }

  const clearFilter = () => {
    setTempFilterValue([])
    column.setFilterValue(undefined)
    setOpen(false)
  }

  const handleSort = () => {
    const currentSorting = column.getIsSorted()
    
    if (currentSorting === "asc") {
      column.toggleSorting(true, true) // desc, keep existing
    } else if (currentSorting === "desc") {
      column.clearSorting() // Clear this column's sort
    } else {
      column.toggleSorting(false, true) // asc, keep existing
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="p-0 hover:bg-transparent font-medium"
          >
            Vai trò
            <Filter className={`ml-2 h-4 w-4 ${filterValue.length > 0 ? 'text-blue-600' : 'opacity-50'}`} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56" align="start">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Lọc vai trò</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {roleOptions.map((option) => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={tempFilterValue.includes(option.value)}
                  onCheckedChange={() => toggleTempFilter(option.value)}
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
            <div className="flex gap-2 mt-3">
              {(tempFilterValue.length > 0 || filterValue.length > 0) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilter}
                  className="flex-1"
                >
                  Xóa bộ lọc
                </Button>
              )}
              <Button
                size="sm"
                onClick={applyFilter}
                className="flex-1"
              >
                Áp dụng
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSort}
        className="h-8 w-8 p-0"
      >
        <div className="flex items-center">
          {isSorted === "asc" ? (
            <ArrowUp className="h-4 w-4" />
          ) : isSorted === "desc" ? (
            <ArrowDown className="h-4 w-4" />
          ) : (
            <ArrowUpDown className="h-4 w-4 opacity-50" />
          )}
          {isSorted && sortIndex !== -1 && (
            <span className="ml-0.5 text-xs font-bold">{sortIndex + 1}</span>
          )}
        </div>
      </Button>
    </div>
  )
}

// Header component với date range filter (có cả sort)
function DateRangeFilterHeader({ column }: { column: Column<any> }) {
  const [open, setOpen] = useState(false)
  const filterValue = (column.getFilterValue() as { from?: string; to?: string }) || {}
  const [tempFilterValue, setTempFilterValue] = useState<{ from?: string; to?: string }>({})
  const isSorted = column.getIsSorted()
  const sortIndex = column.getSortIndex()

  // Sync temp value when popover opens - only depend on open state
  useEffect(() => {
    if (open) {
      const currentFilter = column.getFilterValue() as { from?: string; to?: string }
      setTempFilterValue(currentFilter || {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleDateChange = (field: 'from' | 'to', value: string) => {
    setTempFilterValue(prev => {
      const newFilter = { ...prev, [field]: value }
      
      // Remove empty values
      if (!newFilter.from) delete newFilter.from
      if (!newFilter.to) delete newFilter.to
      
      return newFilter
    })
  }

  const applyFilter = () => {
    column.setFilterValue(Object.keys(tempFilterValue).length > 0 ? tempFilterValue : undefined)
    setOpen(false)
  }

  const clearFilter = () => {
    setTempFilterValue({})
    column.setFilterValue(undefined)
    setOpen(false)
  }

  const handleSort = () => {
    const currentSorting = column.getIsSorted()
    
    if (currentSorting === "asc") {
      column.toggleSorting(true, true) // desc, keep existing
    } else if (currentSorting === "desc") {
      column.clearSorting() // Clear this column's sort
    } else {
      column.toggleSorting(false, true) // asc, keep existing
    }
  }

  const hasFilter = filterValue.from || filterValue.to

  return (
    <div className="flex items-center gap-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="p-0 hover:bg-transparent font-medium"
          >
            Ngày tạo
            <Calendar className={`ml-2 h-4 w-4 ${hasFilter ? 'text-blue-600' : 'opacity-50'}`} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Lọc theo khoảng thời gian</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date-from" className="text-sm">Từ ngày</Label>
              <Input
                id="date-from"
                type="date"
                value={tempFilterValue.from || ''}
                onChange={(e) => handleDateChange('from', e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-to" className="text-sm">Đến ngày</Label>
              <Input
                id="date-to"
                type="date"
                value={tempFilterValue.to || ''}
                onChange={(e) => handleDateChange('to', e.target.value)}
                className="w-full"
              />
            </div>

            <div className="flex gap-2">
              {(tempFilterValue.from || tempFilterValue.to || filterValue.from || filterValue.to) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilter}
                  className="flex-1"
                >
                  Xóa bộ lọc
                </Button>
              )}
              <Button
                size="sm"
                onClick={applyFilter}
                className="flex-1"
              >
                Áp dụng
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSort}
        className="h-8 w-8 p-0"
      >
        <div className="flex items-center">
          {isSorted === "asc" ? (
            <ArrowUp className="h-4 w-4" />
          ) : isSorted === "desc" ? (
            <ArrowDown className="h-4 w-4" />
          ) : (
            <ArrowUpDown className="h-4 w-4 opacity-50" />
          )}
          {isSorted && sortIndex !== -1 && (
            <span className="ml-0.5 text-xs font-bold">{sortIndex + 1}</span>
          )}
        </div>
      </Button>
    </div>
  )
}

const getStatusBadge = (status: UserStatus) => {
  const statusMap: Record<UserStatus, { label: string; className: string }> = {
    ACTIVE: { label: 'Hoạt động', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
    INACTIVE: { label: 'Không hoạt động', className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' },
    SUSPENDED: { label: 'Bị cấm', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
  }
  const statusInfo = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' }
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
      {statusInfo.label}
    </span>
  )
}

const getRoleBadge = (role: UserRole) => {
  const roleMap: Record<UserRole, { label: string; className: string }> = {
    ADMIN: { label: 'Quản trị viên', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' },
    MANAGER: { label: 'Quản lý', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
    USER: { label: 'Người dùng', className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' },
  }
  const roleInfo = roleMap[role] || { label: role, className: 'bg-gray-100 text-gray-800' }
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleInfo.className}`}>
      {roleInfo.label}
    </span>
  )
}

export const createUserColumns = (actions: UserColumnActions): ColumnDef<UserListItem>[] => [
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
    header: ({ column }) => <SortableHeader column={column} title="Tên người dùng" />,
    meta: {
      title: "Tên người dùng"
    }
  },
  {
    accessorKey: "email",
    header: ({ column }) => <SortableHeader column={column} title="Email" />,
    meta: {
      title: "Email"
    }
  },
  {
    accessorKey: "fullname",
    header: ({ column }) => <SortableHeader column={column} title="Họ tên" />,
    cell: ({ row }) => row.getValue("fullname") || "-",
    meta: {
      title: "Họ tên"
    }
  },
  {
    accessorKey: "phone",
    header: ({ column }) => <SortableHeader column={column} title="Số điện thoại" />,
    cell: ({ row }) => row.getValue("phone") || "-",
    meta: {
      title: "Số điện thoại"
    }
  },
  {
    accessorKey: "role",
    header: ({ column }) => <RoleFilterHeader column={column} />,
    cell: ({ row }) => getRoleBadge(row.getValue("role")),
    filterFn: (row, id, value) => {
      if (!value || value.length === 0) return true
      return value.includes(row.getValue(id))
    },
    sortingFn: "text", // Enable text sorting
    meta: {
      title: "Vai trò"
    }
  },
  {
    accessorKey: "status",
    header: ({ column }) => <StatusFilterHeader column={column} />,
    cell: ({ row }) => getStatusBadge(row.getValue("status")),
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
    header: ({ column }) => <DateRangeFilterHeader column={column} />,
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
            <DropdownMenuItem
              onClick={() => actions.onStatusChange(user.id, 'ACTIVE')}
              disabled={user.status === 'ACTIVE'}
            >
              Kích hoạt
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => actions.onStatusChange(user.id, 'INACTIVE')}
              disabled={user.status === 'INACTIVE'}
            >
              Vô hiệu hóa
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => actions.onStatusChange(user.id, 'SUSPENDED')}
              disabled={user.status === 'SUSPENDED'}
            >
              Cấm
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-normal text-gray-500">
              Thay đổi vai trò
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => actions.onRoleChange(user.id, 'ADMIN')}
              disabled={user.role === 'ADMIN'}
            >
              Quản trị viên
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => actions.onRoleChange(user.id, 'MANAGER')}
              disabled={user.role === 'MANAGER'}
            >
              Quản lý
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => actions.onRoleChange(user.id, 'USER')}
              disabled={user.role === 'USER'}
            >
              Người dùng
            </DropdownMenuItem>
            
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
