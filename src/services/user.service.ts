import api from '@/lib/api';
import type {
  UserListResponse,
  UserListParams,
  UserListItem,
  UpdateUserStatusPayload,
  UpdateUserRolePayload,
  UserStatsResponse,
  UserActivityDashboardResponse,
  UserPermissionsResponse,
  UserDetailResponse,
} from '@/types/user';
import type {
  UserStoresResponse,
  AssignUserStoragesPayload,
  AssignUserStoragesResponse,
} from '@/types/store';
import type {
  UserWarehousesResponse,
  AssignUserWarehousesPayload,
  AssignUserWarehousesResponse,
} from '@/types/warehouse';
import type { CreateUserFormData } from '@/schemas/user.schema';

const BASE_PATH = '/v1/users';

export const userService = {
  /**
   * Lấy danh sách user với phân trang và filter
   */
  getUsers: async (params?: UserListParams): Promise<UserListResponse> => {
    const response = await api.get<UserListResponse>(BASE_PATH, { params });
    return response.data;
  },

  /**
   * Lấy thông tin chi tiết một user
   */
  getUserById: async (id: string | number): Promise<UserDetailResponse> => {
    const response = await api.get<UserDetailResponse>(`${BASE_PATH}/${id}`);
    return response.data;
  },

  /**
   * Tạo user mới
   */
  createUser: async (data: CreateUserFormData): Promise<UserListItem> => {
    const response = await api.post<UserListItem>(BASE_PATH, data);
    return response.data;
  },

  /**
   * Cập nhật trạng thái user
   */
  updateUserStatus: async (payload: UpdateUserStatusPayload): Promise<UserListItem> => {
    const response = await api.patch<UserListItem>(
      `${BASE_PATH}/${payload.userId}/status`,
      { status: payload.status }
    );
    return response.data;
  },

  /**
   * Cập nhật role của user
   */
  updateUserRole: async (payload: UpdateUserRolePayload): Promise<UserListItem> => {
    const response = await api.patch<UserListItem>(
      `${BASE_PATH}/${payload.userId}/role`,
      { role: payload.roleName }
    );
    return response.data;
  },

  /**
   * Xóa user
   */
  deleteUser: async (id: string | number): Promise<void> => {
    await api.delete(`${BASE_PATH}/${id}`);
  },

  /**
   * Lấy thống kê toàn diện của user (orders, exports, imports, payments, credit, stores, warehouses)
   */
  getUserStats: async (userId: string | number): Promise<UserStatsResponse> => {
    const response = await api.get<UserStatsResponse>(`${BASE_PATH}/${userId}/stats`);
    return response.data;
  },

  /**
   * Lấy dashboard hoạt động gần đây của user
   */
  getUserActivityDashboard: async (userId: string | number): Promise<UserActivityDashboardResponse> => {
    const response = await api.get<UserActivityDashboardResponse>(`${BASE_PATH}/${userId}/activity/dashboard`);
    return response.data;
  },

  /**
   * Lấy danh sách cửa hàng được phân công cho user
   */
  getUserStores: async (userId: string | number): Promise<UserStoresResponse> => {
    const response = await api.get<UserStoresResponse>(`/v1/roles/user-stores/${userId}`);
    return response.data;
  },

  /**
   * Phân công nhiều cửa hàng cho user
   */
  assignUserStores: async (payload: AssignUserStoragesPayload): Promise<AssignUserStoragesResponse> => {
    const response = await api.post<AssignUserStoragesResponse>(
      '/v1/roles/user-stores/assign-multiple',
      payload
    );
    return response.data;
  },

  /**
   * Xóa tất cả cửa hàng được phân công cho user
   */
  removeAllUserStores: async (userId: string | number): Promise<void> => {
    await api.delete(`/v1/roles/user-stores/${userId}/remove-all`);
  },

  /**
   * Lấy danh sách quyền của user theo userId
   */
  getUserPermissions: async (userId: string | number): Promise<UserPermissionsResponse> => {
    const response = await api.get<UserPermissionsResponse>(`/v1/permissions/user/${userId}`);
    return response.data;
  },

  /**
   * Lấy danh sách kho được phân công cho user
   */
  getUserWarehouses: async (userId: string | number): Promise<UserWarehousesResponse> => {
    const response = await api.get<UserWarehousesResponse>(`/v1/warehouse-managers/user/${userId}`);
    return response.data;
  },

  /**
   * Phân công nhiều kho cho user
   */
  assignUserWarehouses: async (payload: AssignUserWarehousesPayload): Promise<AssignUserWarehousesResponse> => {
    const response = await api.post<AssignUserWarehousesResponse>(
      '/v1/warehouse-managers/assign-multiple',
      payload
    );
    return response.data;
  },

  /**
   * Xóa tất cả kho được phân công cho user
   */
  removeAllUserWarehouses: async (userId: string | number): Promise<void> => {
    await api.delete(`/v1/warehouse-managers/remove-all/${userId}`);
  },
};

export default userService;

