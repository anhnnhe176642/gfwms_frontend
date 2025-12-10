/**
 * Credit Registration types
 * Represents registered credit limits for users
 */

export type CreditRegistrationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface CreditRegistrationUser {
  id: string;
  username: string;
  fullname: string;
  email: string;
}

export interface CreditRegistrationApprover {
  id: string;
  username: string;
  fullname: string;
}

export interface CreditRegistration {
  id: number;
  userId: string;
  creditLimit: number;
  creditUsed: number;
  approvedBy: string;
  approvalDate: string;
  status: CreditRegistrationStatus;
  note: string;
  createdAt: string;
  updatedAt: string;
  isLocked: boolean;
  user: CreditRegistrationUser;
  approver: CreditRegistrationApprover;
}

export interface CreditRegistrationListItem extends CreditRegistration {}

export interface CreditRegistrationListResponse {
  message: string;
  data: CreditRegistrationListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CreditRegistrationListParams {
  search?: string;
  status?: CreditRegistrationStatus;
  uuid?: string;
  page?: number;
  limit?: number;
  sortBy?:
    | 'user.username'
    | 'user.fullname'
    | 'user.email'
    | 'approver.username'
    | 'approver.fullname'
    | 'createdAt'
    | 'updatedAt'
    | 'creditLimit'
    | 'creditUsed'
    | 'approvalDate'
    | 'isLocked'
    | 'status';
  order?: 'asc' | 'desc';
}
