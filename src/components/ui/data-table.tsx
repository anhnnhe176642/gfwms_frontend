"use client"

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  OnChangeFn,
} from "@tanstack/react-table"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
  // Controlled state props for server-side operations
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  columnFilters?: ColumnFiltersState
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>
  columnVisibility?: VisibilityState
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>
  manualSorting?: boolean
  manualFiltering?: boolean
  // Server-side pagination props
  manualPagination?: boolean
  pageCount?: number
  pageIndex?: number
  pageSize?: number
  onPaginationChange?: (pageIndex: number, pageSize: number) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Tìm kiếm...",
  sorting: externalSorting,
  onSortingChange: externalOnSortingChange,
  columnFilters: externalColumnFilters,
  onColumnFiltersChange: externalOnColumnFiltersChange,
  columnVisibility: externalColumnVisibility,
  onColumnVisibilityChange: externalOnColumnVisibilityChange,
  manualSorting = false,
  manualFiltering = false,
  manualPagination = false,
  pageCount: externalPageCount,
  pageIndex: externalPageIndex,
  pageSize: externalPageSize,
  onPaginationChange,
}: DataTableProps<TData, TValue>) {
  const [internalSorting, setInternalSorting] = useState<SortingState>([])
  const [internalColumnFilters, setInternalColumnFilters] = useState<ColumnFiltersState>([])
  const [internalColumnVisibility, setInternalColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  // Use external state if provided, otherwise use internal state
  const sorting = externalSorting !== undefined ? externalSorting : internalSorting
  const setSorting = externalOnSortingChange || setInternalSorting
  const columnFilters = externalColumnFilters !== undefined ? externalColumnFilters : internalColumnFilters
  const setColumnFilters = externalOnColumnFiltersChange || setInternalColumnFilters
  const columnVisibility = externalColumnVisibility !== undefined ? externalColumnVisibility : internalColumnVisibility
  const setColumnVisibility = externalOnColumnVisibilityChange || setInternalColumnVisibility

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: manualFiltering ? undefined : getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    enableMultiSort: true, // Enable multi-column sorting
    manualSorting, // Tell table that sorting is handled externally
    manualFiltering, // Tell table that filtering is handled externally
    manualPagination, // Tell table that pagination is handled externally
    ...(manualPagination && { pageCount: externalPageCount ?? -1 }),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      ...(manualPagination && externalPageIndex !== undefined && externalPageSize !== undefined
        ? { pagination: { pageIndex: externalPageIndex, pageSize: externalPageSize } }
        : {}),
    },
  })

  return (
    <div className="space-y-4">
      {/* Search bar and Column visibility toggle */}
      <div className="flex items-center justify-between">
        {searchKey && (
          <Input
            placeholder={searchPlaceholder}
            value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn(searchKey)?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Hiển thị cột <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                const columnMeta = column.columnDef.meta as { title?: string } | undefined
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {columnMeta?.title || column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => {
                    const cellValue = cell.getValue()
                    const cellTitle = typeof cellValue === 'string' ? cellValue : ''
                    return (
                      <TableCell key={cell.id} className="max-w-xs truncate" title={cellTitle}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          <div className="space-y-1">
            {table.getFilteredSelectedRowModel().rows.length > 0 && (
              <div>
                Đã chọn {table.getFilteredSelectedRowModel().rows.length} trong số{" "}
                {table.getFilteredRowModel().rows.length} hàng.
              </div>
            )}
            {sorting.length > 0 && (
              <div className="text-xs">
                Đang sắp xếp: {sorting.map((s, i) => (
                  <span key={s.id}>
                    {i > 0 && ", "}
                    <span className="font-medium">{s.id}</span>
                    {s.desc ? " ↓" : " ↑"}
                  </span>
                ))}
              </div>
            )}
            {columnFilters.length > 0 && (
              <div className="text-xs">
                Đang lọc: {columnFilters.length} bộ lọc đang hoạt động
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Số hàng mỗi trang</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                const newPageSize = Number(value)
                if (manualPagination && onPaginationChange) {
                  onPaginationChange(table.getState().pagination.pageIndex, newPageSize)
                } else {
                  table.setPageSize(newPageSize)
                }
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Trang {table.getState().pagination.pageIndex + 1} /{" "}
            {table.getPageCount() < 0 ? 1 : table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => {
                if (manualPagination && onPaginationChange) {
                  onPaginationChange(0, table.getState().pagination.pageSize)
                } else {
                  table.setPageIndex(0)
                }
              }}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Trang đầu</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => {
                if (manualPagination && onPaginationChange) {
                  onPaginationChange(
                    table.getState().pagination.pageIndex - 1,
                    table.getState().pagination.pageSize
                  )
                } else {
                  table.previousPage()
                }
              }}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Trang trước</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => {
                if (manualPagination && onPaginationChange) {
                  onPaginationChange(
                    table.getState().pagination.pageIndex + 1,
                    table.getState().pagination.pageSize
                  )
                } else {
                  table.nextPage()
                }
              }}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Trang sau</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => {
                if (manualPagination && onPaginationChange) {
                  onPaginationChange(
                    table.getPageCount() - 1,
                    table.getState().pagination.pageSize
                  )
                } else {
                  table.setPageIndex(table.getPageCount() - 1)
                }
              }}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Trang cuối</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
