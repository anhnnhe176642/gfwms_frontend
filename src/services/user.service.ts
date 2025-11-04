import api from '@/lib/api';
import type {
  UserListResponse,
  UserListParams,
  UserListItem,
  UpdateUserStatusPayload,
  UpdateUserRolePayload,
} from '@/types/user';

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
  getUserById: async (id: string | number): Promise<UserListItem> => {
    const response = await api.get<UserListItem>(`${BASE_PATH}/${id}`);
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
};

export default userService;
