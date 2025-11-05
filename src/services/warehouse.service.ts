import api from '@/lib/api';
import type {
  WarehouseListResponse,
  WarehouseListParams,
  WarehouseListItem,
  WarehouseStatus,
} from '@/types/warehouse';

const BASE_PATH = '/v1/warehouses';

export type UpdateWarehouseStatusPayload = {
  warehouseId: number;
  status: WarehouseStatus;
};

export const warehouseService = {
  /**
   * Lấy danh sách warehouse với phân trang và filter
   */
  getWarehouses: async (params?: WarehouseListParams): Promise<WarehouseListResponse> => {
    const response = await api.get<WarehouseListResponse>(BASE_PATH, { params });
    return response.data;
  },

  /**
   * Lấy thông tin chi tiết một warehouse
   */
  getWarehouseById: async (id: string | number): Promise<WarehouseListItem> => {
    const response = await api.get<WarehouseListItem>(`${BASE_PATH}/${id}`);
    return response.data;
  },

  /**
   * Cập nhật trạng thái warehouse
   */
  updateWarehouseStatus: async (payload: UpdateWarehouseStatusPayload): Promise<WarehouseListItem> => {
    const response = await api.patch<WarehouseListItem>(
      `${BASE_PATH}/${payload.warehouseId}/status`,
      { status: payload.status }
    );
    return response.data;
  },

  /**
   * Xóa warehouse
   */
  deleteWarehouse: async (id: string | number): Promise<void> => {
    await api.delete(`${BASE_PATH}/${id}`);
  },
};

export default warehouseService;
