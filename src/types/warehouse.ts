import type { PaginationState } from './common';

export type WarehouseStatus = 'ACTIVE' | 'INACTIVE';

export type WarehouseListItem = {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  status: WarehouseStatus;
  createdAt: string;
  updatedAt: string;
};

export type WarehouseListResponse = {
  message: string;
  data: WarehouseListItem[];
  pagination: PaginationState;
};

export type WarehouseListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string; // e.g., "ACTIVE,INACTIVE"
  sortBy?: string; // e.g., "name,createdAt"
  order?: string; // e.g., "desc,asc"
  createdFrom?: string; // ISO date string
  createdTo?: string; // ISO date string
};

export type ShelfListItem = {
  id: number;
  code: string;
  currentQuantity: number;
  maxQuantity: number;
  warehouseId: number;
  createdAt: string;
  updatedAt: string;
};

export type ShelfListResponse = {
  message: string;
  data: ShelfListItem[];
  pagination: PaginationState;
};

export type ShelfGroupByField = 'categoryId' | 'colorId' | 'glossId' | 'supplierId';

export type ShelfListParams = {
  page?: number;
  limit?: number;
  search?: string;
  warehouseId?: string; // supports multiple IDs separated by comma, e.g., "1,2,3"
  fabricId?: string; // supports multiple IDs separated by comma, e.g., "5,10,15"
  sortBy?: string; // e.g., "id", "code", "currentQuantity", "maxQuantity", "warehouseId", "createdAt", "updatedAt"
  order?: string; // "asc" or "desc"
  createdFrom?: string; // ISO date string
  createdTo?: string; // ISO date string
  groupBy?: string; // comma-separated fields: "categoryId", "colorId", "glossId", "supplierId"
};

export type CreateShelfPayload = {
  code: string;
  maxQuantity: number;
  warehouseId: number;
};

export type UpdateShelfPayload = {
  code?: string;
  maxQuantity?: number;
  currentQuantity?: number;
  warehouseId?: number;
};

export type CreateShelfResponse = {
  message: string;
  shelf: ShelfListItem;
};

export type UpdateShelfResponse = {
  message: string;
  shelf: ShelfListItem;
};

export type GlossInfo = {
  id?: number;
  description: string;
};

export type CategoryInfo = {
  id?: number;
  name: string;
};

export type ColorInfo = {
  id?: string;
  name: string;
  hexCode?: string;
};

export type SupplierInfo = {
  id?: number;
  name: string;
};

export type FabricShelfItem = {
  fabricId: number;
  quantity: number;
  fabric: {
    id: number;
    thickness: number;
    length: number;
    width: number;
    weight: number;
    gloss?: GlossInfo;
    category?: CategoryInfo;
    color?: ColorInfo;
    supplier?: SupplierInfo;
  };
};

export type ShelfDetail = ShelfListItem & {
  fabricShelf: FabricShelfItem[];
};

export type ShelfWithFabricListItem = ShelfListItem & {
  fabricShelf: FabricShelfItem[];
};

export type ShelfWithFabricListResponse = {
  message: string;
  data: ShelfWithFabricListItem[];
  pagination: PaginationState;
};

export type GetShelfResponse = {
  message: string;
  shelf: ShelfDetail;
};

// Grouped shelf types for when groupBy param is used
export type FabricGroup = {
  totalQuantity: number;
  category?: CategoryInfo;
  color?: ColorInfo;
  gloss?: GlossInfo;
  supplier?: SupplierInfo;
};

export type ShelfWithGroups = ShelfListItem & {
  fabricGroups: FabricGroup[];
};

export type ShelfWithGroupsListResponse = {
  message: string;
  data: ShelfWithGroups[];
  pagination: PaginationState;
};

// Union type for shelf list response (either grouped or with fabric details)
export type ShelfListApiResponse = ShelfListResponse | ShelfWithFabricListResponse | ShelfWithGroupsListResponse;

// Fabric Shelf Detail types
export type FabricShelfImporter = {
  id: string;
  fullname: string;
  username: string;
};

export type FabricShelfImportItem = {
  importId: number;
  currentQuantity: number;
  importDate: string;
  importer: FabricShelfImporter;
  importPrice: number;
  importStatus: string;
};

export type FabricShelfDetailData = {
  shelfId: number;
  fabricId: number;
  shelf: {
    id: number;
    code: string;
    warehouseId: number;
  };
  totalCurrentQuantity: number;
  importCount: number;
  imports: FabricShelfImportItem[];
};

export type FabricShelfDetailResponse = {
  message: string;
  data: FabricShelfDetailData;
};

