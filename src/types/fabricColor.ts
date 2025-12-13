import type { PaginationState } from './common';

export type FabricColorListItem = {
  id: string;
  name: string;
  hexCode?: string;
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
  colorFamily?: string; // e.g., "Đỏ", "Xanh dương", "Xám", etc.
  hexSearchColor?: string; // e.g., "#3b82f6" - base color for similarity search
  hexSearchRange?: number; // 0-100, where 100 = exact match only
  sortBy?: string; // e.g., "name"
  order?: string; // e.g., "asc,desc"
  createdFrom?: string; // ISO date string
  createdTo?: string; // ISO date string
};

export type CreateFabricColorPayload = {
  id: string;
  name: string;
  hexCode?: string;
};

export type UpdateFabricColorPayload = {
  name?: string;
  hexCode?: string;
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
