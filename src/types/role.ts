import type { PaginationState } from './common';

export type Role = {
  name: string;
  description: string | null;
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
