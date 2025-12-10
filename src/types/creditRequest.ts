/**
 * Credit Request types
 * Represents credit limit request history (INITIAL and INCREASE types)
 */

export type CreditRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type CreditRequestType = 'INITIAL' | 'INCREASE';

export interface CreditRequestUser {
  id: string;
  username: string;
  fullname: string;
  email: string;
}

export interface CreditRequest {
  id: number;
  userId: string;
  requestLimit: number;
  status: CreditRequestStatus;
  type: CreditRequestType;
  note: string;
  createdAt: string;
  updatedAt: string;
  user: CreditRequestUser;
}

export interface CreditRequestListItem extends CreditRequest {}

export interface CreditRequestListResponse {
  message: string;
  data: CreditRequestListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CreditRequestListParams {
  search?: string;
  status?: CreditRequestStatus;
  uuid?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'requestLimit' | 'status';
  order?: 'asc' | 'desc';
}

export type UpdateCreditRequestStatusPayload = {
  requestId: number;
  status: CreditRequestStatus;
  note?: string;
  requestLimit?: number;
};
