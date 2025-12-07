import type { PaginationState } from './common';

export type ExportFabricStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type ExportFabricListItem = {
  id: number;
  warehouse: {
    id: number;
    name: string;
  };
  store: {
    id: number;
    name: string;
  };
  status: ExportFabricStatus;
  note: string | null;
  createdAt: string;
  updatedAt?: string;
  createdBy: {
    username: string;
    email?: string;
  };
  receivedBy?: {
    username: string;
    email?: string;
  };
};

export type ExportFabricListResponse = {
  message: string;
  data: ExportFabricListItem[];
  pagination: PaginationState;
};

export type ExportFabricListParams = {
  page?: number;
  limit?: number;
  search?: string;
  warehouseId?: number | string;
  storeId?: number | string;
  status?: string; // e.g., "PENDING,COMPLETED"
  sortBy?: string; // e.g., "id,createdAt,updatedAt,status"
  order?: string; // e.g., "asc,desc"
};

export type ShelfSuggestion = {
  shelfId: number;
  shelfCode: string;
  availableQuantity: number;
};

export type ExportFabricItem = {
  fabricId: number;
  quantity: number;
  price: number | null;
  fabric: {
    id: number;
    colorId: string;
    categoryId: number;
    sellingPrice: number;
    supplierId: number;
  };
  shelfSuggestions?: ShelfSuggestion[];
};

export type ExportFabricDetail = {
  id: number;
  warehouseId: number;
  warehouse: {
    name: string;
  };
  store: {
    name: string;
  };
  status: ExportFabricStatus;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  createdBy: {
    username: string;
    email: string;
  };
  receivedById: string | null;
  receivedBy: {
    username: string;
    email: string;
  } | null;
  exportItems: ExportFabricItem[];
};

export type ExportFabricDetailResponse = {
  message: string;
  exportFabric: ExportFabricDetail;
};

// Suggest allocation types
export type SuggestFabricItem = {
  fabricId: number;
  quantity: number;
};

export type SuggestAllocationRequest = {
  fabricItems: SuggestFabricItem[];
};

export type WarehouseStock = {
  warehouseId: number;
  warehouseName: string;
  currentStock: number;
  selected: boolean;
  takeQuantity: number;
};

export type SuggestFabricAllocation = {
  fabricId: number;
  fabric: {
    id: number;
    thickness: number;
    gloss: {
      id: number;
      description: string;
    };
    length: number;
    width: number;
    weight: number;
    sellingPrice: number;
    quantityInStock: number;
    category: {
      id: number;
      name: string;
    };
    color: {
      id: string;
      name: string;
      hexCode?: string;
    };
    supplier: {
      id: number;
      name: string;
    };
    createdAt: string;
    updatedAt: string;
  };
  requestedQuantity: number;
  availableStocks: WarehouseStock[];
  totalAvailable: number;
  isSufficient: boolean;
};

export type SuggestAllocationResponse = {
  message: string;
  warehouseAllocations: {
    fabrics: SuggestFabricAllocation[];
  };
};
