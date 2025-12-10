'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SortButton } from '@/components/admin/table/SortButton';
import { InfiniteScrollCategoryFilter } from '@/components/admin/table/InfiniteScrollCategoryFilter';
import { InfiniteScrollColorFilter } from '@/components/admin/table/InfiniteScrollColorFilter';
import { InfiniteScrollGlossFilter } from '@/components/admin/table/InfiniteScrollGlossFilter';
import { InfiniteScrollSupplierFilter } from '@/components/admin/table/InfiniteScrollSupplierFilter';
import type { StoreFabricListItem } from '@/types/storeFabric';
import type { SaleUnit } from '@/types/order';

export type CreateOrderFabricColumnActions = {
  isSelected: (fabricId: number) => boolean;
  getQuantity: (fabricId: number) => string;
  getUnit: (fabricId: number) => SaleUnit;
  getQuantityError: (fabricId: number) => string | undefined;
  onToggleSelect: (fabric: StoreFabricListItem, checked: boolean) => void;
  onQuantityChange: (fabricId: number, value: string) => void;
  onUnitChange: (fabricId: number, unit: SaleUnit) => void;
};

export const createCreateOrderFabricColumns = (
  actions: CreateOrderFabricColumnActions
): ColumnDef<StoreFabricListItem>[] => [
  {
    id: 'select',
    header: () => <span className="font-medium text-center block">Chọn</span>,
    cell: ({ row }) => {
      const fabric = row.original;
      const isChecked = actions.isSelected(fabric.fabricId);

      return (
        <div className="flex items-center justify-center h-full py-2">
          <Checkbox
            checked={isChecked}
            onCheckedChange={(checked) => actions.onToggleSelect(fabric, !!checked)}
            aria-label={`Chọn ${fabric.fabricInfo.category}`}
            className="h-5 w-5 cursor-pointer"
          />
        </div>
      );
    },
    enableHiding: false,
    meta: {
      title: 'Chọn',
    },
  },
  {
    id: 'quantity',
    header: () => <span className="font-medium">Số lượng</span>,
    cell: ({ row }) => {
      const fabric = row.original;
      const quantity = actions.getQuantity(fabric.fabricId);
      const error = actions.getQuantityError(fabric.fabricId);
      const isSelected = actions.isSelected(fabric.fabricId);

      return (
        <div className="w-28">
          <Input
            type="number"
            placeholder="SL"
            value={quantity}
            onChange={(e) => actions.onQuantityChange(fabric.fabricId, e.target.value)}
            min="1"
            disabled={!isSelected}
            className={`text-sm h-9 ${error ? 'border-destructive focus-visible:ring-destructive' : ''}`}
          />
          {error && <p className="text-xs text-destructive mt-1">{error}</p>}
        </div>
      );
    },
    enableHiding: false,
    meta: {
      title: 'Số lượng',
    },
  },
  {
    id: 'unit',
    header: () => <span className="font-medium">Đơn vị</span>,
    cell: ({ row }) => {
      const fabric = row.original;
      const unit = actions.getUnit(fabric.fabricId);
      const isSelected = actions.isSelected(fabric.fabricId);

      return (
        <Select
          value={unit}
          onValueChange={(value) => actions.onUnitChange(fabric.fabricId, value as SaleUnit)}
          disabled={!isSelected}
        >
          <SelectTrigger className="w-24 h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="METER">Mét</SelectItem>
            <SelectItem value="ROLL">Cuộn</SelectItem>
          </SelectContent>
        </Select>
      );
    },
    enableHiding: false,
    meta: {
      title: 'Đơn vị',
    },
  },
  {
    id: 'stt',
    header: 'STT',
    cell: ({ row, table }) => {
      const pageIndex = table.getState().pagination.pageIndex;
      const pageSize = table.getState().pagination.pageSize;
      return <div className="font-medium">{pageIndex * pageSize + row.index + 1}</div>;
    },
    enableHiding: false,
    meta: {
      title: 'STT',
    },
  },
  {
    id: 'category',
    accessorKey: 'fabricInfo.category',
    header: ({ column }) => (
      <InfiniteScrollCategoryFilter column={column} title="Loại vải" />
    ),
    cell: ({ row }) => row.original.fabricInfo.category,
    filterFn: (row, id, value) => {
      if (!value || value.length === 0) return true;
      const categoryId = row.original.fabricInfo.categoryId;
      return value.includes(String(categoryId));
    },
    sortingFn: 'text',
    meta: {
      title: 'Loại vải',
    },
  },
  {
    id: 'color',
    accessorKey: 'fabricInfo.color',
    header: ({ column }) => (
      <InfiniteScrollColorFilter column={column} title="Màu sắc" />
    ),
    cell: ({ row }) => row.original.fabricInfo.color,
    filterFn: (row, id, value) => {
      if (!value || value.length === 0) return true;
      const colorId = row.original.fabricInfo.colorId;
      return value.includes(colorId);
    },
    sortingFn: 'text',
    meta: {
      title: 'Màu sắc',
    },
  },
  {
    id: 'gloss',
    accessorKey: 'fabricInfo.gloss',
    header: ({ column }) => (
      <InfiniteScrollGlossFilter column={column} title="Độ bóng" />
    ),
    cell: ({ row }) => row.original.fabricInfo.gloss,
    filterFn: (row, id, value) => {
      if (!value || value.length === 0) return true;
      const glossId = row.original.fabricInfo.glossId;
      return value.includes(String(glossId));
    },
    sortingFn: 'text',
    meta: {
      title: 'Độ bóng',
    },
  },
  {
    id: 'supplier',
    accessorKey: 'fabricInfo.supplier',
    header: ({ column }) => (
      <InfiniteScrollSupplierFilter column={column} title="Nhà cung cấp" />
    ),
    cell: ({ row }) => row.original.fabricInfo.supplier || 'N/A',
    filterFn: (row, id, value) => {
      if (!value || value.length === 0) return true;
      const supplierId = row.original.fabricInfo.supplierId;
      return value.includes(String(supplierId));
    },
    sortingFn: 'text',
    meta: {
      title: 'Nhà cung cấp',
    },
  },
  {
    id: 'totalMeters',
    accessorKey: 'inventory.totalMeters',
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Tổng mét</span>
        <SortButton column={column} label="Sắp xếp theo tổng mét" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.original.inventory.totalMeters.toLocaleString()} m</div>
    ),
    sortingFn: 'auto',
    meta: {
      title: 'Tổng mét',
    },
  },
  {
    id: 'uncutRolls',
    accessorKey: 'inventory.uncutRolls',
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Cuộn</span>
        <SortButton column={column} label="Sắp xếp theo số cuộn" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.original.inventory.uncutRolls.toLocaleString()}</div>
    ),
    sortingFn: 'auto',
    meta: {
      title: 'Cuộn',
    },
  },
  {
    id: 'sellingPrice',
    accessorKey: 'fabricInfo.sellingPrice',
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Giá bán</span>
        <SortButton column={column} label="Sắp xếp theo giá bán" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.original.fabricInfo.sellingPrice.toLocaleString()} ₫</div>
    ),
    sortingFn: 'auto',
    meta: {
      title: 'Giá bán',
    },
  },
];
