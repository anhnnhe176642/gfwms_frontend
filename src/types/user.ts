import type { PaginationState } from './common';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export type UserGender = 'MALE' | 'FEMALE';

export type UserListItem = {
  id: string;
  username: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  gender?: UserGender | null;
  address?: string | null;
  dob?: string | null; // Date of birth
  fullname?: string | null;
  status: UserStatus;
  emailVerified: boolean;
  emailVerifiedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  role: {
    id: string;
    name: string;
    description?: string | null;
  };
  creditRegistration?: any | null;
  permissionKeys?: string[];
  lastLogin?: string;
};

export type UserListResponse = {
  message: string;
  data: UserListItem[];
  pagination: PaginationState;
};

export type UserListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string; // e.g., "ACTIVE,INACTIVE"
  role?: string; // e.g., "ADMIN,USER"
  gender?: string; // e.g., "MALE,FEMALE"
  createdFrom?: string; // ISO date string
  createdTo?: string; // ISO date string
  sortBy?: string; // e.g., "createdAt,username"
  order?: string; // e.g., "desc,asc"
};

export type UpdateUserStatusPayload = {
  userId: string | number;
  status: UserStatus;
};

export type UpdateUserRolePayload = {
  userId: string | number;
  roleId: string; // ID của role từ database
};

// Profile Management Types
export type UpdateProfileDTO = {
  fullname?: string;
  phone?: string;
  gender?: UserGender;
  address?: string;
  dob?: string; // ISO date string (YYYY-MM-DD)
};

export type ChangePasswordDTO = {
  currentPassword: string;
  newPassword: string;
};

export type ProfileUser = {
  id: string;
  username: string;
  email: string;
  fullname: string | null;
  phone: string | null;
  gender: UserGender | null;
  address: string | null;
  dob: string | null; // ISO date
  avatar: string | null;
  avatarPublicId?: string | null;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  role: {
    id: string;
    name: string;
    description?: string | null;
  };
  permissionKeys?: string[];
};

export type ProfileResponse = {
  message: string;
  user: ProfileUser;
};

export type UpdateAvatarResponse = {
  message: string;
  user: {
    avatar: string;
    avatarPublicId: string;
  };
};

export type ChangePasswordResponse = {
  message: string;
};
