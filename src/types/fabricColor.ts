import type { PaginationState } from './common';

export type FabricColorListItem = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type FabricColorListResponse = {
  message: string;
  data: FabricColorListItem[];
  pagination: PaginationState;
};

export type FabricColorListParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string; // e.g., "name"
  order?: string; // e.g., "asc,desc"
  createdFrom?: string; // ISO date string
  createdTo?: string; // ISO date string
};

export type CreateFabricColorPayload = {
  id: string;
  name: string;
};

export type UpdateFabricColorPayload = {
  name?: string;
};

export type CreateFabricColorResponse = {
  message: string;
  fabricColor: FabricColorListItem;
};

export type UpdateFabricColorResponse = {
  message: string;
  fabricColor: FabricColorListItem;
};

export type GetFabricColorResponse = {
  message: string;
  fabricColor: FabricColorListItem;
};
