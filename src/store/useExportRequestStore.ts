'use client';

import { create } from 'zustand';
import type { FabricListItem } from '@/types/fabric';
import type { SuggestFabricAllocation, WarehouseStock, AllocationSummary } from '@/types/exportFabric';
import type { ExportFabricDetail } from '@/services/exportFabric.service';

export type BatchExportResult = {
  batchId: number;
  exports: ExportFabricDetail[];
};

export type ExportRequestItem = {
  fabricId: number;
  quantity: number;
  fabric: FabricListItem;
};

// Warehouse allocation for a fabric
export type FabricWarehouseAllocation = {
  warehouseId: number;
  warehouseName: string;
  quantity: number;
  maxStock: number;
};

// Full allocation state for a fabric
export type FabricAllocationState = {
  fabricId: number;
  fabric: SuggestFabricAllocation['fabric'];
  requestedQuantity: number;
  availableStocks: WarehouseStock[];
  totalAvailable: number;
  isSufficient: boolean;
  allocations: FabricWarehouseAllocation[];
};

type ExportRequestState = {
  // Step 1 state
  storeId: number | null;
  storeName: string;
  storeLatitude?: number;
  storeLongitude?: number;
  selectedItems: Map<number, ExportRequestItem>;
  quantityInputs: Map<number, string>;
  note: string;
  
  // Step 2 state
  currentStep: 1 | 2;
  allocations: Map<number, FabricAllocationState>;
  allocationSummary: AllocationSummary | null;
  isLoadingSuggestions: boolean;
  
  // Batch result (after successful creation)
  batchResult: BatchExportResult | null;
  
  // Actions
  setStoreInfo: (storeId: number, storeName: string, latitude?: number, longitude?: number) => void;
  setSelectedItems: (items: Map<number, ExportRequestItem>) => void;
  setQuantityInputs: (inputs: Map<number, string>) => void;
  setNote: (note: string) => void;
  
  // Step navigation
  goToStep2: () => void;
  goToStep1: () => void;
  
  // Allocation actions
  setAllocations: (allocations: SuggestFabricAllocation[], summary?: AllocationSummary) => void;
  setIsLoadingSuggestions: (loading: boolean) => void;
  updateFabricAllocation: (
    fabricId: number,
    allocationIndex: number,
    updates: Partial<FabricWarehouseAllocation>
  ) => void;
  addWarehouseAllocation: (fabricId: number, warehouse: WarehouseStock) => void;
  removeWarehouseAllocation: (fabricId: number, allocationIndex: number) => void;
  
  // Get total allocated for a fabric
  getTotalAllocated: (fabricId: number) => number;
  
  // Validation
  isAllocationValid: () => boolean;
  
  // Get final export data
  getExportData: () => {
    storeId: number;
    note: string | undefined;
    exportItems: Array<{
      fabricId: number;
      quantity: number;
      warehouseAllocations: Array<{
        warehouseId: number;
        quantity: number;
      }>;
    }>;
  } | null;
  
  // Get batch export data grouped by warehouse (for API /batch)
  getBatchExportData: () => {
    storeId: number;
    note: string | undefined;
    warehouseAllocations: Array<{
      warehouseId: number;
      warehouseName: string;
      items: Array<{
        fabricId: number;
        quantity: number;
      }>;
    }>;
  } | null;
  
  // Get warehouse summary (count of orders per warehouse)
  getWarehouseSummary: () => Array<{
    warehouseId: number;
    warehouseName: string;
    fabricCount: number;
    totalQuantity: number;
  }>;
  
  // Set batch result after successful creation
  setBatchResult: (result: BatchExportResult) => void;
  
  // Reset
  reset: () => void;
};

const initialState = {
  storeId: null as number | null,
  storeName: '',
  storeLatitude: undefined as number | undefined,
  storeLongitude: undefined as number | undefined,
  selectedItems: new Map<number, ExportRequestItem>(),
  quantityInputs: new Map<number, string>(),
  note: '',
  currentStep: 1 as const,
  allocations: new Map<number, FabricAllocationState>(),
  allocationSummary: null as AllocationSummary | null,
  isLoadingSuggestions: false,
  batchResult: null as BatchExportResult | null,
};

