import type { PaginationState } from './common';

export type WarehouseStatus = 'ACTIVE' | 'INACTIVE';

export type WarehouseListItem = {
  id: number;
  name: string;
  address: string;
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