// Fabric Shelves by Warehouse types (for export approval)
export type FabricBatchInfo = {
  importId: number;
  importDate: string;
  importStatus: string;
  importPrice: number;
  currentQuantity: number;
  originalQuantity: number;
  importedBy: {
    id: string;
    fullname: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type FabricShelfWithBatches = {
  id: number;
  code: string;
  currentQuantity: number;
  maxQuantity: number;
  totalFabricQuantity: number;
  batches: FabricBatchInfo[];
};

export type FabricShelvesData = {
  warehouseId: number;
  fabricId: number;
  fabric: {
    id: number;
    thickness: number;
    length: number;
    width: number;
    weight: number;
    sellingPrice: number;
    categoryId: number;
    colorId: string;
    supplierId: number;
    category: CategoryInfo;
    color: ColorInfo;
    supplier: SupplierInfo;
    gloss: GlossInfo;
  };
  totalShelves: number;
  totalBatches: number;
  totalQuantity: number;
  shelves: FabricShelfWithBatches[];
};

export type FabricShelvesResponse = {
  message: string;
  data: FabricShelvesData;
};

// Fabric Pickup Priority types
export type FabricPickupPriority = 
  | 'NEWEST_FIRST'    // Ưu tiên lấy lô nhập mới nhất trước
  | 'OLDEST_FIRST'    // Ưu tiên lấy lô nhập cũ nhất trước (FIFO)
  | 'LOWEST_PRICE'    // Ưu tiên lấy lô có giá nhập thấp nhất trước
  | 'HIGHEST_PRICE'   // Ưu tiên lấy lô có giá nhập cao nhất trước
  | 'FEWEST_SHELVES'; // Ưu tiên lấy ít kệ nhất (lấy từ kệ có nhiều hàng trước)

export type FabricPickupBatch = {
  importId: number;
  importDate: string;
  importPrice: number;
  availableQuantity: number;
  pickQuantity: number;
};

export type FabricPickupShelf = {
  shelfId: number;
  shelfCode: string;
  totalPickQuantity: number;
  batches: FabricPickupBatch[];
};

export type FabricPickupSummary = {
  totalShelvesUsed: number;
  totalBatchesUsed: number;
  totalPickQuantity: number;
  totalCost: number;
  averageCostPerUnit: number;
};

export type FabricPickupData = {
  warehouseId: number;
  fabricId: number;
  fabric: {
    id: number;
    thickness: number;
    length: number;
    width: number;
    weight: number;
    sellingPrice: number;
    category: CategoryInfo;
    color: ColorInfo;
    supplier: SupplierInfo;
    gloss: GlossInfo;
  };
  requiredQuantity: number;
  totalAvailable: number;
  priority: FabricPickupPriority;
  summary: FabricPickupSummary;
  shelves: FabricPickupShelf[];
};

export type FabricPickupResponse = {
  message: string;
  data: FabricPickupData;
};

export type FabricPickupParams = {
  quantity: number;
  priority: FabricPickupPriority;
};

// Warehouse Manager Assignment Types
export type WarehouseManagerAssignment = {
  userId: string;
  warehouseId: number;
  assignedAt: string;
  warehouse: {
    id: number;
    name: string;
    address: string;
  };
};

export type UserWarehousesResponse = {
  message: string;
  data: WarehouseManagerAssignment[];
};

export type AssignUserWarehousesPayload = {
  userId: string;
  warehouseIds: number[];
};

export type AssignUserWarehousesResult = {
  totalAssigned: number;
  successful: number[];
  failed: number[];
  userId: string;
};

export type AssignUserWarehousesResponse = {
  message: string;
  data: AssignUserWarehousesResult;
};

// Fabric Adjustment Types
export type AdjustmentType = 'IMPORT' | 'DESTROY';

export type AdjustFabricPayload = {
  fabricId: number | string;
  importId: number;
  quantity: number;
  type: AdjustmentType;
  reason: string;
};

export type AdjustmentUser = {
  id: string;
  username: string;
  fullname: string;
  email: string;
};

export type AdjustmentData = {
  id: number;
  fabricId: number;
  shelfId: number;
  quantity: number;
  type: AdjustmentType;
  price: number;
  reason: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: AdjustmentUser;
};

export type FabricShelfAfterAdjustment = {
  shelfId: number;
  fabricId: number;
  importId: number;
  oldQuantity: number;
  newQuantity: number;
  change: number;
  type: AdjustmentType;
  fabric: {
    id: number;
  };
  shelf: {
    id: number;
    code: string;
  };
  updatedAt: string;
};

export type AdjustFabricResponseData = {
  adjustment: AdjustmentData;
  fabricShelf: FabricShelfAfterAdjustment;
};

export type AdjustFabricResponse = {
  message: string;
  data: AdjustFabricResponseData;
};

// Fabric Adjustment History Types
export type AdjustFabricHistoryItem = {
  id: number;
  fabricId: number;
  shelfId: number;
  quantity: number;
  type: AdjustmentType;
  price: number;
  reason: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    fullname: string;
    email: string;
  };
  fabric: {
    id: number;
    thickness: number;
    length: number;
    width: number;
    weight: number;
    sellingPrice: number;
    quantityInStock: number;
    categoryId: number;
    colorId: string;
    supplierId: number;
    glossId: number;
    createdAt: string;
    updatedAt: string;
    category: {
      id: number;
      name: string;
      description: string;
      sellingPricePerMeter: number;
      sellingPricePerRoll: number;
      image: string;
    };
    color: {
      id: string;
      name: string;
      hexCode: string;
    };
    supplier: {
      id: number;
      name: string;
      address: string;
      phone: string;
      isActive: boolean;
    };
    gloss: {
      id: number;
      description: string;
    };
  };
  shelf: {
    id: number;
    code: string;
    warehouseId: number;
    currentQuantity: number;
    maxQuantity: number;
    warehouse: {
      id: number;
      name: string;
      address: string;
      latitude: number;
      longitude: number;
      status: WarehouseStatus;
    };
  };
};

export type AdjustFabricHistoryParams = {
  page?: number;
  limit?: number;
  fabricId?: string;
  shelfId?: string;
  type?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  createdFrom?: string;
  createdTo?: string;
  search?: string;
};

export type AdjustFabricHistoryResponse = {
  message: string;
  data: AdjustFabricHistoryItem[];
  pagination: PaginationState;
};

