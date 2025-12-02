"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { FabricShelfItem } from "@/types/warehouse"
import { SortButton } from "@/components/admin/table/SortButton"
import { LocalDataFilter } from "@/components/admin/table/LocalDataFilter"

export type FabricShelfColumnActions = {
  onViewDetail?: (fabricId: number) => void
}

export type FabricShelfTableItem = FabricShelfItem & {
  percentageOfShelf: number
}

/**
 * Helper function to create filter options for a column
 * Used to extract unique values from the dataset
 */
export function createCategoryFilterOptions(data: FabricShelfTableItem[]): { value: string; label: string }[] {
  const map = new Map<string, string>();
  data.forEach((item) => {
    const id = item.fabric.category?.id;
    const name = item.fabric.category?.name;
    if (id && name) {
      map.set(String(id), name);
    }
  });
  return Array.from(map.entries()).map(([id, name]) => ({ value: id, label: name }));
}

export function createColorFilterOptions(data: FabricShelfTableItem[]): { value: string; label: string }[] {
  const map = new Map<string, string>();
  data.forEach((item) => {
    const id = item.fabric.color?.id;
    const name = item.fabric.color?.name;
    if (id && name) {
      map.set(String(id), name);
    }
  });
  return Array.from(map.entries()).map(([id, name]) => ({ value: id, label: name }));
}

export function createGlossFilterOptions(data: FabricShelfTableItem[]): { value: string; label: string }[] {
  const map = new Map<string, string>();
  data.forEach((item) => {
    const id = item.fabric.gloss?.id;
    const description = item.fabric.gloss?.description;
    if (id && description) {
      map.set(String(id), description);
    }
  });
  return Array.from(map.entries()).map(([id, description]) => ({ value: id, label: description }));
}

export function createSupplierFilterOptions(data: FabricShelfTableItem[]): { value: string; label: string }[] {
  const map = new Map<string, string>();
  data.forEach((item) => {
    const id = item.fabric.supplier?.id;
    const name = item.fabric.supplier?.name;
    if (id && name) {
      map.set(String(id), name);
    }
  });
  return Array.from(map.entries()).map(([id, name]) => ({ value: id, label: name }));
}

