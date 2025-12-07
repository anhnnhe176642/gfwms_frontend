import api from '@/lib/api';
import type {
  StoreFabricListParams,
  StoreFabricListResponse,
  StoreFabricListItem,
  StoreFabricDetailResponse,
} from '@/types/storeFabric';

export const createStoreFabricService = (storeId: number | string) => {
  const BASE_PATH = `/v1/fabric-store/${storeId}/fabrics`;

  return {
    /**
     * Lấy danh sách vải trong cửa hàng với phân trang và filter
     */
    list: async (params?: StoreFabricListParams): Promise<StoreFabricListResponse> => {
      const response = await api.get<StoreFabricListResponse>(BASE_PATH, { params });
      return response.data;
    },

    /**
     * Lấy thông tin chi tiết một loại vải trong cửa hàng
     */
    getById: async (fabricId: number | string): Promise<StoreFabricListItem> => {
      const response = await api.get<StoreFabricDetailResponse>(`${BASE_PATH}/${fabricId}`);
      return response.data.data;
    },
  };
};

export default createStoreFabricService;
