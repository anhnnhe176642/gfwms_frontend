import type { PaginationState } from './common';

export type DatasetStatus = 'ACTIVE' | 'ARCHIVED';

export type DatasetListItem = {
  id: string;
  name: string;
  description?: string;
  imageCount?: number;
  totalImages?: number;
  labeledCount?: number;
  totalLabels?: number;
  classes?: string[];
  status: DatasetStatus;
  createdAt: string;
  updatedAt: string;
};

export type DatasetListResponse = {
  message: string;
  data: DatasetListItem[];
  pagination: PaginationState;
};

export type DatasetListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string; // e.g., "ACTIVE,ARCHIVED"
  sortBy?: string; // e.g., "name,createdAt,totalImages,totalLabels,status"
  order?: string; // e.g., "asc,desc"
};

export type DatasetDetail = DatasetListItem & {
  imageUrls?: string[];
  labelingProgress?: number;
  datasetPath?: string;
};

export type GetDatasetResponse = {
  message: string;
  data: DatasetDetail;
};

export type CreateDatasetPayload = {
  name: string;
  description?: string;
  classes: string[];
};

export type UpdateDatasetPayload = {
  name?: string;
  description?: string;
  status?: DatasetStatus;
  classes?: string[];
};

export type CreateDatasetResponse = {
  success: boolean;
  message: string;
  data: DatasetDetail;
};

export type UpdateDatasetResponse = {
  message: string;
  data: DatasetDetail;
};
