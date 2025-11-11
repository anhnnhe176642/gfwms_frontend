'use client';

import { InfiniteScrollFilter } from './InfiniteScrollFilter';
import { supplierService } from '@/services/supplier.service';
import { Column } from '@tanstack/react-table';

type InfiniteScrollSupplierFilterProps<TData> = {
  column: Column<TData, unknown>;
  title?: string;
};

/**
 * Supplier-specific infinite scroll filter
 * Wrapper around generic InfiniteScrollFilter
 */
export function InfiniteScrollSupplierFilter<TData>({
  column,
  title = 'Nhà cung cấp',
}: InfiniteScrollSupplierFilterProps<TData>) {
  return (
    <InfiniteScrollFilter
      column={column}
      title={title}
      hookOptions={{
        fetchData: supplierService.getSuppliers,
        initialParams: {
          sortBy: 'name',
          order: 'asc',
        },
      }}
      getLabel={(supplier) => supplier.name}
      getValue={(supplier) => String(supplier.id)}
    />
  );
}
