import type { PaginationState } from './common';

export enum ImportFabricStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ImportFabricItemStatus {
  PENDING = 'PENDING',
  STORED = 'STORED',
  CANCELLED = 'CANCELLED',
}

export type ImportFabricListItem = {
  id: number;
  importDate: string;
  totalPrice: number;
  status: ImportFabricStatus;
  warehouse: {
    id: number;
    name: string;
  };
  importUser: {
    fullname: string;
  };
  createdAt: string;
};

export type ImportFabricListResponse = {
  message: string;
  data: ImportFabricListItem[];
  pagination: PaginationState;
};

export type ImportFabricListParams = {
  page?: number;
  limit?: number;
  sortBy?: string; // e.g., "id,importDate,totalPrice,createdAt"
  order?: string; // e.g., "asc,desc"
  warehouseId?: number;
  importer?: string; // UUID của người nhập
  status?: string; // e.g., "PENDING,COMPLETED" for multiple statuses
  importDateFrom?: string; // ISO 8601 date string
  importDateTo?: string; // ISO 8601 date string
};

// Detail types
export type ImportFabricColor = {
  id: string;
  name: string;
  hexCode?: string;
};

export type ImportFabricGloss = {
  id: number;
  description: string;
};

export type ImportFabricSupplier = {
  id: number;
  name: string;
  phone: string;
};

export type ImportFabricCategory = {
  id: number;
  name: string;
};

export type ImportFabricDetail = {
  id: number;
  thickness: number;
  glossId: number;
  length: number;
  width: number;
  weight: number;
  sellingPrice: number;
  quantityInStock: number;
  categoryId: number;
  colorId: string;
  supplierId: number;
  createdAt: string;
  updatedAt: string;
  supplier: ImportFabricSupplier;
  category: ImportFabricCategory;
  color: ImportFabricColor;
  gloss: ImportFabricGloss;
};

export type ImportFabricItem = {
  importFabricId: number;
  fabricId: number;
  quantity: number;
  price: number;
  status: ImportFabricItemStatus;
  createdAt: string;
  updatedAt: string;
  fabric: ImportFabricDetail;
};

export type ImportFabricWarehouse = {
  id: number;
  name: string;
  address: string;
};

export type ImportFabricUser = {
  id: string;
  fullname: string;
  email: string;
  phone: string;
};

export type ImportFabricFullDetail = {
  id: number;
  warehouseId: number;
  importer: string;
  importDate: string;
  totalPrice: number;
  status: ImportFabricStatus;
  warehouse: ImportFabricWarehouse;
  importUser: ImportFabricUser;
  importItems: ImportFabricItem[];
  createdAt: string;
  updatedAt: string;
};

export type ImportFabricDetailResponse = {
  message: string;
  data: ImportFabricFullDetail;
};
