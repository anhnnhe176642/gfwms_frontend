import { useState, useCallback, useRef, useEffect } from 'react';

export type UseInfiniteScrollOptions<TData, TParams> = {
  /**
   * Hàm fetch dữ liệu
   * @param params Tham số request
   * @returns Promise chứa data và pagination info
   */
  fetchData: (params: TParams) => Promise<{
    data: TData[];
    pagination: { hasNext: boolean };
  }>;

  /**
   * Tham số ban đầu
   */
  initialParams?: Omit<TParams, 'page' | 'limit'>;

  /**
   * Số item mỗi lần load
   */
  pageSize?: number;

  /**
   * Callback khi có lỗi
   */
  onError?: (error: Error) => void;

  /**
   * Hàm transform dữ liệu (optional)
   */
  transform?: (items: TData[]) => TData[];
};

/**
 * Universal hook cho infinite scroll list
 * Hoạt động với bất kỳ entity nào (role, fabric, warehouse, v.v.)
 * 
 * @example
 * const { data, loading, hasMore, loadMore, handleSearch } = useInfiniteScroll({
 *   fetchData: roleService.getRoles,
 *   pageSize: 5,
 *   initialParams: { status: 'active' }
 * });
 */
export function useInfiniteScroll<TData, TParams extends Record<string, any> = any>({
  fetchData,
  initialParams,
  pageSize = 10,
  onError,
  transform,
}: UseInfiniteScrollOptions<TData, TParams>) {
  const [data, setData] = useState<TData[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const abortControllerRef = useRef<AbortController | null>(null);
  const requestCounterRef = useRef(0);

  /**
   * Load more data
   */
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    const currentRequestId = ++requestCounterRef.current;

    try {
      setLoading(true);
      setError(null);

      const params = {
        ...initialParams,
        page,
        limit: pageSize,
        ...(searchQuery && { search: searchQuery }),
      } as unknown as TParams;

      const response = await fetchData(params);

      if (currentRequestId === requestCounterRef.current && !abortController.signal.aborted) {
        let newData = response.data;
        
        // Apply transform if provided
        if (transform) {
          newData = transform(newData);
        }

        setData((prev) => [...prev, ...newData]);
        setHasMore(response.pagination.hasNext);
        setPage((prev) => prev + 1);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError' && !abortController.signal.aborted) {
        const errorMessage = err?.response?.data?.message || 'Không thể tải dữ liệu';
        setError(errorMessage);
        if (onError) onError(err);
      }
    } finally {
      if (currentRequestId === requestCounterRef.current) {
        setLoading(false);
      }
    }
  }, [loading, hasMore, page, pageSize, searchQuery, initialParams, fetchData, onError, transform]);

  /**
   * Reset khi search thay đổi
   */
  useEffect(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, [searchQuery]);

  /**
   * Initial load
   */
  useEffect(() => {
    loadMore();
  }, []);

  /**
   * Handle search
   */
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  /**
   * Reset tất cả
   */
  const reset = useCallback(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    setSearchQuery('');
    setError(null);
  }, []);

  return {
    data,
    loading,
    hasMore,
    error,
    page,
    loadMore,
    handleSearch,
    reset,
    setSearchQuery,
  };
}
