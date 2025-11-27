'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Search, X, ChevronDown } from 'lucide-react';
import InfiniteScroll from '@/components/ui/infinite-scroll';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

interface InfiniteScrollSelectProps<T> {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  fetchData: (params: any) => Promise<any>;
  getLabel: (item: T) => string;
  getValue: (item: T) => string;
  placeholder: string;
  disabled?: boolean;
  disablePortal?: boolean;
}

export function InfiniteScrollSelect<T extends Record<string, any>>({
  value,
  onChange,
  error,
  fetchData,
  getLabel,
  getValue,
  placeholder,
  disabled = false,
  disablePortal = false,
}: InfiniteScrollSelectProps<T>) {
  const { data, loading, hasMore, loadMore, handleSearch } = useInfiniteScroll({
    fetchData,
    pageSize: 20,
  });

  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const selectedItem = (data as T[]).find((item) => getValue(item) === value);
  const selectedLabel = selectedItem ? getLabel(selectedItem) : placeholder;

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    handleSearch(val);
  };

  const handleSelect = (itemValue: string) => {
    onChange(itemValue);
    setOpen(false);
    setSearchInput('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={`h-9 text-sm w-full justify-between ${error ? 'border-destructive' : ''}`}
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start" disablePortal={disablePortal}>
        <div className="flex flex-col max-h-80">
          {/* Search input */}
          <div className="relative p-2 border-b">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-8 pr-8 text-sm h-9"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 hover:bg-muted rounded p-1"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Items list with infinite scroll */}
          <div className="flex-1 overflow-y-auto">
            {data.length === 0 && !loading ? (
              <div className="text-center py-6 text-sm text-muted-foreground">
                Không có dữ liệu
              </div>
            ) : (
              <div className="p-1">
                {(data as T[]).map((item, index) => {
                  const itemValue = getValue(item);
                  const itemLabel = getLabel(item);
                  const isSelected = itemValue === value;

                  return (
                    <button
                      key={`${index}-${itemValue}`}
                      type="button"
                      onClick={() => handleSelect(itemValue)}
                      className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-accent transition-colors ${
                        isSelected ? 'bg-accent font-medium' : ''
                      }`}
                    >
                      <span className="truncate block">{itemLabel}</span>
                    </button>
                  );
                })}

                {/* Infinite Scroll Trigger */}
                <InfiniteScroll
                  hasMore={hasMore}
                  isLoading={loading}
                  next={loadMore}
                  threshold={0.5}
                >
                  {loading && (
                    <div className="flex items-center justify-center py-3">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" />
                        <div
                          className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                          style={{ animationDelay: '150ms' }}
                        />
                        <div
                          className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                          style={{ animationDelay: '300ms' }}
                        />
                      </div>
                    </div>
                  )}
                </InfiniteScroll>

                {!hasMore && data.length > 0 && !loading && (
                  <div className="text-center py-2">
                    <p className="text-xs text-muted-foreground">✓ Đã tải hết</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
