'use client';

import { InfiniteScrollFilter } from './InfiniteScrollFilter';
import { roleService } from '@/services/role.service';
import { Column } from '@tanstack/react-table';

type InfiniteScrollRoleFilterProps<TData> = {
  column: Column<TData, unknown>;
  title?: string;
};

/**
 * Role-specific infinite scroll filter
 * Wrapper around generic InfiniteScrollFilter
 */
export function InfiniteScrollRoleFilter<TData>({
  column,
  title = 'Vai trò',
}: InfiniteScrollRoleFilterProps<TData>) {
  return (
    <InfiniteScrollFilter
      column={column}
      title={title}
      hookOptions={{
        fetchData: roleService.getRoles,
        pageSize: 5,
      }}
      getLabel={(role) => role.fullName || role.name}
      getValue={(role) => role.name}
    />
  );
}
