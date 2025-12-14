import type { PaginationState } from './common';
import type { InvoiceStatus } from './invoice';

export type CreditInvoiceStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'PARTIALLY_PAID' | 'CANCELED';

export interface CreditUser {
  id: string;
  fullname: string;
  email: string;
  phone: string;
}

export interface Credit {
  id: number;
  userId: string;
  creditLimit: number;
  status: string;
  user: CreditUser;
}

export interface Order {
  id: number;
  orderDate: string;
  status: string;
  totalAmount: number;
  notes?: string | null;
}

export interface Invoice {
  id: number;
  invoiceDate: string;
  invoiceStatus: InvoiceStatus;
  totalAmount: number;
  creditAmount: number;
  paidAmount: number;
  orderId: number;
  order: Order;
}

export interface Payment {
  id: number;
  paymentDate: string;
  amount: number;
  method: string;
  status: string;
}

export interface CreditInvoiceListItem {
  id: number;
  creditId: number;
  dueDate: string;
  totalCreditAmount: number;
  creditPaidAmount: number;
  status: CreditInvoiceStatus;
  createdAt: string;
  updatedAt: string;
  credit: Credit;
  invoice: Invoice[];
  payment: Payment[];
}

export interface CreditInvoiceListParams {
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: string;
  order?: string;
}

export interface CreditInvoiceListResponse {
  message: string;
  data: CreditInvoiceListItem[];
  pagination: PaginationState;
}
