'use client';

import { InfiniteScrollFilter } from './InfiniteScrollFilter';
import { fabricColorService } from '@/services/fabricColor.service';
import { Column } from '@tanstack/react-table';

type InfiniteScrollColorFilterProps<TData> = {
  column: Column<TData, unknown>;
  title?: string;
};

/**
 * Fabric color-specific infinite scroll filter
 * Wrapper around generic InfiniteScrollFilter
 */
export function InfiniteScrollColorFilter<TData>({
  column,
  title = 'Màu sắc',
}: InfiniteScrollColorFilterProps<TData>) {
  return (
    <InfiniteScrollFilter
      column={column}
      title={title}
      hookOptions={{
        fetchData: fabricColorService.getFabricColors,
        pageSize: 5,
      }}
      getLabel={(color) => color.name}
      getValue={(color) => color.id}
    />
  );
}
