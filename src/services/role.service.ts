import api from '@/lib/api';
import type { RoleListResponse, RoleListParams } from '@/types/role';

const BASE_PATH = '/v1/roles';

export const roleService = {
  /**
   * Lấy danh sách roles với phân trang
   */
  getRoles: async (params?: RoleListParams): Promise<RoleListResponse> => {
    const response = await api.get<RoleListResponse>(BASE_PATH, { params });
    return response.data;
  },

  /**
   * Lấy tất cả roles (không phân trang) để sử dụng cho filter/select
   */
  getAllRoles: async (): Promise<RoleListResponse> => {
    const response = await api.get<RoleListResponse>(BASE_PATH, {
      params: { page: 1, limit: 100 }, // Lấy nhiều để đảm bảo có đủ
    });
    return response.data;
  },
};

export default roleService;
