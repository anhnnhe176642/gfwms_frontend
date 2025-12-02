'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { createFabricShelfColumns, FabricShelfTableItem } from './fabricShelfColumns';
import type { FabricShelfItem } from '@/types/warehouse';
import { Search, X } from 'lucide-react';

export interface FabricShelfTableProps {
  fabricShelf: FabricShelfItem[];
  shelfCapacity: number;
  shelfId: string | number;
  warehouseId: string | number;
}

export function FabricShelfTable({ fabricShelf, shelfCapacity, shelfId, warehouseId }: FabricShelfTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    // Hide some columns by default
    fabricId: false,
    thickness: false,
    weight: false,
    length: false,
    width: false,
  });

  // Transform data to include percentage calculation
  const tableData: FabricShelfTableItem[] = useMemo(() => {
    return fabricShelf.map((item) => ({
      ...item,
      percentageOfShelf: shelfCapacity > 0 ? (item.quantity / shelfCapacity) * 100 : 0,
    }));
  }, [fabricShelf, shelfCapacity]);

  // Filter data based on search query (client-side)
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return tableData;
    
    const query = searchQuery.toLowerCase().trim();
    return tableData.filter((item) => {
      const fabric = item.fabric;
      // Search across multiple fields
      return (
        String(item.fabricId).includes(query) ||
        fabric.category?.name?.toLowerCase().includes(query) ||
        fabric.color?.name?.toLowerCase().includes(query) ||
        fabric.gloss?.description?.toLowerCase().includes(query) ||
        fabric.supplier?.name?.toLowerCase().includes(query) ||
        String(item.quantity).includes(query)
      );
    });
  }, [tableData, searchQuery]);

  // Handle view detail action
  const handleViewDetail = (fabricId: number) => {
    router.push(`/admin/warehouses/${warehouseId}/shelves/${shelfId}/fabric/${fabricId}`);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Check if any filter is active
  const hasActiveFilters = searchQuery;

  const columns = createFabricShelfColumns({
    onViewDetail: handleViewDetail,
  }, tableData);

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo ID, loại vải, màu, độ bóng, nhà cung cấp..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Info bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {hasActiveFilters ? (
            <>
              Tìm thấy: <span className="font-medium">{filteredData.length}</span> / {tableData.length} loại vải
            </>
          ) : (
            <>
              Tổng: <span className="font-medium">{tableData.length}</span> loại vải trong kệ
            </>
          )}
        </p>
      </div>

      {/* DataTable with client-side pagination */}
      <DataTable
        columns={columns}
        data={filteredData}
        sorting={sorting}
        onSortingChange={setSorting}
        columnFilters={columnFilters}
        onColumnFiltersChange={setColumnFilters}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        manualSorting={false}
        manualFiltering={false}
        manualPagination={false}
      />
    </div>
  );
}

export default FabricShelfTable;
