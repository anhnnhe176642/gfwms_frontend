import type { PaginationState } from './common';
import type { InvoiceStatus } from './invoice';

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'DELIVERED' | 'CANCELED' | 'FAILED';

export type PaymentType = 'CASH' | 'CREDIT';

export type SaleUnit = 'METER' | 'ROLL';

// User in order
export interface OrderUser {
  id: string;
  username: string;
  fullname: string;
  phone: string;
  email: string;
}

// Fabric info in order item
export interface OrderItemFabricCategory {
  id: number;
  name: string;
}

export interface OrderItemFabricColor {
  id: string;
  name: string;
}

export interface OrderItemFabricGloss {
  id: number;
  description: string;
}

export interface OrderItemFabric {
  id: number;
  thickness: number;
  length: number;
  width: number;
  category: OrderItemFabricCategory;
  color: OrderItemFabricColor;
  gloss: OrderItemFabricGloss;
}

// Order item
export interface OrderItem {
  id: number;
  fabricId: number;
  quantity: number;
  saleUnit: SaleUnit;
  price: number;
  fabric: OrderItemFabric;
}

// Invoice in order
export interface OrderInvoice {
  id: number;
  invoiceStatus: InvoiceStatus;
  totalAmount: number;
  paidAmount: number;
  creditAmount: number;
  dueDate: string;
  notes: string | null;
}

// Staff who created the order (for offline orders)
export interface OrderStaff {
  id: string;
  username: string;
  fullname: string;
}

// Order list item
export interface OrderListItem {
  id: number;
  userId: string;
  user: OrderUser;
  orderDate: string;
  status: OrderStatus;
  paymentType: PaymentType;
  totalAmount: number;
  paidAmount: number;
  creditAmount: number;
  paymentDeadline: string | null;
  isOffline: boolean;
  customerPhone: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
  invoice: OrderInvoice | null;
  createdByStaff: OrderStaff | null;
}

// Order detail (same as list item but used for detail view)
export type OrderDetail = OrderListItem;

// List params
export interface OrderListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: string;
  status?: string;
  paymentType?: string;
  isOffline?: string;
  createdFrom?: string;
  createdTo?: string;
}

// API responses
export interface OrderListResponse {
  message: string;
  data: OrderListItem[];
  pagination: PaginationState;
}

export interface OrderDetailResponse {
  message: string;
  data: OrderDetail;
}
