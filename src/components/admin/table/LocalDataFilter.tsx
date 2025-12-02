'use client';

import React, { useState, useId, useRef, useEffect } from 'react';
import { Column } from '@tanstack/react-table';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SortButton } from './SortButton';
import { Search } from 'lucide-react';

export type LocalDataFilterOption = {
  value: string;
  label: string;
};

type LocalDataFilterProps<TData> = {
  column: Column<TData, unknown>;
  title: string;
  options: LocalDataFilterOption[];
  loading?: boolean;
};

/**
 * Local data filter component (for client-side data)
 * Similar to InfiniteScrollFilter but without infinite scroll
 * Used for filtering local data without API calls
 */
export function LocalDataFilter<TData>({
  column,
  title,
  options,
  loading = false,
}: LocalDataFilterProps<TData>) {
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const filterValue = (column.getFilterValue() as string[]) || [];
  const [tempFilterValue, setTempFilterValue] = useState<string[]>([]);
  const componentId = useId();

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

  // Filter options based on search input
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchInput.toLowerCase())
  );

  const handleClearSearch = () => {
    setSearchInput('');
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
        <PopoverContent className="w-56 p-0" align="start">
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
                onChange={(e) => setSearchInput(e.target.value)}
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

            {/* Items list */}
            <div className="flex-1 overflow-y-auto px-4 pt-2 min-h-40">
              <div className="flex flex-col gap-2 h-full">
                {filteredOptions.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-sm text-gray-500">Không có dữ liệu</div>
                  </div>
                ) : (
                  filteredOptions.map((option) => {
                    const checkboxId = `${componentId}-${option.value}`;
                    return (
                      <div key={option.value} className="flex items-center gap-2">
                        <Checkbox
                          id={checkboxId}
                          checked={tempFilterValue.includes(option.value)}
                          onCheckedChange={() => toggleTempFilter(option.value)}
                        />
                        <Label
                          htmlFor={checkboxId}
                          className="text-sm cursor-pointer flex-1 min-w-0 truncate"
                        >
                          {option.label}
                        </Label>
                      </div>
                    );
                  })
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
