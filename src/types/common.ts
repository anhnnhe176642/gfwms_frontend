/**
 * Common types used across the application
 */

/**
 * Standard pagination state for all API responses
 */
export type PaginationState = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};
