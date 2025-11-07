import api from '@/lib/api';
import type {
  FabricColorListResponse,
  FabricColorListParams,
  FabricColorListItem,
  CreateFabricColorPayload,
  UpdateFabricColorPayload,
  CreateFabricColorResponse,
  UpdateFabricColorResponse,
  GetFabricColorResponse,
} from '@/types/fabricColor';

const BASE_PATH = '/v1/fabric-color';

export const fabricColorService = {
  /**
   * Lấy danh sách fabric color với phân trang và filter
   */
  getFabricColors: async (params?: FabricColorListParams): Promise<FabricColorListResponse> => {
    const response = await api.get<FabricColorListResponse>(BASE_PATH, { params });
    return response.data;
  },

  /**
   * Lấy thông tin chi tiết một fabric color
   */
  getFabricColorById: async (id: string): Promise<FabricColorListItem> => {
    const response = await api.get<GetFabricColorResponse>(`${BASE_PATH}/${id}`);
    return response.data.fabricColor;
  },

  /**
   * Tạo fabric color mới
   */
  createFabricColor: async (data: CreateFabricColorPayload): Promise<FabricColorListItem> => {
    const response = await api.post<CreateFabricColorResponse>(BASE_PATH, data);
    return response.data.fabricColor;
  },

  /**
   * Cập nhật fabric color
   */
  updateFabricColor: async (
    id: string,
    data: UpdateFabricColorPayload
  ): Promise<FabricColorListItem> => {
    const response = await api.put<UpdateFabricColorResponse>(`${BASE_PATH}/${id}`, data);
    return response.data.fabricColor;
  },

  /**
   * Xóa fabric color
   */
  deleteFabricColor: async (id: string): Promise<void> => {
    await api.delete(`${BASE_PATH}/${id}`);
  },
};

export default fabricColorService;
