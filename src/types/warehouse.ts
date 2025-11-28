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

export type ShelfListParams = {
  page?: number;
  limit?: number;
  search?: string;
  warehouseId?: number;
  fabricId?: number; // Filter shelves that contain specific fabric
  sortBy?: string; // e.g., "code,createdAt"
  order?: string; // e.g., "asc,desc"
  createdFrom?: string; // ISO date string
  createdTo?: string; // ISO date string
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
