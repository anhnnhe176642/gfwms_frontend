import api from '@/lib/api';
import type {
  YoloModelListResponse,
  YoloModelListParams,
  YoloActiveModelResponse,
  YoloModelDetailResponse,
  UpdateYoloModelPayload,
  UpdateYoloModelResponse,
  ActivateYoloModelResponse,
  YoloDetectionLogsResponse,
  YoloDetectionLogsParams,
  YoloModelStatsResponse,
} from '@/types/yolo-model';

const BASE_PATH = '/v1/yolo/models';

// Default model that is shown when no model is active
const DEFAULT_MODEL = {
  id: 0,
  name: 'Model mặc định',
  fileName: 'default-model',
  filePath: '/default-model',
  description: 'Mô hình mặc định - Đếm vải cuộn',
  isActive: false,
  version: '1.0.0',
  status: 'ACTIVE' as const,
  metadata: {
    mimetype: 'application/octet-stream',
    uploadedAt: new Date().toISOString(),
    originalName: 'default-model',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isDefault: true,
};

export const yoloModelService = {
  /**
   * Lấy danh sách models với phân trang và filter
   */
  getModels: async (params?: YoloModelListParams): Promise<YoloModelListResponse> => {
    const response = await api.get<YoloModelListResponse>(BASE_PATH, { params });
    
    // Check if any model is active
    const hasActiveModel = response.data.data.some(model => model.isActive);
    
    // Check if default model should be active by calling the active endpoint
    let isDefaultModelActive = false;
    try {
      const activeResponse = await api.get(`${BASE_PATH}/active`);
      // If data is null or message indicates default model is being used, mark default as active
      isDefaultModelActive = activeResponse.data.data === null || 
                           activeResponse.data.message?.includes('default model');
    } catch (err) {
      // If error, assume default model is active
      isDefaultModelActive = true;
    }
    
    // If no model is active, use the result from active endpoint check
    const defaultModelWithStatus = { 
      ...DEFAULT_MODEL, 
      isActive: !hasActiveModel ? isDefaultModelActive : false 
    };
    
    // Always add the default model at the beginning
    response.data.data.unshift(defaultModelWithStatus as any);
    return response.data;
  },

  /**
   * Lấy model active hiện tại
   */
  getActiveModel: async (): Promise<YoloActiveModelResponse> => {
    const response = await api.get<YoloActiveModelResponse>(`${BASE_PATH}/active`);
    return response.data;
  },

  /**
   * Kích hoạt model (set làm active)
   */
  activateModel: async (modelId: number): Promise<ActivateYoloModelResponse> => {
    const response = await api.put<ActivateYoloModelResponse>(`${BASE_PATH}/${modelId}/activate`);
    return response.data;
  },

  /**
   * Sử dụng model mặc định
   */
  useDefaultModel: async (): Promise<ActivateYoloModelResponse> => {
    const response = await api.put<ActivateYoloModelResponse>(`${BASE_PATH}/use-default`);
    return response.data;
  },

  /**
   * Lấy thông tin chi tiết một model
   */
  getModelById: async (modelId: number): Promise<YoloModelDetailResponse> => {
    const response = await api.get<YoloModelDetailResponse>(`${BASE_PATH}/${modelId}`);
    return response.data;
  },

  /**
   * Cập nhật thông tin model
   */
  updateModel: async (modelId: number, payload: UpdateYoloModelPayload): Promise<UpdateYoloModelResponse> => {
    const response = await api.patch<UpdateYoloModelResponse>(`${BASE_PATH}/${modelId}`, payload);
    return response.data;
  },

  /**
   * Xóa model
   */
  deleteModel: async (modelId: number): Promise<void> => {
    await api.delete(`${BASE_PATH}/${modelId}`);
  },

  /**
   * Lấy statistics của model
   */
  getModelStats: async (modelId: number): Promise<YoloModelStatsResponse> => {
    const response = await api.get<YoloModelStatsResponse>(`${BASE_PATH}/${modelId}/stats`);
    return response.data;
  },

  /**
   * Lấy detection logs của model
   */
  getDetectionLogs: async (modelId: number, params?: YoloDetectionLogsParams): Promise<YoloDetectionLogsResponse> => {
    const response = await api.get<YoloDetectionLogsResponse>(`${BASE_PATH}/${modelId}/logs`, { params });
    return response.data;
  },
};