export const useExportRequestStore = create<ExportRequestState>((set, get) => ({
  ...initialState,

  setStoreInfo: (storeId, storeName, latitude, longitude) => set({ storeId, storeName, storeLatitude: latitude, storeLongitude: longitude }),

  setSelectedItems: (items) => set({ selectedItems: new Map(items) }),

  setQuantityInputs: (inputs) => set({ quantityInputs: new Map(inputs) }),

  setNote: (note) => set({ note }),

  goToStep2: () => set({ currentStep: 2 }),

  goToStep1: () => set({ currentStep: 1 }),

  setAllocations: (suggestAllocations, summary) => {
    const allocationsMap = new Map<number, FabricAllocationState>();
    
    suggestAllocations.forEach((suggestion) => {
      // Create initial allocations from suggested warehouses (those with selected: true)
      const initialAllocations: FabricWarehouseAllocation[] = suggestion.availableStocks
        .filter((stock) => stock.selected && stock.takeQuantity > 0)
        .map((stock) => ({
          warehouseId: stock.warehouseId,
          warehouseName: stock.warehouseName,
          quantity: stock.takeQuantity,
          maxStock: stock.currentStock,
        }));

      allocationsMap.set(suggestion.fabricId, {
        fabricId: suggestion.fabricId,
        fabric: suggestion.fabric,
        requestedQuantity: suggestion.requestedQuantity,
        availableStocks: suggestion.availableStocks,
        totalAvailable: suggestion.totalAvailable,
        isSufficient: suggestion.isSufficient,
        allocations: initialAllocations,
      });
    });

    set({ 
      allocations: allocationsMap,
      allocationSummary: summary || null,
    });
  },

  setIsLoadingSuggestions: (loading) => set({ isLoadingSuggestions: loading }),

  updateFabricAllocation: (fabricId, allocationIndex, updates) => {
    const { allocations } = get();
    const fabricAllocation = allocations.get(fabricId);
    
    if (!fabricAllocation) return;

    const newAllocations = [...fabricAllocation.allocations];
    newAllocations[allocationIndex] = {
      ...newAllocations[allocationIndex],
      ...updates,
    };

    const newAllocationsMap = new Map(allocations);
    newAllocationsMap.set(fabricId, {
      ...fabricAllocation,
      allocations: newAllocations,
    });

    set({ allocations: newAllocationsMap });
  },

  addWarehouseAllocation: (fabricId, warehouse) => {
    const { allocations } = get();
    const fabricAllocation = allocations.get(fabricId);
    
    if (!fabricAllocation) return;

    // Check if warehouse already added
    const existing = fabricAllocation.allocations.find(
      (a) => a.warehouseId === warehouse.warehouseId
    );
    if (existing) return;

    const newAllocation: FabricWarehouseAllocation = {
      warehouseId: warehouse.warehouseId,
      warehouseName: warehouse.warehouseName,
      quantity: 0,
      maxStock: warehouse.currentStock,
    };

    const newAllocationsMap = new Map(allocations);
    newAllocationsMap.set(fabricId, {
      ...fabricAllocation,
      allocations: [...fabricAllocation.allocations, newAllocation],
    });

    set({ allocations: newAllocationsMap });
  },

  removeWarehouseAllocation: (fabricId, allocationIndex) => {
    const { allocations } = get();
    const fabricAllocation = allocations.get(fabricId);
    
    if (!fabricAllocation) return;

    const newAllocations = fabricAllocation.allocations.filter(
      (_, index) => index !== allocationIndex
    );

    const newAllocationsMap = new Map(allocations);
    newAllocationsMap.set(fabricId, {
      ...fabricAllocation,
      allocations: newAllocations,
    });

    set({ allocations: newAllocationsMap });
  },

  getTotalAllocated: (fabricId) => {
    const { allocations } = get();
    const fabricAllocation = allocations.get(fabricId);
    
    if (!fabricAllocation) return 0;

    return fabricAllocation.allocations.reduce((sum, a) => sum + a.quantity, 0);
  },

  isAllocationValid: () => {
    const { allocations } = get();
    
    for (const [, fabricAllocation] of allocations) {
      const totalAllocated = fabricAllocation.allocations.reduce(
        (sum, a) => sum + a.quantity,
        0
      );
      
      // Must allocate exactly the requested quantity
      if (totalAllocated !== fabricAllocation.requestedQuantity) {
        return false;
      }

      // Each allocation must not exceed max stock
      for (const allocation of fabricAllocation.allocations) {
        if (allocation.quantity > allocation.maxStock) {
          return false;
        }
        if (allocation.quantity < 0) {
          return false;
        }
      }
    }

    return true;
  },

  getExportData: () => {
    const { storeId, note, allocations, isAllocationValid } = get();
    
    if (!storeId || !isAllocationValid()) return null;

    const exportItems: Array<{
      fabricId: number;
      quantity: number;
      warehouseAllocations: Array<{
        warehouseId: number;
        quantity: number;
      }>;
    }> = [];

    for (const [fabricId, fabricAllocation] of allocations) {
      const warehouseAllocations = fabricAllocation.allocations
        .filter((a) => a.quantity > 0)
        .map((a) => ({
          warehouseId: a.warehouseId,
          quantity: a.quantity,
        }));

      if (warehouseAllocations.length > 0) {
        exportItems.push({
          fabricId,
          quantity: fabricAllocation.requestedQuantity,
          warehouseAllocations,
        });
      }
    }

    return {
      storeId,
      note: note || undefined,
      exportItems,
    };
  },

  getBatchExportData: () => {
    const { storeId, note, allocations, isAllocationValid } = get();
    
    if (!storeId || !isAllocationValid()) return null;

    // Group allocations by warehouse
    const warehouseMap = new Map<number, {
      warehouseId: number;
      warehouseName: string;
      items: Array<{ fabricId: number; quantity: number }>;
    }>();

    for (const [fabricId, fabricAllocation] of allocations) {
      for (const allocation of fabricAllocation.allocations) {
        if (allocation.quantity <= 0) continue;

        if (!warehouseMap.has(allocation.warehouseId)) {
          warehouseMap.set(allocation.warehouseId, {
            warehouseId: allocation.warehouseId,
            warehouseName: allocation.warehouseName,
            items: [],
          });
        }

        warehouseMap.get(allocation.warehouseId)!.items.push({
          fabricId,
          quantity: allocation.quantity,
        });
      }
    }

    return {
      storeId,
      note: note || undefined,
      warehouseAllocations: Array.from(warehouseMap.values()),
    };
  },

  getWarehouseSummary: () => {
    const { allocations } = get();
    
    const warehouseMap = new Map<number, {
      warehouseId: number;
      warehouseName: string;
      fabricCount: number;
      totalQuantity: number;
    }>();

    for (const [, fabricAllocation] of allocations) {
      for (const allocation of fabricAllocation.allocations) {
        if (allocation.quantity <= 0) continue;

        if (!warehouseMap.has(allocation.warehouseId)) {
          warehouseMap.set(allocation.warehouseId, {
            warehouseId: allocation.warehouseId,
            warehouseName: allocation.warehouseName,
            fabricCount: 0,
            totalQuantity: 0,
          });
        }

        const warehouse = warehouseMap.get(allocation.warehouseId)!;
        warehouse.fabricCount += 1;
        warehouse.totalQuantity += allocation.quantity;
      }
    }

    return Array.from(warehouseMap.values());
  },

  setBatchResult: (result) => set({ batchResult: result }),

  reset: () => set(initialState),
}));

export default useExportRequestStore;
