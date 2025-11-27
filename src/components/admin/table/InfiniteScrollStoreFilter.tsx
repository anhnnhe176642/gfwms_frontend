"use client";

import { InfiniteScrollFilter } from "./InfiniteScrollFilter";
import { storeService } from "@/services/store.service";
import { Column } from "@tanstack/react-table";
import type { StoreListItem, StoreListParams } from "@/types/store";

type InfiniteScrollStoreFilterProps<TData> = {
  column: Column<TData, unknown>;
  title?: string;
};

/**
 * Store-specific infinite scroll filter
 * Wrapper around generic InfiniteScrollFilter
 */
export function InfiniteScrollStoreFilter<TData>({
  column,
  title = "Cửa hàng nhận",
}: InfiniteScrollStoreFilterProps<TData>) {
  // Adapter cho InfiniteScrollFilter: fetchData trả về { data, pagination: { hasNext } }
  const fetchStores = async (params: StoreListParams = {}) => {
    const res = await storeService.getStores({
      ...params,
      sortBy: "name",
      order: "asc",
    });
    return {
      data: res.data,
      pagination: {
        hasNext: res.pagination?.hasNext ?? false,
      },
    };
  };

  return (
    <InfiniteScrollFilter
      column={column}
      title={title}
      hookOptions={{
        fetchData: fetchStores,
        initialParams: {
          sortBy: "name",
          order: "asc",
        },
      }}
      getLabel={(store: StoreListItem) => store.name}
      getValue={(store: StoreListItem) => String(store.id)}
    />
  );
}
