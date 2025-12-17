'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { InfiniteScroll } from '@/components/ui/infinite-scroll';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { warehouseService } from '@/services/warehouse.service';
import { Search, Loader2 } from 'lucide-react';
import type { ShelfListItem, ShelfListParams } from '@/types/warehouse';

export interface ShelfSelectorProps {
  warehouseId: number;
  value: number;
  onChange: (shelfId: number, shelf?: ShelfListItem) => void;
  disabled?: boolean;
}

/**
 * Shelf selector component với infinite scroll
 * Cho phép tìm kiếm và chọn kệ từ kho
 */
export function ShelfSelector({
  warehouseId,
  value,
  onChange,
  disabled = false,
}: ShelfSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    data: shelves,
    loading,
    hasMore,
    loadMore,
    handleSearch,
    reset,
  } = useInfiniteScroll<ShelfListItem, ShelfListParams>({
    fetchData: warehouseService.getShelves,
    pageSize: 10,
    initialParams: { warehouseId: String(warehouseId) },
  });

  // Load initial data khi mở
  useEffect(() => {
    if (isOpen && shelves.length === 0 && !loading) {
      loadMore();
    }
  }, [isOpen]);

  // Reset khi đóng
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedShelf = shelves.find((s) => s.id === value);

  const handleSelect = (shelf: ShelfListItem) => {
    onChange(shelf.id, shelf);
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className="w-full h-9 px-3 py-2 border border-input rounded-md bg-background text-left text-sm hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {selectedShelf ? selectedShelf.code : value ? `#${value}` : 'Chọn kệ'}
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 border border-input rounded-md bg-popover shadow-md dark:shadow-lg">
          {/* Search input */}
          <div className="p-2 border-b border-input bg-background dark:bg-slate-950">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kệ..."
                className="pl-8 h-8 text-sm bg-background dark:bg-slate-900 border-input dark:border-slate-700 text-foreground dark:text-slate-100"
                onChange={(e) => handleSearch(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {/* Shelf list with infinite scroll */}
          <div className="max-h-60 overflow-y-auto bg-popover dark:bg-slate-950">
            {shelves.length === 0 && !loading ? (
              <div className="p-3 text-center text-sm text-muted-foreground">
                Không tìm thấy kệ nào
              </div>
            ) : (
              <>
                {shelves.map((shelf) => (
                  <button
                    key={shelf.id}
                    type="button"
                    onClick={() => handleSelect(shelf)}
                    className="w-full text-left px-3 py-2 hover:bg-accent dark:hover:bg-slate-800 text-sm border-b border-input dark:border-slate-800 last:border-b-0 transition-colors"
                  >
                    <div className="font-medium text-foreground dark:text-slate-100">{shelf.code}</div>
                    <div className="text-xs text-muted-foreground dark:text-slate-400">
                      {shelf.currentQuantity}/{shelf.maxQuantity}
                    </div>
                  </button>
                ))}

                {/* Infinite scroll trigger */}
                {hasMore && (
                  <InfiniteScroll next={loadMore} hasMore={hasMore} isLoading={loading}>
                    <div className="p-3 text-center">
                      {loading && <Loader2 className="h-4 w-4 animate-spin inline" />}
                    </div>
                  </InfiniteScroll>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