export const createFabricShelfColumns = (
  actions: FabricShelfColumnActions,
  filterData?: FabricShelfTableItem[]
): ColumnDef<FabricShelfTableItem>[] => {
  const categoryOptions = filterData ? createCategoryFilterOptions(filterData) : [];
  const colorOptions = filterData ? createColorFilterOptions(filterData) : [];
  const glossOptions = filterData ? createGlossFilterOptions(filterData) : [];
  const supplierOptions = filterData ? createSupplierFilterOptions(filterData) : [];

  return [
  {
    id: "stt",
    header: "STT",
    cell: ({ row, table }) => {
      const pageIndex = table.getState().pagination.pageIndex
      const pageSize = table.getState().pagination.pageSize
      return <div className="font-medium">{pageIndex * pageSize + row.index + 1}</div>
    },
    enableHiding: false,
    enableSorting: false,
    meta: {
      title: "STT"
    }
  },
  {
    id: "fabricId",
    accessorKey: "fabricId",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">ID Vải</span>
        <SortButton column={column} label="Sắp xếp theo ID vải" />
      </div>
    ),
    cell: ({ row }) => <span className="font-medium">{row.original.fabricId}</span>,
    filterFn: "includesString",
    meta: {
      title: "ID Vải"
    }
  },
  {
    id: "categoryName",
    accessorFn: (row) => row.fabric.category?.name || '',
    header: ({ column }) => (
      <LocalDataFilter
        column={column}
        title="Loại vải"
        options={categoryOptions}
      />
    ),
    cell: ({ row }) => row.original.fabric.category?.name || '-',
    filterFn: (row, id, value) => {
      if (!value || value.length === 0) return true
      const categoryId = row.original.fabric.category?.id
      return value.includes(String(categoryId))
    },
    sortingFn: "text",
    meta: {
      title: "Loại vải"
    }
  },
  {
    id: "colorName",
    accessorFn: (row) => row.fabric.color?.name || '',
    header: ({ column }) => (
      <LocalDataFilter
        column={column}
        title="Màu sắc"
        options={colorOptions}
      />
    ),
    cell: ({ row }) => row.original.fabric.color?.name || '-',
    filterFn: (row, id, value) => {
      if (!value || value.length === 0) return true
      const colorId = row.original.fabric.color?.id
      return value.includes(String(colorId))
    },
    sortingFn: "text",
    meta: {
      title: "Màu sắc"
    }
  },
  {
    id: "glossDescription",
    accessorFn: (row) => row.fabric.gloss?.description || '',
    header: ({ column }) => (
      <LocalDataFilter
        column={column}
        title="Độ bóng"
        options={glossOptions}
      />
    ),
    cell: ({ row }) => row.original.fabric.gloss?.description || '-',
    filterFn: (row, id, value) => {
      if (!value || value.length === 0) return true
      const glossId = row.original.fabric.gloss?.id
      return value.includes(String(glossId))
    },
    sortingFn: "text",
    meta: {
      title: "Độ bóng"
    }
  },
  {
    id: "supplierName",
    accessorFn: (row) => row.fabric.supplier?.name || '',
    header: ({ column }) => (
      <LocalDataFilter
        column={column}
        title="Nhà cung cấp"
        options={supplierOptions}
      />
    ),
    cell: ({ row }) => row.original.fabric.supplier?.name || '-',
    filterFn: (row, id, value) => {
      if (!value || value.length === 0) return true
      const supplierId = row.original.fabric.supplier?.id
      return value.includes(String(supplierId))
    },
    sortingFn: "text",
    meta: {
      title: "Nhà cung cấp"
    }
  },
  {
    id: "quantity",
    accessorKey: "quantity",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Số lượng</span>
        <SortButton column={column} label="Sắp xếp theo số lượng" />
      </div>
    ),
    cell: ({ row }) => {
      const quantity = row.original.quantity
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground">
          {new Intl.NumberFormat('vi-VN').format(quantity)}
        </span>
      )
    },
    meta: {
      title: "Số lượng"
    }
  },
  {
    id: "percentageOfShelf",
    accessorKey: "percentageOfShelf",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">% trong kệ</span>
        <SortButton column={column} label="Sắp xếp theo % trong kệ" />
      </div>
    ),
    cell: ({ row }) => {
      const percentage = row.original.percentageOfShelf
      return (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-secondary rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-primary h-full transition-all"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-primary">
            {percentage.toFixed(1)}%
          </span>
        </div>
      )
    },
    meta: {
      title: "% trong kệ"
    }
  },
  {
    id: "thickness",
    accessorFn: (row) => row.fabric.thickness,
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Độ dày (mm)</span>
        <SortButton column={column} label="Sắp xếp theo độ dày" />
      </div>
    ),
    cell: ({ row }) => {
      const thickness = row.original.fabric.thickness
      return thickness?.toFixed(2) || '-'
    },
    meta: {
      title: "Độ dày (mm)"
    }
  },
  {
    id: "weight",
    accessorFn: (row) => row.fabric.weight,
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Trọng lượng (kg)</span>
        <SortButton column={column} label="Sắp xếp theo trọng lượng" />
      </div>
    ),
    cell: ({ row }) => {
      const weight = row.original.fabric.weight
      return weight?.toFixed(2) || '-'
    },
    meta: {
      title: "Trọng lượng (kg)"
    }
  },
  {
    id: "length",
    accessorFn: (row) => row.fabric.length,
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Chiều dài (m)</span>
        <SortButton column={column} label="Sắp xếp theo chiều dài" />
      </div>
    ),
    cell: ({ row }) => {
      const length = row.original.fabric.length
      return length?.toFixed(2) || '-'
    },
    meta: {
      title: "Chiều dài (m)"
    }
  },
  {
    id: "width",
    accessorFn: (row) => row.fabric.width,
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Chiều rộng (m)</span>
        <SortButton column={column} label="Sắp xếp theo chiều rộng" />
      </div>
    ),
    cell: ({ row }) => {
      const width = row.original.fabric.width
      return width?.toFixed(2) || '-'
    },
    meta: {
      title: "Chiều rộng (m)"
    }
  },
  {
    id: "actions",
    header: "Hành động",
    enableHiding: false,
    enableSorting: false,
    meta: {
      title: "Hành động"
    },
    cell: ({ row }) => {
      const fabricItem = row.original

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
            {actions.onViewDetail && (
              <DropdownMenuItem
                onClick={() => actions.onViewDetail?.(fabricItem.fabricId)}
              >
                <Eye className="mr-2 h-4 w-4" />
                Xem chi tiết vải
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  },
  ]
}
