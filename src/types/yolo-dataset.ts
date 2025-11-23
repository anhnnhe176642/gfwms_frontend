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

export type DatasetImageStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export type DatasetImage = {
  id: string;
  filename: string;
  imagePath?: string;
  imageUrl?: string;
  objectCount: number;
  status: DatasetImageStatus;
  uploadedByUser: {
    id: string;
    fullname: string;
  };
  createdAt: string;
};

export type DatasetImageListResponse = {
  success: boolean;
  message: string;
  data: DatasetImage[];
  pagination: PaginationState;
};

export type DatasetImageListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  order?: string;
  createdFrom?: string;
  createdTo?: string;
};
