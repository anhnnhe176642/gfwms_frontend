import type { PaginationState } from './common';

export type FabricGlossListItem = {
  id: number;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type FabricGlossListResponse = {
  message: string;
  data: FabricGlossListItem[];
  pagination: PaginationState;
};

export type FabricGlossListParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string; // e.g., "description"
  order?: string; // e.g., "asc,desc"
  createdFrom?: string; // ISO date string
  createdTo?: string; // ISO date string
};

export type CreateFabricGlossPayload = {
  description: string;
};

export type UpdateFabricGlossPayload = {
  description?: string;
};

export type CreateFabricGlossResponse = {
  message: string;
  data: FabricGlossListItem;
};

export type UpdateFabricGlossResponse = {
  message: string;
  data: FabricGlossListItem;
};

export type GetFabricGlossResponse = {
  message: string;
  fabricGloss: FabricGlossListItem;
};
