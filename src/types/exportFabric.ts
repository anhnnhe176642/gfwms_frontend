import type { PaginationState } from './common';

export type ExportFabricStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type ExportFabricListItem = {
  id: number;
  warehouse: {
    id: number;
    name: string;
  };
  store: {
    id: number;
    name: string;
  };
  status: ExportFabricStatus;
  note: string | null;
  createdAt: string;
  updatedAt?: string;
  createdBy: {
    username: string;
    email?: string;
  };
  receivedBy?: {
    username: string;
    email?: string;
  };
};

export type ExportFabricListResponse = {
  message: string;
  data: ExportFabricListItem[];
  pagination: PaginationState;
};

export type ExportFabricListParams = {
  page?: number;
  limit?: number;
  search?: string;
  warehouseId?: number | string;
  storeId?: number | string;
  status?: string; // e.g., "PENDING,COMPLETED"
  sortBy?: string; // e.g., "id,createdAt,updatedAt,status"
  order?: string; // e.g., "asc,desc"
};
