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

export type FabricColor = {
  id: string;
  name: string;
  hexCode?: string;
};

export type FabricCategory = {
  id: number;
  name: string;
  description?: string;
  sellingPricePerMeter?: number;
  sellingPricePerRoll?: number;
};

export type FabricGloss = {
  id: number;
  description: string;
};

export type FabricSupplier = {
  id: number;
  name: string;
  address?: string;
  phone?: string;
};

export type ExportFabricItemDetail = {
  id: number;
  exportFabricId: number;
  fabricId: number;
  quantity: number;
  price: number | null;
  createdAt: string;
  updatedAt: string;
  fabric: {
    id: number;
    thickness: number;
    length: number;
    width: number;
    weight: number;
    quantityInStock: number;
    sellingPrice: number;
    colorId: string;
    categoryId: number;
    supplierId: number;
    color: FabricColor;
    category: FabricCategory;
    gloss: FabricGloss;
    supplier: FabricSupplier;
  };
  shelfSuggestions?: ShelfSuggestion[];
};

export type ExportFabricItem = ExportFabricItemDetail;

export type ExportFabricWarehouse = {
  id: number;
  name: string;
  address: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
};

export type ExportFabricStoreDetail = {
  id: number;
  name: string;
  address: string;
  createdAt: string;
  updatedAt: string;
};

export type ExportFabricUser = {
  id: string;
  username: string;
  email: string;
  fullname?: string;
  createdAt?: string;
};

export type ExportFabricDetail = {
  id: number;
  warehouseId: number;
  storeId: number;
  status: ExportFabricStatus;
  note: string | null;
  batchId: number | null;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  receivedById: string | null;
  warehouse: ExportFabricWarehouse;
  store: ExportFabricStoreDetail;
  createdBy: ExportFabricUser;
  receivedBy: ExportFabricUser | null;
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
