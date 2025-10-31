import type { PaginationState } from './common';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export type UserRole = 'ADMIN' | 'USER' | 'MANAGER';

export type UserGender = 'MALE' | 'FEMALE' | 'OTHER';

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
  role: UserRole;
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
  role: UserRole;
};
