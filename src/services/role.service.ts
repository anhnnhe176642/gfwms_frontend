import api from '@/lib/api';
import type { 
  RoleListResponse, 
  RoleListParams, 
  PermissionsResponse,
  Permission,
  CreateRoleRequest,
  CreateRoleResponse
} from '@/types/role';

const BASE_PATH = '/v1/roles';
const PERMISSIONS_PATH = '/v1/permissions';

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

  /**
   * Lấy danh sách tất cả permissions
   */
  getPermissions: async (): Promise<PermissionsResponse> => {
    const response = await api.get<PermissionsResponse>(PERMISSIONS_PATH);
    return response.data;
  },

  /**
   * Tạo role mới
   */
  createRole: async (data: CreateRoleRequest): Promise<CreateRoleResponse> => {
    const response = await api.post<CreateRoleResponse>(BASE_PATH, data);
    return response.data;
  },
};

export default roleService;
