import api from '@/lib/api';
import type {
  FabricListResponse,
  FabricListParams,
  FabricListItem,
} from '@/types/fabric';

const BASE_PATH = '/v1/fabrics';

export const fabricService = {
  /**
   * Lấy danh sách fabric với phân trang và filter
   */
  getFabrics: async (params?: FabricListParams): Promise<FabricListResponse> => {
    const response = await api.get<FabricListResponse>(BASE_PATH, { params });
    return response.data;
  },

  /**
   * Lấy thông tin chi tiết một fabric
   */
  getFabricById: async (id: number | string): Promise<FabricListItem> => {
    const response = await api.get<FabricListItem>(`${BASE_PATH}/${id}`);
    return response.data;
  },
};

export default fabricService;
