import api from '@/lib/api';
import type {
  SupplierListResponse,
  SupplierListParams,
  SupplierListItem,
  CreateSupplierPayload,
  UpdateSupplierPayload,
  CreateSupplierResponse,
  UpdateSupplierResponse,
  GetSupplierResponse,
} from '@/types/supplier';

const BASE_PATH = '/v1/supplier';

export const supplierService = {
  /**
   * Lấy danh sách nhà cung cấp với phân trang và filter
   */
  getSuppliers: async (params?: SupplierListParams): Promise<SupplierListResponse> => {
    const response = await api.get<SupplierListResponse>(BASE_PATH, { params });
    return response.data;
  },

  /**
   * Lấy thông tin chi tiết một nhà cung cấp
   */
  getSupplierById: async (id: string | number): Promise<SupplierListItem> => {
    const response = await api.get<GetSupplierResponse>(`${BASE_PATH}/${id}`);
    return response.data.supplier;
  },

  /**
   * Tạo nhà cung cấp mới
   */
  createSupplier: async (data: CreateSupplierPayload): Promise<SupplierListItem> => {
    const response = await api.post<CreateSupplierResponse>(BASE_PATH, data);
    return response.data.supplier;
  },

  /**
   * Cập nhật nhà cung cấp
   */
  updateSupplier: async (
    id: string | number,
    data: UpdateSupplierPayload
  ): Promise<SupplierListItem> => {
    const response = await api.put<UpdateSupplierResponse>(`${BASE_PATH}/${id}`, data);
    return response.data.supplier;
  },

  /**
   * Xóa nhà cung cấp
   */
  deleteSupplier: async (id: string | number): Promise<void> => {
    await api.delete(`${BASE_PATH}/${id}`);
  },
};

export default supplierService;
