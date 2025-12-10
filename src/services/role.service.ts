import api from '@/lib/api';
import type { 
  RoleListResponse, 
  RoleListParams, 
  PermissionsResponse,
  Permission,
  CreateRoleRequest,
  CreateRoleResponse,
  UpdateRoleRequest,
  UpdateRoleResponse,
  RoleDetailResponse
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
   * Lấy chi tiết role theo ID
   */
  getRoleDetail: async (roleId: number | string): Promise<RoleDetailResponse> => {
    const response = await api.get<RoleDetailResponse>(`${BASE_PATH}/${roleId}`);
    const data = response.data;
    
    // Transform rolePermissions to permissions array for easier use
    return {
      ...data,
      data: {
        ...data.data,
        permissions: data.data.rolePermissions?.map(rp => rp.permission.key) || [],
      }
    };
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

  /**
   * Cập nhật role
   */
  updateRole: async (roleId: number | string, data: UpdateRoleRequest): Promise<UpdateRoleResponse> => {
    const response = await api.put<UpdateRoleResponse>(`${BASE_PATH}/${roleId}`, data);
    return response.data;
  },

  /**
   * Xóa role
   */
  deleteRole: async (roleId: number | string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`${BASE_PATH}/${roleId}`);
    return response.data;
  },

  /**
   * Generate role name từ fullName
   */
  generateRoleName: async (input: string): Promise<{ message: string; data: { suggestion: string; baseName: string } }> => {
    const response = await api.post<{ message: string; data: { suggestion: string; baseName: string } }>(`${BASE_PATH}/generate-name`, { input });
    return response.data;
  },
};

export default roleService;
