import api from '@/lib/api';
import type {
  WarehouseListResponse,
  WarehouseListParams,
  WarehouseListItem,
  WarehouseStatus,
} from '@/types/warehouse';
import type { CreateWarehouseFormData, UpdateWarehouseFormData } from '@/schemas/warehouse.schema';

const BASE_PATH = '/v1/warehouses';

export type UpdateWarehouseStatusPayload = {
  warehouseId: number;
  status: WarehouseStatus;
};

export type CreateWarehouseResponse = {
  message: string;
  warehouse: WarehouseListItem;
};

export type UpdateWarehouseResponse = {
  message: string;
  warehouse: WarehouseListItem;
};

export type GetWarehouseResponse = {
  message: string;
  warehouse: WarehouseListItem;
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
    const response = await api.get<GetWarehouseResponse>(`${BASE_PATH}/${id}`);
    return response.data.warehouse;
  },

  /**
   * Tạo warehouse mới
   */
  createWarehouse: async (data: CreateWarehouseFormData): Promise<WarehouseListItem> => {
    const response = await api.post<CreateWarehouseResponse>(BASE_PATH, data);
    return response.data.warehouse;
  },

  /**
   * Cập nhật warehouse
   */
  updateWarehouse: async (id: string | number, data: UpdateWarehouseFormData): Promise<WarehouseListItem> => {
    const response = await api.patch<UpdateWarehouseResponse>(`${BASE_PATH}/${id}`, data);
    return response.data.warehouse;
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
