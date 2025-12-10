import type { PaginationState } from './common';

export type FabricCategoryListItem = {
  id: number;
  name: string;
  description?: string;
  sellingPricePerMeter?: number;
  sellingPricePerRoll?: number;
  image?: string;
  imagePublicId?: string;
  createdAt: string;
  updatedAt: string;
};

export type FabricCategoryListResponse = {
  message: string;
  data: FabricCategoryListItem[];
  pagination: PaginationState;
};

export type FabricCategoryListParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string; // e.g., "name,createdAt"
  order?: string; // e.g., "asc,desc"
  createdFrom?: string; // ISO date string
  createdTo?: string; // ISO date string
};

export type CreateFabricCategoryPayload = {
  name: string;
  description?: string;
  sellingPricePerMeter?: number;
  sellingPricePerRoll?: number;
};

export type UpdateFabricCategoryPayload = {
  name?: string;
  description?: string;
  sellingPricePerMeter?: number;
  sellingPricePerRoll?: number;
};

export type CreateFabricCategoryResponse = {
  message: string;
  data: FabricCategoryListItem;
};

export type UpdateFabricCategoryResponse = {
  message: string;
  data: FabricCategoryListItem;
};

export type GetFabricCategoryResponse = {
  message: string;
  data: FabricCategoryListItem;
};
