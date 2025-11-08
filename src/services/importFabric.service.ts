import api from '@/lib/api';
import type {
  ImportFabricListResponse,
  ImportFabricListParams,
  ImportFabricDetailResponse,
} from '@/types/importFabric';

const BASE_PATH = '/v1/import-fabrics';

export type CreateImportFabricRequest = {
  warehouseId: number;
  items: Array<{
    thickness: number;
    glossId: number;
    length: number;
    width: number;
    weight: number;
    categoryId: number;
    colorId: string;
    supplierId: number;
    quantity: number;
    price: number;
  }>;
};

export type CreateImportFabricResponse = {
  message: string;
  data: {
    id: number;
  };
};

export const importFabricService = {
  /**
   * Lấy danh sách phiếu nhập kho với phân trang và filter
   */
  getImportFabrics: async (params?: ImportFabricListParams): Promise<ImportFabricListResponse> => {
    const response = await api.get<ImportFabricListResponse>(BASE_PATH, { params });
    return response.data;
  },

  /**
   * Lấy chi tiết phiếu nhập kho
   */
  getImportFabricDetail: async (id: number): Promise<ImportFabricDetailResponse> => {
    const response = await api.get<ImportFabricDetailResponse>(`${BASE_PATH}/${id}`);
    return response.data;
  },

  /**
   * Tạo phiếu nhập kho mới
   */
  createImportFabric: async (data: CreateImportFabricRequest): Promise<CreateImportFabricResponse> => {
    const response = await api.post<CreateImportFabricResponse>(BASE_PATH, data);
    return response.data;
  },
};

export default importFabricService;
