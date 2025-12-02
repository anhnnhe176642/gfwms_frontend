import type { PaginationState } from './common';

export type FabricListItem = {
  id: number;
  thickness: number;
  gloss: {
    id: number;
    description: string;
  };
  length: number;
  width: number;
  weight: number;
  sellingPrice: number;
  quantityInStock: number;
  category: {
    id: number;
    name: string;
  };
  color: {
    id: string;
    name: string;
  };
  supplier: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type FabricListResponse = {
  message: string;
  data: FabricListItem[];
  pagination: PaginationState;
};

export type FabricListParams = {
  page?: number;
  limit?: number;
  search?: string;
  glossId?: string; // e.g., "1,2,3"
  categoryId?: string; // e.g., "1,2,3"
  colorId?: string; // e.g., "CLR1,CLR2,CLR3"
  supplierId?: string; // e.g., "1,2,3"
  createdFrom?: string; // ISO date string (YYYY-MM-DD)
  createdTo?: string; // ISO date string (YYYY-MM-DD)
  sortBy?: string; // e.g., "gloss.description"
  order?: string; // e.g., "asc" or "desc"
};

export type GetFabricByIdResponse = {
  message: string;
  fabric: FabricListItem;
};
