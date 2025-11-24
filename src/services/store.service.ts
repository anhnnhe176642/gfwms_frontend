import api from '@/lib/api';
import type {
  StoreListResponse,
  StoreListParams,
  StoreListItem,
  CreateStoreResponse,
  UpdateStoreResponse,
  GetStoreResponse,
} from '@/types/store';
import type { CreateStoreFormData, UpdateStoreFormData } from '@/schemas/store.schema';

const BASE_PATH = '/v1/stores';

export const storeService = {
  /**
   * Lấy danh sách store với phân trang và filter
   */
  getStores: async (params?: StoreListParams): Promise<StoreListResponse> => {
    const response = await api.get<StoreListResponse>(BASE_PATH, { params });
    return response.data;
  },

  /**
   * Lấy thông tin chi tiết một store
   */
  getStoreById: async (id: string | number): Promise<StoreListItem> => {
    const response = await api.get<GetStoreResponse>(`${BASE_PATH}/${id}`);
    return response.data.store;
  },

  /**
   * Tạo store mới
   */
  createStore: async (data: CreateStoreFormData): Promise<StoreListItem> => {
    const response = await api.post<CreateStoreResponse>(BASE_PATH, data);
    return response.data.store;
  },

  /**
   * Cập nhật store
   */
  updateStore: async (id: string | number, data: UpdateStoreFormData): Promise<StoreListItem> => {
    const response = await api.put<UpdateStoreResponse>(`${BASE_PATH}/${id}`, data);
    return response.data.store;
  },

  /**
   * Xóa store
   */
  deleteStore: async (id: string | number): Promise<void> => {
    await api.delete(`${BASE_PATH}/${id}`);
  },
};

export default storeService;
