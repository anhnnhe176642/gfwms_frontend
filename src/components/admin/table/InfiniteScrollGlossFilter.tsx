'use client';

import { InfiniteScrollFilter } from './InfiniteScrollFilter';
import { fabricGlossService } from '@/services/fabricGloss.service';
import { Column } from '@tanstack/react-table';

type InfiniteScrollGlossFilterProps<TData> = {
  column: Column<TData, unknown>;
  title?: string;
};

/**
 * Fabric gloss-specific infinite scroll filter
 * Wrapper around generic InfiniteScrollFilter
 */
export function InfiniteScrollGlossFilter<TData>({
  column,
  title = 'Độ bóng',
}: InfiniteScrollGlossFilterProps<TData>) {
  return (
    <InfiniteScrollFilter
      column={column}
      title={title}
      hookOptions={{
        fetchData: fabricGlossService.getFabricGlosses,
        pageSize: 5,
      }}
      getLabel={(gloss) => gloss.description}
      getValue={(gloss) => String(gloss.id)}
    />
  );
}
