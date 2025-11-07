import type { PaginationState } from './common';

export type SupplierListItem = {
  id: number;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SupplierListResponse = {
  message: string;
  data: SupplierListItem[];
  pagination: PaginationState;
};

export type SupplierListParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string; // e.g., "name"
  order?: string; // e.g., "asc,desc"
  createdFrom?: string; // ISO date string
  createdTo?: string; // ISO date string
};

export type CreateSupplierPayload = {
  name: string;
  address: string;
  phone: string;
  isActive?: boolean;
};

export type UpdateSupplierPayload = {
  name?: string;
  address?: string;
  phone?: string;
  isActive?: boolean;
};

export type CreateSupplierResponse = {
  message: string;
  supplier: SupplierListItem;
};

export type UpdateSupplierResponse = {
  message: string;
  supplier: SupplierListItem;
};

export type GetSupplierResponse = {
  message: string;
  supplier: SupplierListItem;
};
