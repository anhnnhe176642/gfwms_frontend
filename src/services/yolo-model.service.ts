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

export const yoloModelService = {
  /**
   * Lấy danh sách models với phân trang và filter
   */
  getModels: async (params?: YoloModelListParams): Promise<YoloModelListResponse> => {
    const response = await api.get<YoloModelListResponse>(BASE_PATH, { params });
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
