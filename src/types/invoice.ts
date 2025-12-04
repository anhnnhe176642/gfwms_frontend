import type { PaginationState } from './common';

export type InvoiceStatus = 'PAID' | 'UNPAID' | 'OVERDUE' | 'CREDIT' | 'REFUNDED' | 'CANCELED';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELED';

export type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'MOMO' | 'VNPAY';

// List item types
export interface InvoiceOrderUser {
  id: string;
  username: string;
  email?: string;
}

export interface InvoiceOrder {
  id: number;
  orderDate: string;
  status: OrderStatus;
  totalAmount: number;
  notes?: string | null;
  user: InvoiceOrderUser;
}

export interface InvoiceListItem {
  id: number;
  orderId: number;
  order: InvoiceOrder;
  invoiceDate: string;
  dueDate: string;
  invoiceStatus: InvoiceStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceListParams {
  page?: number;
  limit?: number;
  search?: string;
  invoiceStatus?: string;
  sortBy?: string;
  order?: string;
}

export interface InvoiceListResponse {
  message: string;
  data: InvoiceListItem[];
  pagination: PaginationState;
}

// Detail types
export interface FabricGloss {
  id: number;
  description: string;
}

export interface FabricCategory {
  id: number;
  name: string;
}

export interface FabricColor {
  id: string;
  name: string;
}

export interface FabricSupplier {
  id: number;
  name: string;
  phone: string;
  address: string;
}

export interface OrderItemFabric {
  id: number;
  thickness: number;
  length: number;
  width: number;
  weight: number;
  sellingPrice: number;
  quantityInStock: number;
  createdAt: string;
  updatedAt: string;
  gloss: FabricGloss;
  category: FabricCategory;
  color: FabricColor;
  supplier: FabricSupplier;
}

export interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  createdAt: string;
  updatedAt: string;
  fabric: OrderItemFabric;
}

export interface InvoiceOrderDetail extends InvoiceOrder {
  orderItems: OrderItem[];
}

export interface InvoicePayment {
  id: number;
  paymentDate: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionId: string;
  notes?: string | null;
}

export interface InvoiceDetail {
  id: number;
  orderId: number;
  order: InvoiceOrderDetail;
  invoiceDate: string;
  dueDate: string;
  invoiceStatus: InvoiceStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  payment?: InvoicePayment | null;
}

export interface InvoiceDetailResponse {
  message: string;
  invoice: InvoiceDetail;
}
