import type { PaginationState } from './common';

export type Permission = {
  id: number;
  key: string;
  description: string;
};

export type PermissionsResponse = {
  message: string;
  data: Permission[];
};

export type Role = {
  id?: number;
  name: string;
  description: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type RoleListResponse = {
  message: string;
  data: Role[];
  pagination: PaginationState;
};

export type RoleListParams = {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: string;
};

export type RoleOption = {
  value: string;
  label: string;
  description?: string | null;
};

export type CreateRoleRequest = {
  name: string;
  description: string;
  permissions: number[]; // Mảng các permission ID
};

export type CreateRoleResponse = {
  message: string;
  data: Role;
};
