'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import type { FabricListItem } from '@/types/fabric';
import { SortButton } from '@/components/admin/table/SortButton';
import { DateRangeFilterHeader } from '@/components/admin/table/DateRangeFilterHeader';
import { InfiniteScrollCategoryFilter } from '@/components/admin/table/InfiniteScrollCategoryFilter';
import { InfiniteScrollColorFilter } from '@/components/admin/table/InfiniteScrollColorFilter';
import { InfiniteScrollGlossFilter } from '@/components/admin/table/InfiniteScrollGlossFilter';
import { InfiniteScrollSupplierFilter } from '@/components/admin/table/InfiniteScrollSupplierFilter';

export type ExportRequestColumnActions = {
  isSelected: (fabricId: number) => boolean;
  getQuantity: (fabricId: number) => string;
  getQuantityError: (fabricId: number) => string | undefined;
  onToggleSelect: (fabric: FabricListItem, checked: boolean) => void;
  onQuantityChange: (fabricId: number, value: string) => void;
};

export const createExportRequestColumns = (
  actions: ExportRequestColumnActions
): ColumnDef<FabricListItem>[] => [
  {
    id: 'select',
    header: () => <span className="font-medium text-center block">Chọn</span>,
    cell: ({ row }) => {
      const fabric = row.original;
      const isChecked = actions.isSelected(fabric.id);
      
      return (
        <div className="flex items-center justify-center h-full py-2">
          <Checkbox
            checked={isChecked}
            onCheckedChange={(checked) => actions.onToggleSelect(fabric, !!checked)}
            aria-label={`Chọn ${fabric.category.name}`}
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
    header: () => <span className="font-medium">Số lượng xuất</span>,
    cell: ({ row }) => {
      const fabric = row.original;
      const quantity = actions.getQuantity(fabric.id);
      const error = actions.getQuantityError(fabric.id);
      const isSelected = actions.isSelected(fabric.id);
      const maxQuantity = fabric.quantityInStock;
      
      return (
        <div className="w-32">
          <Input
            type="number"
            placeholder="SL"
            value={quantity}
            onChange={(e) => actions.onQuantityChange(fabric.id, e.target.value)}
            min="1"
            max={maxQuantity}
            disabled={!isSelected}
            className={`text-sm h-9 ${error ? 'border-destructive focus-visible:ring-destructive' : ''}`}
          />
          {error && (
            <p className="text-xs text-destructive mt-1">{error}</p>
          )}
        </div>
      );
    },
    enableHiding: false,
    meta: {
      title: 'Số lượng xuất',
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
    id: 'categoryId',
    accessorKey: 'category.id',
    header: ({ column }) => (
      <InfiniteScrollCategoryFilter column={column} title="Loại vải" />
    ),
    cell: ({ row }) => row.original.category.name,
    filterFn: (row, id, value) => {
      if (!value || value.length === 0) return true;
      const categoryId = row.original.category.id;
      return value.includes(String(categoryId));
    },
    sortingFn: 'text',
    meta: {
      title: 'Loại vải',
    },
  },
  {
    id: 'colorId',
    accessorKey: 'color.id',
    header: ({ column }) => (
      <InfiniteScrollColorFilter column={column} title="Màu sắc" />
    ),
    cell: ({ row }) => row.original.color.name,
    filterFn: (row, id, value) => {
      if (!value || value.length === 0) return true;
      const colorId = row.original.color.id;
      return value.includes(colorId);
    },
    sortingFn: 'text',
    meta: {
      title: 'Màu sắc',
    },
  },
  {
    id: 'glossId',
    accessorKey: 'gloss.id',
    header: ({ column }) => (
      <InfiniteScrollGlossFilter column={column} title="Độ bóng" />
    ),
    cell: ({ row }) => row.original.gloss.description,
    filterFn: (row, id, value) => {
      if (!value || value.length === 0) return true;
      const glossId = row.original.gloss.id;
      return value.includes(String(glossId));
    },
    sortingFn: 'text',
    meta: {
      title: 'Độ bóng',
    },
  },
  {
    id: 'supplierId',
    accessorKey: 'supplier.id',
    header: ({ column }) => (
      <InfiniteScrollSupplierFilter column={column} title="Nhà cung cấp" />
    ),
    cell: ({ row }) => row.original.supplier.name,
    filterFn: (row, id, value) => {
      if (!value || value.length === 0) return true;
      const supplierId = row.original.supplier.id;
      return value.includes(String(supplierId));
    },
    sortingFn: 'text',
    meta: {
      title: 'Nhà cung cấp',
    },
  },
  {
    accessorKey: 'quantityInStock',
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Tồn kho</span>
        <SortButton column={column} label="Sắp xếp theo số lượng tồn" />
      </div>
    ),
    cell: ({ row }) => {
      const quantity = row.getValue('quantityInStock') as number;
      return (
        <span className={quantity <= 0 ? 'text-destructive font-medium' : ''}>
          {new Intl.NumberFormat('vi-VN').format(quantity)}
        </span>
      );
    },
    meta: {
      title: 'Tồn kho',
    },
  },
  {
    accessorKey: 'sellingPrice',
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Giá bán/cuộn</span>
        <SortButton column={column} label="Sắp xếp theo Giá bán/cuộn" />
      </div>
    ),
    cell: ({ row }) => {
      const price = row.getValue('sellingPrice') as number;
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(price);
    },
    meta: {
      title: 'Giá bán/cuộn',
    },
  },
  {
    accessorKey: 'weight',
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Trọng lượng (kg)</span>
        <SortButton column={column} label="Sắp xếp theo trọng lượng" />
      </div>
    ),
    cell: ({ row }) => {
      const weight = row.getValue('weight') as number;
      return weight.toFixed(2);
    },
    meta: {
      title: 'Trọng lượng (kg)',
    },
  },
  {
    accessorKey: 'length',
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Chiều dài (m)</span>
        <SortButton column={column} label="Sắp xếp theo chiều dài" />
      </div>
    ),
    cell: ({ row }) => {
      const length = row.getValue('length') as number;
      return length.toFixed(2);
    },
    meta: {
      title: 'Chiều dài (m)',
    },
  },
  {
    accessorKey: 'width',
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Chiều rộng (m)</span>
        <SortButton column={column} label="Sắp xếp theo chiều rộng" />
      </div>
    ),
    cell: ({ row }) => {
      const width = row.getValue('width') as number;
      return width.toFixed(2);
    },
    meta: {
      title: 'Chiều rộng (m)',
    },
  },
  {
    accessorKey: 'thickness',
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <span className="font-medium">Độ dày (mm)</span>
        <SortButton column={column} label="Sắp xếp theo độ dày" />
      </div>
    ),
    cell: ({ row }) => {
      const thickness = row.getValue('thickness') as number;
      return thickness.toFixed(2);
    },
    meta: {
      title: 'Độ dày (mm)',
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <DateRangeFilterHeader column={column} title="Ngày tạo" />,
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string;
      return date ? new Date(date).toLocaleString('vi-VN') : '-';
    },
    filterFn: (row, id, value) => {
      if (!value || (!value.from && !value.to)) return true;
      const rowDate = new Date(row.getValue(id) as string);
      const from = value.from ? new Date(value.from) : null;
      const to = value.to ? new Date(value.to) : null;

      if (from && to) {
        return rowDate >= from && rowDate <= to;
      } else if (from) {
        return rowDate >= from;
      } else if (to) {
        return rowDate <= to;
      }
      return true;
    },
    sortingFn: 'datetime',
    meta: {
      title: 'Ngày tạo',
    },
  },
];
