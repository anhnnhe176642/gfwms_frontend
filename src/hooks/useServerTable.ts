import { useState, useCallback, useRef, useEffect } from 'react';
import type { SortingState, ColumnFiltersState } from '@tanstack/react-table';
import type { PaginationState } from '@/types/common';

export type ServerTableParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: string;
  [key: string]: any;
};

/**
 * Configuration for how to transform column filters to API params
 */
export type FilterConfig = {
  /**
   * For multi-select filters (like status, role)
   * Maps filter ID to API param name
   * Example: { status: 'status', role: 'role' }
   */
  arrayFilters?: Record<string, string>;
  
  /**
   * For date range filters
   * Maps filter ID to API param names for from/to
   * Example: { createdAt: { from: 'createdFrom', to: 'createdTo' } }
   */
  dateRangeFilters?: Record<string, { from: string; to: string }>;
  
  /**
   * Maps sort column ID to API sortBy field name
   * Example: { categoryName: 'category.name', colorName: 'color.name' }
   */
  sortingFieldMap?: Record<string, string>;
  
  /**
   * Custom filter transformer for special cases
   * Receives filter and returns API params
   */
  customTransform?: (filter: { id: string; value: any }) => Record<string, string>;
};

type UseServerTableOptions<TData, TParams extends ServerTableParams> = {
  fetchData: (params: TParams) => Promise<{
    data: TData[];
    pagination: PaginationState;
  }>;
  initialParams?: TParams;
  filterConfig?: FilterConfig;
  onError?: (error: Error) => void;
};

/**
 * Custom hook for managing server-side table state and data fetching
 * Handles sorting, filtering, pagination, and search with proper race condition handling
 */
