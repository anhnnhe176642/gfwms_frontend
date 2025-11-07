import api from '@/lib/api';
import type {
  FabricGlossListResponse,
  FabricGlossListParams,
  FabricGlossListItem,
  CreateFabricGlossPayload,
  UpdateFabricGlossPayload,
  CreateFabricGlossResponse,
  UpdateFabricGlossResponse,
  GetFabricGlossResponse,
} from '@/types/fabricGloss';

const BASE_PATH = '/v1/fabric-gloss';

export const fabricGlossService = {
  /**
   * Lấy danh sách fabric gloss với phân trang và filter
   */
  getFabricGlosses: async (params?: FabricGlossListParams): Promise<FabricGlossListResponse> => {
    const response = await api.get<FabricGlossListResponse>(BASE_PATH, { params });
    return response.data;
  },

  /**
   * Lấy thông tin chi tiết một fabric gloss
   */
  getFabricGlossById: async (id: string | number): Promise<FabricGlossListItem> => {
    const response = await api.get<GetFabricGlossResponse>(`${BASE_PATH}/${id}`);
    return response.data.fabricGloss;
  },

  /**
   * Tạo fabric gloss mới
   */
  createFabricGloss: async (data: CreateFabricGlossPayload): Promise<FabricGlossListItem> => {
    const response = await api.post<CreateFabricGlossResponse>(BASE_PATH, data);
    return response.data.data;
  },

  /**
   * Cập nhật fabric gloss
   */
  updateFabricGloss: async (
    id: string | number,
    data: UpdateFabricGlossPayload
  ): Promise<FabricGlossListItem> => {
    const response = await api.put<UpdateFabricGlossResponse>(`${BASE_PATH}/${id}`, data);
    return response.data.data;
  },

  /**
   * Xóa fabric gloss
   */
  deleteFabricGloss: async (id: string | number): Promise<void> => {
    await api.delete(`${BASE_PATH}/${id}`);
  },
};

export default fabricGlossService;
