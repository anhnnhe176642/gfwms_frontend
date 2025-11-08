import type { PaginationState } from './common';

export type ImportFabricListItem = {
  id: number;
  importDate: string;
  totalPrice: number;
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
  importDateFrom?: string; // ISO 8601 date string
  importDateTo?: string; // ISO 8601 date string
};
