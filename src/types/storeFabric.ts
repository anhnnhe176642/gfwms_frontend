import type { PaginationState } from './common';

export type StoreFabricInfo = {
  id: number;
  category: string;
  categoryId: number;
  categoryDescription?: string;
  color: string;
  colorId: string;
  colorHexCode?: string;
  gloss: string;
  glossId: number;
  supplier: string;
  supplierId: number;
  supplierPhone?: string;
  supplierAddress?: string;
  length: number;
  width: number;
  weight: number;
  thickness: number;
  sellingPrice: number;
  sellingPricePerMeter: number;
  sellingPricePerRoll: number;
  quantityInStock?: number;
};

export type StoreInfo = {
  id: number;
  name: string;
  address: string;
};

export type StoreFabricInventory = {
  quantity: number;
  totalValue: number;
  totalMeters: number;
  uncutRolls: number;
  cuttingRollMeters: number;
  averagePricePerMeter: number;
};

export type StoreFabricListItem = {
  fabricId: number;
  storeId: number;
  fabricInfo: StoreFabricInfo;
  storeInfo: StoreInfo;
  inventory: StoreFabricInventory;
  updatedAt: string;
  createdAt: string;
};

export type StoreFabricListResponse = {
  message: string;
  data: StoreFabricListItem[];
  pagination: PaginationState;
};

export type StoreFabricListParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
};

export type StoreFabricDetailResponse = {
  message: string;
  data: StoreFabricListItem;
};