export function useServerTable<TData, TParams extends ServerTableParams = ServerTableParams>({
  fetchData,
  initialParams,
  filterConfig,
  onError,
}: UseServerTableOptions<TData, TParams>) {
  const [data, setData] = useState<TData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    page: initialParams?.page ?? 1,
    limit: initialParams?.limit ?? 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Use ref to track the latest request to handle race conditions
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestCounterRef = useRef(0);

  /**
   * Convert TanStack sorting state to API params
   */
  const getSortParams = useCallback(() => {
    if (sorting.length === 0) return {};

    const sortBy = sorting
      .map((s) => {
        // Check if there's a custom mapping for this sort ID
        if (filterConfig?.sortingFieldMap?.[s.id]) {
          return filterConfig.sortingFieldMap[s.id];
        }
        // Otherwise use the sort ID as-is
        return s.id;
      })
      .join(',');
    const order = sorting.map((s) => (s.desc ? 'desc' : 'asc')).join(',');

    return { sortBy, order };
  }, [sorting, filterConfig?.sortingFieldMap]);

  /**
   * Convert TanStack column filters to API params
   * Uses filterConfig to determine how to transform each filter
   */
  const getFilterParams = useCallback(() => {
    const params: Record<string, string> = {};

    columnFilters.forEach((filter) => {
      // Check if there's a custom transformer
      if (filterConfig?.customTransform) {
        const customParams = filterConfig.customTransform(filter);
        Object.assign(params, customParams);
        return;
      }

      // Check if it's an array filter (multi-select)
      if (filterConfig?.arrayFilters?.[filter.id]) {
        const values = filter.value as string[];
        if (values && values.length > 0) {
          const paramName = filterConfig.arrayFilters[filter.id];
          params[paramName] = values.join(',');
        }
        return;
      }

      // Check if it's a date range filter
      if (filterConfig?.dateRangeFilters?.[filter.id]) {
        const dateRange = filter.value as { from?: string; to?: string };
        const paramNames = filterConfig.dateRangeFilters[filter.id];
        if (dateRange?.from) {
          params[paramNames.from] = dateRange.from;
        }
        if (dateRange?.to) {
          params[paramNames.to] = dateRange.to;
        }
        return;
      }

      // Default behavior: assume it's a simple key-value filter
      if (filter.value !== undefined && filter.value !== null && filter.value !== '') {
        // If value is array, join with comma
        if (Array.isArray(filter.value)) {
          params[filter.id] = filter.value.join(',');
        } else {
          params[filter.id] = String(filter.value);
        }
      }
    });

    return params;
  }, [columnFilters, filterConfig]);

  /**
   * Effect to fetch data when dependencies change
   * Using a single effect instead of multiple to avoid race conditions
   */
  useEffect(() => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    // Increment request counter
    const currentRequestId = ++requestCounterRef.current;

    const fetchData_internal = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = {
          ...initialParams,
          page: pagination.page,
          limit: pagination.limit,
          search: searchQuery || undefined,
          ...getSortParams(),
          ...getFilterParams(),
        } as TParams;

        const response = await fetchData(params);

        // Only update state if this is still the latest request
        if (currentRequestId === requestCounterRef.current && !abortController.signal.aborted) {
          setData(response.data);
          setPagination(response.pagination);
        }
      } catch (err: any) {
        // Ignore abort errors
        if (err.name === 'AbortError' || abortController.signal.aborted) {
          return;
        }

        const errorMessage = err?.response?.data?.message || 'Không thể tải dữ liệu';
        
        // Only update error if this is still the latest request
        if (currentRequestId === requestCounterRef.current) {
          setError(errorMessage);
          if (onError) {
            onError(err);
          }
        }
      } finally {
        // Only update loading if this is still the latest request
        if (currentRequestId === requestCounterRef.current) {
          setLoading(false);
        }
      }
    };

    fetchData_internal();

    // Cleanup: abort request on unmount or when dependencies change
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [
    pagination.page,
    pagination.limit,
    searchQuery,
    // Dependencies for sorting and filtering
    JSON.stringify(sorting),
    JSON.stringify(columnFilters),
  ]);

  /**
   * Handle pagination change
   */
  const handlePaginationChange = useCallback((pageIndex: number, pageSize: number) => {
    setPagination((prev) => ({
      ...prev,
      page: pageIndex + 1, // API uses 1-based indexing
      limit: pageSize,
    }));
  }, []);

  /**
   * Handle search (can be used for manual search trigger)
   */
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    // Reset to page 1 when searching
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  }, []);

  /**
   * Refresh data (manual refetch)
   */
  const refresh = useCallback(async () => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    // Increment request counter
    const currentRequestId = ++requestCounterRef.current;

    try {
      setLoading(true);
      setError(null);

      const params = {
        ...initialParams,
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery || undefined,
        ...getSortParams(),
        ...getFilterParams(),
      } as TParams;

      const response = await fetchData(params);

      // Only update state if this is still the latest request
      if (currentRequestId === requestCounterRef.current && !abortController.signal.aborted) {
        setData(response.data);
        setPagination(response.pagination);
      }
    } catch (err: any) {
      // Ignore abort errors
      if (err.name === 'AbortError' || abortController.signal.aborted) {
        return;
      }

      const errorMessage = err?.response?.data?.message || 'Không thể tải dữ liệu';
      
      // Only update error if this is still the latest request
      if (currentRequestId === requestCounterRef.current) {
        setError(errorMessage);
        if (onError) {
          onError(err);
        }
      }
    } finally {
      // Only update loading if this is still the latest request
      if (currentRequestId === requestCounterRef.current) {
        setLoading(false);
      }
    }
  }, [pagination.page, pagination.limit, searchQuery, getSortParams, getFilterParams, initialParams, fetchData, onError]);

  /**
   * Reset all filters and sorting
   */
  const reset = useCallback(() => {
    setSorting([]);
    setColumnFilters([]);
    setSearchQuery('');
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  }, []);

  return {
    // Data
    data,
    loading,
    error,

    // Table state
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    searchQuery,
    setSearchQuery,
    pagination,

    // Handlers
    handlePaginationChange,
    handleSearch,
    refresh,
    reset,
  };
}
