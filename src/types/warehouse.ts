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
