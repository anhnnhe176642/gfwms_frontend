'use client';

import { InfiniteScrollFilter } from './InfiniteScrollFilter';
import { warehouseService } from '@/services/warehouse.service';
import { Column } from '@tanstack/react-table';

type InfiniteScrollWarehouseFilterProps<TData> = {
  column: Column<TData, unknown>;
  title?: string;
};

/**
 * Warehouse-specific infinite scroll filter
 * Wrapper around generic InfiniteScrollFilter
 */
export function InfiniteScrollWarehouseFilter<TData>({
  column,
  title = 'Kho xuất',
}: InfiniteScrollWarehouseFilterProps<TData>) {
  return (
    <InfiniteScrollFilter
      column={column}
      title={title}
      hookOptions={{
        fetchData: warehouseService.getWarehousesForInfiniteScroll,
        initialParams: {
          sortBy: 'name',
          order: 'asc',
        },
      }}
      getLabel={(warehouse) => warehouse.name}
      getValue={(warehouse) => String(warehouse.id)}
    />
  );
}
