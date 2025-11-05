import api from '@/lib/api';
import type {
  WarehouseListResponse,
  WarehouseListParams,
  WarehouseListItem,
  WarehouseStatus,
  ShelfListResponse,
  ShelfListParams,
  CreateShelfPayload,
  UpdateShelfPayload,
  CreateShelfResponse,
  UpdateShelfResponse,
  GetShelfResponse,
  ShelfListItem,
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

  /**
   * Lấy danh sách kệ của một kho
   */
  getShelves: async (params?: ShelfListParams): Promise<ShelfListResponse> => {
    const response = await api.get<ShelfListResponse>('/v1/shelves', { params });
    return response.data;
  },

  /**
   * Lấy thông tin chi tiết một kệ
   */
  getShelfById: async (id: string | number): Promise<ShelfListItem> => {
    const response = await api.get<GetShelfResponse>(`/v1/shelves/${id}`);
    return response.data.shelf;
  },

  /**
   * Tạo kệ mới
   */
  createShelf: async (data: CreateShelfPayload): Promise<ShelfListItem> => {
    const response = await api.post<CreateShelfResponse>('/v1/shelves', data);
    return response.data.shelf;
  },

  /**
   * Cập nhật thông tin kệ
   */
  updateShelf: async (id: string | number, data: UpdateShelfPayload): Promise<ShelfListItem> => {
    const response = await api.put<UpdateShelfResponse>(`/v1/shelves/${id}`, data);
    return response.data.shelf;
  },

  /**
   * Xóa kệ
   */
  deleteShelf: async (id: string | number): Promise<void> => {
    await api.delete(`/v1/shelves/${id}`);
  },
};

export default warehouseService;
