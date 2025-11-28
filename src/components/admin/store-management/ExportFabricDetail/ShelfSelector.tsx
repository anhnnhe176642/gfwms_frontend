'use client';

import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { warehouseService } from '@/services/warehouse.service';
import type { ShelfListItem } from '@/types/warehouse';
import { Loader2 } from 'lucide-react';

interface ShelfSelectorProps {
  warehouseId: number | string;
  fabricId: number; // Filter shelves that contain this fabric
  value?: number;
  onChange: (shelfId: number) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ShelfSelector({
  warehouseId,
  fabricId,
  value,
  onChange,
  placeholder = 'Chọn kệ...',
  disabled = false,
}: ShelfSelectorProps) {
  const [allShelves, setAllShelves] = useState<ShelfListItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  const { data, loading, hasMore, loadMore, error } = useInfiniteScroll<ShelfListItem>({
    fetchData: async (params) => {
      return warehouseService.getShelves(params as any);
    },
    initialParams: {
      warehouseId: Number(warehouseId),
      fabricId: Number(fabricId),
    },
    pageSize: 50,
  });

  // Mount hook to ensure auth is ready
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      setAllShelves(data);
    }
  }, [data, isMounted]);

  const isLoading = loading && allShelves.length === 0 && isMounted;

  return (
    <Select
      value={value?.toString()}
      onValueChange={(val) => onChange(Number(val))}
      disabled={disabled || isLoading || error !== null}
    >
      <SelectTrigger className="w-full">
        <SelectValue
          placeholder={
            error ? '⚠️ Lỗi tải kệ' : isLoading ? 'Đang tải...' : placeholder
          }
        />
      </SelectTrigger>
      <SelectContent>
        {error ? (
          <div className="p-2 text-sm text-red-500">{error}</div>
        ) : isLoading ? (
          <div className="flex items-center justify-center p-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Đang tải kệ...
          </div>
        ) : allShelves.length === 0 ? (
          <div className="p-2 text-sm text-gray-500">Không có kệ nào</div>
        ) : (
          <>
            {allShelves.map((shelf) => (
              <SelectItem key={shelf.id} value={shelf.id.toString()}>
                {shelf.code} (Còn: {shelf.maxQuantity - shelf.currentQuantity}/{shelf.maxQuantity})
              </SelectItem>
            ))}
            {hasMore && !loading && (
              <div
                onClick={() => loadMore()}
                className="p-2 text-center text-sm text-blue-600 hover:bg-gray-100 cursor-pointer"
              >
                Xem thêm...
              </div>
            )}
            {hasMore && loading && (
              <div className="flex items-center justify-center p-2 text-sm text-gray-500">
                <Loader2 className="h-3 w-3 animate-spin mr-2" />
                Đang tải...
              </div>
            )}
          </>
        )}
      </SelectContent>
    </Select>
  );
}
