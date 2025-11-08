'use client';

import { InfiniteScrollFilter } from './InfiniteScrollFilter';
import { fabricCategoryService } from '@/services/fabricCategory.service';
import { Column } from '@tanstack/react-table';

type InfiniteScrollCategoryFilterProps<TData> = {
  column: Column<TData, unknown>;
  title?: string;
};

/**
 * Fabric category-specific infinite scroll filter
 * Wrapper around generic InfiniteScrollFilter
 */
export function InfiniteScrollCategoryFilter<TData>({
  column,
  title = 'Loại vải',
}: InfiniteScrollCategoryFilterProps<TData>) {
  return (
    <InfiniteScrollFilter
      column={column}
      title={title}
      hookOptions={{
        fetchData: fabricCategoryService.getFabricCategories,
        pageSize: 5,
      }}
      getLabel={(category) => category.name}
      getValue={(category) => String(category.id)}
    />
  );
}
