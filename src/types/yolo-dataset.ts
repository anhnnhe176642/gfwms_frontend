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
  datasetId?: string;
  filename: string;
  imagePath?: string;
  imageUrl?: string;
  width?: number;
  height?: number;
  format?: string;
  classes?: string[];
  objectCount: number;
  status: DatasetImageStatus;
  notes?: string;
  /** user id of uploader */
  uploadedBy?: string;
  uploadedByUser: {
    id: string;
    fullname?: string | null;
    username?: string;
  };
  createdAt: string;
  updatedAt?: string;
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

export type DatasetImageAnnotation = {
  /** Class ID index */
  class_id: number;
  /** Class name */
  class_name: string;
  /** Confidence score (0-1) */
  confidence: number;
  /** x1 - top-left corner x coordinate (pixel format) */
  x1: number;
  /** y1 - top-left corner y coordinate (pixel format) */
  y1: number;
  /** x2 - bottom-right corner x coordinate (pixel format) */
  x2: number;
  /** y2 - bottom-right corner y coordinate (pixel format) */
  y2: number;
};

export type UpdateDatasetImagePayload = {
  notes?: string;
  status?: DatasetImageStatus;
  annotations?: DatasetImageAnnotation[];
};

export type UpdateDatasetImageResponse = {
  message: string;
  data: DatasetImageDetail;
};

export type DatasetImageDetail = DatasetImage & {
  annotations?: DatasetImageAnnotation[];
};

export type GetImageDetailResponse = {
  message: string;
  data: DatasetImageDetail;
};

export type DatasetWithImages = {
  id: string;
  name: string;
  description?: string;
  classes: string[];
  status: DatasetStatus;
  imageCount?: number;
  totalImages?: number;
  labeledCount?: number;
  totalLabels?: number;
};

export type GetDatasetWithImageResponse = {
  message: string;
  data: DatasetWithImages;
};

export type DatasetImportStatistics = {
  importedCount: number;
  failedCount: number;
  errors: Array<{
    filename: string;
    error: string;
  }>;
};

export type ImportDatasetFromZipResponse = {
  success: boolean;
  message: string;
  data: {
    dataset: DatasetDetail;
    importedCount: number;
    failedCount: number;
    errors: Array<{
      filename?: string;
      error: string;
    }>;
  };
};

export type ImportZipDatasetPayload = {
  zipFile: File;
  name: string;
  description?: string;
};

export type ImportDatasetToExistingResponse = {
  success: boolean;
  message: string;
  data: {
    importedCount: number;
    failedCount: number;
    errors: Array<{
      filename?: string;
      error: string;
    }>;
  };
};

export type ExportDatasetResponse = Blob;
