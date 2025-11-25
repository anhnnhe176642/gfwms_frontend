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
  fullName: string;
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
  fullName?: string | null;
  description?: string | null;
};

export type CreateRoleRequest = {
  name: string;
  fullName: string;
  description: string;
  permissions: string[]; // Mảng các permission keys
};

export type CreateRoleResponse = {
  message: string;
  data: Role;
};

export type RolePermission = {
  permission: Permission;
};

export type RoleDetail = {
  name: string;
  fullName: string;
  description: string | null;
  rolePermissions?: RolePermission[];
};

export type RoleDetailResponse = {
  message: string;
  data: RoleDetail;
};

export type UpdateRoleRequest = {
  fullName?: string;
  description?: string;
  permissions: string[]; // Mảng các permission keys
};

export type UpdateRoleResponse = {
  message: string;
  data: RoleDetail;
};
