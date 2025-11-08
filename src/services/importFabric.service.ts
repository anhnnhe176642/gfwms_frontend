import api from '@/lib/api';
import type {
  ImportFabricListResponse,
  ImportFabricListParams,
} from '@/types/importFabric';

const BASE_PATH = '/v1/import-fabrics';

export const importFabricService = {
  /**
   * Lấy danh sách phiếu nhập kho với phân trang và filter
   */
  getImportFabrics: async (params?: ImportFabricListParams): Promise<ImportFabricListResponse> => {
    const response = await api.get<ImportFabricListResponse>(BASE_PATH, { params });
    return response.data;
  },
};

export default importFabricService;
