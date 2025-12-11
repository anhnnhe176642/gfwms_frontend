'use client';

import React, { useState, useId, useRef, useEffect, ReactNode } from 'react';
import { Column } from '@tanstack/react-table';
import { Filter, X, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import InfiniteScroll from '@/components/ui/infinite-scroll';
import { SortButton } from './SortButton';
import { useInfiniteScroll, type UseInfiniteScrollOptions } from '@/hooks/useInfiniteScroll';

export type InfiniteScrollFilterItem = {
  value: string;
  label: string;
};

type InfiniteScrollFilterProps<TData, TParams> = {
  column: Column<TData, unknown>;
  title: string;
  
  /**
   * Hook options cho infinite scroll
   */
  hookOptions: UseInfiniteScrollOptions<any, TParams>;

  /**
   * Hàm render custom item (optional)
   * Default: hiển thị label
   */
  renderItem?: (item: InfiniteScrollFilterItem, isSelected: boolean) => ReactNode;

  /**
   * Hàm lấy label từ item
   * Default: item.label
   */
  getLabel?: (item: any) => string;

  /**
   * Hàm lấy value từ item
   * Default: item.value
   */
  getValue?: (item: any) => string;

  /**
   * Width của popover (default: w-56)
   */
  width?: string;
};

/**
 * Generic infinite scroll filter component
 * Có thể dùng cho bất kỳ entity nào (role, fabric, warehouse, v.v.)
 * 
 * @example
 * <InfiniteScrollFilter
 *   column={column}
 *   title="Vai trò"
 *   hookOptions={{
 *     fetchData: roleService.getRoles,
 *     pageSize: 5,
 *   }}
 * />
 */
export function InfiniteScrollFilter<TData, TParams extends Record<string, any>>({
  column,
  title,
  hookOptions,
  renderItem,
  getLabel = (item) => item.label,
  getValue = (item) => item.value,
  width = 'w-56',
}: InfiniteScrollFilterProps<TData, TParams>) {
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const filterValue = (column.getFilterValue() as string[]) || [];
  const [tempFilterValue, setTempFilterValue] = useState<string[]>([]);
  const componentId = useId();

  const { data, loading, hasMore, error, loadMore, handleSearch } = useInfiniteScroll(hookOptions);

  // Sync temp value when popover opens
  const prevOpenRef = useRef(open);
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setTempFilterValue([...filterValue]);
    }
    prevOpenRef.current = open;
  }, [open]);

  const toggleTempFilter = (value: string) => {
    setTempFilterValue((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  const applyFilter = () => {
    column.setFilterValue(tempFilterValue.length > 0 ? tempFilterValue : undefined);
    setOpen(false);
  };

  const clearFilter = () => {
    setTempFilterValue([]);
    column.setFilterValue(undefined);
    setOpen(false);
  };

  const handleSearchInputChange = (value: string) => {
    setSearchInput(value);
    handleSearch(value);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    handleSearch('');
  };

  return (
    <div className="flex items-center gap-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="p-0 hover:bg-transparent font-medium">
            {title}
            <Filter
              className={`ml-2 h-4 w-4 ${
                filterValue.length > 0 ? 'text-blue-600' : 'opacity-50'
              }`}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={`${width} p-0`} align="start">
          <div className="flex flex-col max-h-80">
            {/* Header */}
            <div className="flex items-center justify-between p-4 pb-2 border-b">
              <h4 className="font-medium text-sm">Lọc {title.toLowerCase()}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                className="h-6 w-6 p-0"
                aria-label="Đóng"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Search input */}
            <div className="relative p-4 pt-2 border-b">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={`Tìm kiếm ${title.toLowerCase()}...`}
                value={searchInput}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                className="pl-8 pr-8 text-sm"
              />
              {searchInput && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Items list with infinite scroll */}
            <div className="flex-1 overflow-y-auto px-4 pt-2 min-h-40">
              <div className="flex flex-col gap-2 h-full">
                {/* Error state */}
                {error && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <p className="text-sm font-medium text-red-600 mb-2">Lỗi tải dữ liệu</p>
                      <p className="text-xs text-red-500">{error}</p>
                    </div>
                  </div>
                )}

                {/* No data state */}
                {data.length === 0 && !loading && !error ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-sm text-gray-500">Không có dữ liệu</div>
                  </div>
                ) : (
                  <>
                    {data.map((item) => {
                      const itemValue = getValue(item);
                      const itemLabel = getLabel(item);
                      const checkboxId = `${componentId}-${itemValue}`;

                      return (
                        <div key={itemValue} className="flex items-center gap-2">
                          <Checkbox
                            id={checkboxId}
                            checked={tempFilterValue.includes(itemValue)}
                            onCheckedChange={() => toggleTempFilter(itemValue)}
                          />
                          <Label
                            htmlFor={checkboxId}
                            className="text-sm cursor-pointer flex-1 min-w-0"
                          >
                            {renderItem ? (
                              renderItem({ value: itemValue, label: itemLabel }, tempFilterValue.includes(itemValue))
                            ) : (
                              <div className="truncate">{itemLabel}</div>
                            )}
                          </Label>
                        </div>
                      );
                    })}
                  </>
                )}

                {/* Infinite Scroll Trigger - stop if error */}
                <InfiniteScroll
                  hasMore={hasMore && !error}
                  isLoading={loading}
                  next={loadMore}
                  threshold={0.5}
                >
                  {hasMore && !error && (
                    <div className="flex items-center justify-center h-12">
                      <div className="flex items-center gap-1">
                        {/* Modern gradient spinner - fixed height to avoid jumps */}
                        <div className="w-1.5 h-1.5 rounded-full bg-linear-to-r from-blue-400 to-blue-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-linear-to-r from-blue-400 to-blue-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-linear-to-r from-blue-400 to-blue-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                </InfiniteScroll>

                {/* End of list */}
                {!hasMore && data.length > 0 && (
                  <div className="flex items-center justify-center h-12">
                    <p className="text-xs text-gray-400 font-medium">✓ Hết dữ liệu</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions footer */}
            <div className="flex gap-2 p-4 pt-2 border-t">
              {(tempFilterValue.length > 0 || filterValue.length > 0) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilter}
                  className="flex-1"
                >
                  Xóa
                </Button>
              )}
              <Button size="sm" onClick={applyFilter} className="flex-1">
                Áp dụng
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <SortButton
        column={column}
        label={`Sắp xếp theo ${title.toLowerCase()}`}
      />
    </div>
  );
}
