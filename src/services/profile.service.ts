import { api } from '@/lib/api';
import type {
  ProfileResponse,
  UpdateProfileDTO,
  ChangePasswordDTO,
  ChangePasswordResponse,
  UpdateAvatarResponse,
} from '@/types/user';

const AUTH_PATH = process.env.NEXT_PUBLIC_AUTH_PATH || '/v1/auth';

/**
 * Profile Service
 * Quản lý các API liên quan đến profile của user đang đăng nhập
 */
export const profileService = {
  /**
   * Lấy thông tin profile của user hiện tại
   * GET /api/v1/auth/profile
   * Permission: users:view_own_profile
   */
  getProfile: async (): Promise<ProfileResponse> => {
    const response = await api.get<ProfileResponse>(`${AUTH_PATH}/profile`);
    return response.data;
  },

  /**
   * Cập nhật thông tin profile
   * PUT /api/v1/auth/profile
   * Permission: users:update_own_profile
   */
  updateProfile: async (data: UpdateProfileDTO): Promise<ProfileResponse> => {
    // Format date to YYYY-MM-DD if provided
    const payload = { ...data };
    if (payload.dob) {
      // Ensure dob is in YYYY-MM-DD format
      const dobDate = new Date(payload.dob);
      if (!isNaN(dobDate.getTime())) {
        payload.dob = dobDate.toISOString().split('T')[0];
      }
    }

    const response = await api.put<ProfileResponse>(`${AUTH_PATH}/profile`, payload);
    return response.data;
  },

  /**
   * Upload avatar
   * PUT /api/v1/auth/avatar
   * Permission: users:update_own_profile
   */
  updateAvatar: async (file: File): Promise<UpdateAvatarResponse> => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.put<UpdateAvatarResponse>(`${AUTH_PATH}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Đổi password
   * PUT /api/v1/auth/change-password
   * Permission: users:update_own_profile
   */
  changePassword: async (data: ChangePasswordDTO): Promise<ChangePasswordResponse> => {
    const response = await api.put<ChangePasswordResponse>(`${AUTH_PATH}/change-password`, data);
    return response.data;
  },
};
