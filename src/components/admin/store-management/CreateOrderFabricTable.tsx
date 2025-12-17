'use client';

import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { VisibilityState } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createCreateOrderFabricColumns } from './createOrderFabricColumns';
import { createStoreFabricService } from '@/services/storeFabric.service';
import { useServerTable } from '@/hooks/useServerTable';
import { useCreateOrderStore } from '@/store/useCreateOrderStore';
import type { StoreFabricListItem, StoreFabricListParams } from '@/types/storeFabric';
import type { SaleUnit } from '@/types/order';
import { Search, RefreshCw, ArrowRight, ShoppingCart, Trash2 } from 'lucide-react';

export type CreateOrderItem = {
  fabricId: number;
  quantity: number;
  saleUnit: SaleUnit;
  fabric: StoreFabricListItem;
};

export type CreateOrderTableProps = {
  storeId: number;
  storeName: string;
  initialParams?: StoreFabricListParams;
};

export function CreateOrderFabricTable({
  storeId,
  storeName,
  initialParams,
}: CreateOrderTableProps) {
  const [tempSearchQuery, setTempSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<Map<number, CreateOrderItem>>(new Map());
  const [quantityInputs, setQuantityInputs] = useState<Map<number, string>>(new Map());
  const [unitInputs, setUnitInputs] = useState<Map<number, SaleUnit>>(new Map());
  const [quantityErrors, setQuantityErrors] = useState<Map<number, string>>(new Map());
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    supplier: false,
  });

  // Create store fabric service for this store
  const storeFabricService = useMemo(() => createStoreFabricService(storeId), [storeId]);

  // Zustand store for step navigation
  const {
    setStoreInfo,
    setSelectedItems: setStoreSelectedItems,
    setQuantityInputs: setStoreQuantityInputs,
    setUnitInputs: setStoreUnitInputs,
    goToStep2,
    selectedItems: storeSelectedItems,
    quantityInputs: storeQuantityInputs,
    unitInputs: storeUnitInputs,
  } = useCreateOrderStore();

  // Set store info on mount
  useEffect(() => {
    setStoreInfo(storeId, storeName);
  }, [storeId, storeName, setStoreInfo]);

  // Restore state from store when returning from step 2
  useEffect(() => {
    if (storeSelectedItems.size > 0) {
      setSelectedItems(new Map(storeSelectedItems));
    }
    if (storeQuantityInputs.size > 0) {
      setQuantityInputs(new Map(storeQuantityInputs));
    }
    if (storeUnitInputs.size > 0) {
      setUnitInputs(new Map(storeUnitInputs));
    }
  }, []); // Only run once on mount

  // Use refs to avoid re-creating columns on every state change
  const selectedItemsRef = useRef(selectedItems);
  const quantityInputsRef = useRef(quantityInputs);
  const unitInputsRef = useRef(unitInputs);
  const quantityErrorsRef = useRef(quantityErrors);

  // Keep refs in sync
  selectedItemsRef.current = selectedItems;
  quantityInputsRef.current = quantityInputs;
  unitInputsRef.current = unitInputs;
  quantityErrorsRef.current = quantityErrors;

  // Use custom hook for table state and data fetching
  const {
    data: fabrics,
    loading,
    error,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    pagination,
    handlePaginationChange,
    handleSearch,
    refresh,
    reset,
  } = useServerTable<StoreFabricListItem, StoreFabricListParams>({
    fetchData: storeFabricService.list,
    initialParams,
    filterConfig: {
      arrayFilters: {
        category: 'categoryId',
        color: 'colorId',
        gloss: 'glossId',
        supplier: 'supplierId',
      },
      sortingFieldMap: {
        'category': 'fabric.category.name',
        'color': 'fabric.color.name',
        'gloss': 'fabric.gloss.description',
        'supplier': 'fabric.supplier.name',
        'totalMeters': 'totalMeters',
        'uncutRolls': 'uncutRolls',
        'sellingPrice': 'fabric.sellingPrice',
      },
    },
    onError: (err) => {
      console.error('Failed to fetch fabrics:', err);
    },
  });

  // Keep fabrics ref in sync for validation
  const fabricsRef = useRef(fabrics);
  fabricsRef.current = fabrics;

  /**
   * Get list of selected items in order they were selected
   * Map in JS preserves insertion order
   */
  const selectedItemsList = useMemo(() => {
    return Array.from(selectedItems.values());
  }, [selectedItems]);

  /**
   * Get quantity error for a fabric - uses ref to avoid re-render
   */
  const getQuantityError = useCallback((fabricId: number): string | undefined => {
    return quantityErrorsRef.current.get(fabricId);
  }, []);

  /**
   * Check if a fabric is selected - uses ref
   */
  const isSelected = useCallback((fabricId: number) => {
    return selectedItemsRef.current.has(fabricId);
  }, []);

  /**
   * Get quantity value for a fabric - uses ref
   */
  const getQuantity = useCallback((fabricId: number) => {
    return quantityInputsRef.current.get(fabricId) || '';
  }, []);

  /**
   * Get unit value for a fabric - uses ref
   */
  const getUnit = useCallback((fabricId: number): SaleUnit => {
    return unitInputsRef.current.get(fabricId) || 'METER';
  }, []);

  /**
   * Get price based on unit - uses ref
   */
  const getPrice = useCallback((fabricId: number): number => {
    const fabric = fabricsRef.current.find((f) => f.fabricId === fabricId);
    if (!fabric) return 0;

    const unit = unitInputsRef.current.get(fabricId) || 'METER';

    if (unit === 'METER') {
      return fabric.fabricInfo.sellingPricePerMeter;
    } else {
      // For ROLL: use sellingPrice if available, otherwise sellingPricePerRoll
      return fabric.fabricInfo.sellingPrice || fabric.fabricInfo.sellingPricePerRoll;
    }
  }, []);

  /**
   * Handle checkbox toggle for a fabric item - stable callback
   */
  const handleToggleSelect = useCallback((fabric: StoreFabricListItem, checked: boolean) => {
    setSelectedItems((prev) => {
      const newMap = new Map(prev);
      if (checked) {
        const qty = parseInt(quantityInputsRef.current.get(fabric.fabricId) || '1') || 1;
        const unit = unitInputsRef.current.get(fabric.fabricId) || 'METER';
        newMap.set(fabric.fabricId, {
          fabricId: fabric.fabricId,
          quantity: qty,
          saleUnit: unit,
          fabric,
        });
      } else {
        newMap.delete(fabric.fabricId);
        // Clear error when unchecked - not needed to validate anymore
        setQuantityErrors((prev) => {
          const newErrors = new Map(prev);
          newErrors.delete(fabric.fabricId);
          return newErrors;
        });
      }
      return newMap;
    });

    // Set default quantity to 1 if not already set when checking
    if (checked && !quantityInputsRef.current.has(fabric.fabricId)) {
      setQuantityInputs((prev) => {
        const newMap = new Map(prev);
        newMap.set(fabric.fabricId, '1');
        return newMap;
      });
    }
  }, []);

  /**
   * Validate quantity based on unit and available inventory
   */
  const validateQuantity = useCallback((fabricId: number, value: string, unit: SaleUnit): string | undefined => {
    if (!value.trim()) {
      return 'Vui lòng nhập số lượng';
    }

    const qty = parseInt(value);
    if (isNaN(qty) || qty <= 0) {
      return 'Số lượng phải là số nguyên dương';
    }

    // Find the fabric to get available inventory
    const fabric = fabricsRef.current.find((f) => f.fabricId === fabricId);
    if (!fabric) {
      return 'Không tìm thấy vải';
    }

    // Validate based on unit
    if (unit === 'METER') {
      if (qty > fabric.inventory.totalMeters) {
        return `Không đủ mét (Có ${fabric.inventory.totalMeters}m)`;
      }
    } else if (unit === 'ROLL') {
      if (qty > fabric.inventory.uncutRolls) {
        return `Không đủ cuộn (Có ${fabric.inventory.uncutRolls} cuộn)`;
      }
    }

    return undefined;
  }, []);

  /**
   * Handle quantity change for a fabric item with validation
   */
  const handleQuantityChange = useCallback((fabricId: number, value: string) => {
    setQuantityInputs((prev) => {
      const newMap = new Map(prev);
      newMap.set(fabricId, value);
      return newMap;
    });

    // Validate quantity and update errors
    setQuantityErrors((prevErrors) => {
      const newErrors = new Map(prevErrors);

      if (selectedItemsRef.current.has(fabricId)) {
        const unit = unitInputsRef.current.get(fabricId) || 'METER';
        const error = validateQuantity(fabricId, value, unit);
        if (error) {
          newErrors.set(fabricId, error);
        } else {
          newErrors.delete(fabricId);
        }
      } else {
        newErrors.delete(fabricId);
      }

      return newErrors;
    });

    // Update selectedItems quantity if selected
    setSelectedItems((prev) => {
      if (prev.has(fabricId)) {
        const newMap = new Map(prev);
        const item = newMap.get(fabricId)!;
        const qtyNum = parseInt(value) || 0;
        newMap.set(fabricId, {
          ...item,
          quantity: qtyNum,
        });
        return newMap;
      }
      return prev;
    });
  }, [validateQuantity]);

  /**
   * Handle unit change for a fabric item
   */
  const handleUnitChange = useCallback((fabricId: number, unit: SaleUnit) => {
    setUnitInputs((prev) => {
      const newMap = new Map(prev);
      newMap.set(fabricId, unit);
      return newMap;
    });

    // Update selectedItems unit if selected
    setSelectedItems((prev) => {
      if (prev.has(fabricId)) {
        const newMap = new Map(prev);
        const item = newMap.get(fabricId)!;
        newMap.set(fabricId, {
          ...item,
          saleUnit: unit,
        });
        return newMap;
      }
      return prev;
    });

    // Re-validate quantity with new unit
    setQuantityErrors((prevErrors) => {
      const newErrors = new Map(prevErrors);
      const quantityValue = quantityInputsRef.current.get(fabricId) || '';
      const error = validateQuantity(fabricId, quantityValue, unit);
      if (error) {
        newErrors.set(fabricId, error);
      } else {
        newErrors.delete(fabricId);
      }
      return newErrors;
    });
  }, [validateQuantity]);

  /**
   * Handle search button click
   */
  const handleSearchClick = () => {
    handleSearch(tempSearchQuery);
  };

  /**
   * Handle search on Enter key
   */
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  /**
   * Handle continue to step 2
   */
  const handleContinue = () => {
    // Validate selection
    const items = Array.from(selectedItems.values());
    if (items.length === 0) {
      toast.error('Vui lòng chọn ít nhất một mặt hàng');
      return;
    }

    // Validate quantities - all selected items must have quantity > 0 and within limits
    const newErrors = new Map<number, string>();
    let hasErrors = false;

    items.forEach((item) => {
      const qty = quantityInputsRef.current.get(item.fabricId)?.trim() || '';
      const unit = unitInputsRef.current.get(item.fabricId) || 'METER';
      const error = validateQuantity(item.fabricId, qty, unit);
      
      if (error) {
        newErrors.set(item.fabricId, error);
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setQuantityErrors(newErrors);
      toast.error('Vui lòng sửa lỗi nhập liệu');
      return;
    }

    // Save to store and navigate to step 2
    setStoreSelectedItems(selectedItems);
    setStoreQuantityInputs(quantityInputs);
    setStoreUnitInputs(unitInputs);
    goToStep2();
  };

  // Memoize columns only when callbacks change (they're stable from useCallback)
  const columns = useMemo(
    () =>
      createCreateOrderFabricColumns({
        isSelected,
        getQuantity,
        getUnit,
        getPrice,
        getQuantityError,
        onToggleSelect: handleToggleSelect,
        onQuantityChange: handleQuantityChange,
        onUnitChange: handleUnitChange,
      }),
    [isSelected, getQuantity, getUnit, getPrice, getQuantityError, handleToggleSelect, handleQuantityChange, handleUnitChange]
  );

  if (loading && fabrics.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          <p className="text-gray-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <Button
            onClick={() => {
              reset();
              refresh();
            }}
            variant="outline"
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Đã chọn: <strong>{selectedItems.size}</strong> mặt hàng
          </span>
        </div>
        <Button onClick={handleContinue} disabled={selectedItems.size === 0}>
          Tiếp tục
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm vải..."
            value={tempSearchQuery}
            onChange={(e) => setTempSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="pl-9"
          />
        </div>
        <Button onClick={handleSearchClick} variant="outline" size="icon">
          <Search className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => {
            reset();
            refresh();
          }}
          variant="outline"
          size="icon"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Info bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Tổng: <span className="font-medium">{pagination.total}</span> loại vải
        </p>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={fabrics}
        sorting={sorting}
        onSortingChange={setSorting}
        columnFilters={columnFilters}
        onColumnFiltersChange={setColumnFilters}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        manualPagination
        pageCount={pagination.totalPages}
        pageIndex={pagination.page - 1}
        pageSize={pagination.limit}
        onPaginationChange={handlePaginationChange}
        manualSorting
        manualFiltering
      />

      {/* Selected Items List */}
      {selectedItems.size > 0 && (
        <Card className="bg-card border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Vải được chọn ({selectedItemsList.length})</CardTitle>
                <CardDescription>Danh sách vải sẽ được thêm vào đơn hàng</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 max-h-96 overflow-y-auto">
              {selectedItemsList.map((item, idx) => (
                <div
                  key={item.fabricId}
                  className="flex items-start justify-between p-3 bg-accent rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex-shrink-0">
                        {idx + 1}
                      </span>
                      <p className="font-semibold text-sm truncate">{item.fabric.fabricInfo.category}</p>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1 ml-8">
                      <p>Màu: {item.fabric.fabricInfo.color}</p>
                      <p>NCC: {item.fabric.fabricInfo.supplier}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-4 flex-shrink-0 text-right">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Số lượng</p>
                      <p className="font-semibold text-sm">
                        {item.quantity} {item.saleUnit === 'METER' ? 'mét' : 'cuộn'}
                      </p>
                    </div>
                    <div className="border-l pl-3">
                      <p className="text-xs text-muted-foreground mb-1">Giá/đơn vị</p>
                      <p className="font-semibold text-sm">
                        {(item.saleUnit === 'METER'
                          ? item.fabric.fabricInfo.sellingPricePerMeter
                          : item.fabric.fabricInfo.sellingPrice || item.fabric.fabricInfo.sellingPricePerRoll
                        ).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">₫</p>
                    </div>
                    <button
                      onClick={() => {
                        const newItems = new Map(selectedItems);
                        newItems.delete(item.fabricId);
                        setSelectedItems(newItems);
                        setQuantityInputs((prev) => {
                          const newMap = new Map(prev);
                          newMap.delete(item.fabricId);
                          return newMap;
                        });
                        setUnitInputs((prev) => {
                          const newMap = new Map(prev);
                          newMap.delete(item.fabricId);
                          return newMap;
                        });
                        setQuantityErrors((prev) => {
                          const newMap = new Map(prev);
                          newMap.delete(item.fabricId);
                          return newMap;
                        });
                      }}
                      className="ml-2 p-1.5 hover:bg-destructive/10 rounded-md transition-colors text-destructive flex-shrink-0"
                      title="Xoá"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default CreateOrderFabricTable;
