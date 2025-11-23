/**
 * YOLO Model types
 */

export type YoloModelStatus = 'ACTIVE' | 'DEPRECATED' | 'TESTING';

export interface YoloModelMetadata {
  mimetype: string;
  uploadedAt: string;
  originalName: string;
}

export interface YoloModel {
  id: number;
  name: string;
  fileName: string;
  filePath: string;
  description?: string;
  isActive: boolean;
  version: string;
  status: YoloModelStatus;
  metadata: YoloModelMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface YoloModelListItem {
  id: number;
  name: string;
  fileName: string;
  filePath: string;
  description?: string;
  isActive: boolean;
  version: string;
  status: YoloModelStatus;
  metadata: YoloModelMetadata;
  createdAt: string;
  updatedAt: string;
  isDefault?: boolean;
}

export interface YoloModelListResponse {
  success: boolean;
  message: string;
  data: YoloModelListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface YoloModelListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: YoloModelStatus;
  sortBy?: 'name' | 'createdAt' | 'version' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface YoloActiveModel {
  id: number;
  name: string;
  version: string;
  filePath: string;
}

export interface YoloActiveModelResponse {
  success: boolean;
  message: string;
  data: YoloActiveModel | null;
}

export interface YoloModelDetailResponse {
  success: boolean;
  message: string;
  data: YoloModel;
}

export interface UpdateYoloModelPayload {
  description?: string;
  version?: string;
  status?: YoloModelStatus;
}

export interface UpdateYoloModelResponse {
  success: boolean;
  message: string;
  data: YoloModel;
}

export interface ActivateYoloModelResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    name: string;
    isActive: boolean;
    version: string;
  };
}

/**
 * Detection Log types
 */
export interface YoloDetectionLog {
  id: string;
  modelId: number;
  imagePath: string;
  totalObjects: number;
  confidence: number;
  detectionTime: number;
  detectedAt: string;
}

export interface YoloDetectionLogsResponse {
  success: boolean;
  message: string;
  data: YoloDetectionLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface YoloDetectionLogsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'confidence' | 'detectedAt' | 'detectionTime' | 'totalObjects';
  order?: 'asc' | 'desc';
}

/**
 * Model Statistics types
 */
export interface YoloModelStatistics {
  totalDetections: number;
  averageConfidence: string;
  totalObjectsDetected: number;
}

export interface YoloModelStatsResponse {
  success: boolean;
  message: string;
  data: {
    model: {
      id: number;
      name: string;
      version: string;
      isActive: boolean;
    };
    statistics: YoloModelStatistics;
    recentLogs: YoloDetectionLog[];
  };
}
