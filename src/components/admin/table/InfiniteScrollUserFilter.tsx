'use client';

import { InfiniteScrollFilter } from './InfiniteScrollFilter';
import { userService } from '@/services/user.service';
import { Column } from '@tanstack/react-table';

type InfiniteScrollUserFilterProps<TData> = {
  column: Column<TData, unknown>;
  title?: string;
};

/**
 * User-specific infinite scroll filter
 * Wrapper around generic InfiniteScrollFilter
 */
export function InfiniteScrollUserFilter<TData>({
  column,
  title = 'Người dùng',
}: InfiniteScrollUserFilterProps<TData>) {
  return (
    <InfiniteScrollFilter
      column={column}
      title={title}
      hookOptions={{
        fetchData: userService.getUsers,
        initialParams: {
          sortBy: 'fullname',
          order: 'asc',
        },
      }}
      getLabel={(user) => `${user.fullname} (@${user.username})`}
      getValue={(user) => String(user.id)}
    />
  );
}
