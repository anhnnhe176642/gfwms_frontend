import type { PaginationState } from './common';

export type StoreListItem = {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type StoreListResponse = {
  message: string;
  data: StoreListItem[];
  pagination: PaginationState;
};

export type StoreListParams = {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string; // e.g., "name,createdAt"
  order?: string; // e.g., "asc,desc"
  createdFrom?: string; // ISO date string
  createdTo?: string; // ISO date string
};

export type CreateStoreResponse = {
  message: string;
  store: StoreListItem;
};

export type UpdateStoreResponse = {
  message: string;
  store: StoreListItem;
};

export type GetStoreResponse = {
  message: string;
  store: StoreListItem;
};

export type UserStoreAssignment = {
  id: number;
  userId: string;
  storeId: number;
  createdAt: string;
  updatedAt: string;
  store: StoreListItem;
};

export type UserStoresResponse = {
  message: string;
  data: UserStoreAssignment[];
};

export type AssignUserStoragesPayload = {
  userId: string;
  storeIds: number[];
};

export type AssignUserStoragesResponse = {
  message: string;
  data: UserStoreAssignment[];
};

