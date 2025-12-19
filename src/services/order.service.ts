import api from '@/lib/api';
import type {
  OrderListParams,
  OrderListResponse,
  OrderDetail,
  OrderDetailResponse,
  PaymentType,
  SaleUnit,
} from '@/types/order';

const BASE_PATH = '/v1/orders';

export type PaymentMethod = 'DIRECT' | 'QR';

export type CreateOfflineOrderPayload = {
  customerPhone?: string;
  storeId: number;
  orderItems: Array<{
    fabricId: number;
    quantity: number;
    saleUnit: SaleUnit;
  }>;
  paymentType: PaymentType;
  paymentMethod?: PaymentMethod;
  notes?: string;
};

export type CreateOfflineOrderResponse = {
  message: string;
  data: OrderDetail;
};

export type CreateOrderPayload = {
  storeId: number | string;
  orderItems: Array<{
    fabricId: number;
    quantity: number;
    saleUnit: SaleUnit;
  }>;
  paymentType: PaymentType;
  notes?: string;
};

export type CreateOrderResponse = {
  message: string;
  data: {
    order: OrderDetail;
    paymentAmount: number;
    deadline: string;
    paymentInstructions: {
      invoiceId: number;
      amount: number;
      method: string;
      url: string;
      deadline: string;
    };
  };
};

export const orderService = {
  /**
   * Lấy danh sách đơn hàng của người dùng hiện tại
   */
  getMyOrders: async (params?: OrderListParams): Promise<OrderListResponse> => {
    const response = await api.get<OrderListResponse>(`${BASE_PATH}/my`, { params });
    return response.data;
  },

  /**
   * Lấy tất cả đơn hàng (Admin)
   */
  list: async (params?: OrderListParams): Promise<OrderListResponse> => {
    const response = await api.get<OrderListResponse>(`${BASE_PATH}/all`, { params });
    return response.data;
  },

  /**
   * Lấy danh sách đơn hàng theo cửa hàng (Admin/Manager)
   */
  getByStore: async (storeId: number | string, params?: OrderListParams): Promise<OrderListResponse> => {
    const response = await api.get<OrderListResponse>(`${BASE_PATH}/store/${storeId}`, { params });
    return response.data;
  },

  /**
   * Lấy chi tiết đơn hàng
   */
  getDetail: async (id: number | string): Promise<OrderDetail> => {
    const response = await api.get<OrderDetailResponse>(`${BASE_PATH}/${id}`);
    return response.data.data;
  },

  /**
   * Tạo đơn hàng mới
   */
  create: async (payload: CreateOrderPayload): Promise<CreateOrderResponse> => {
    const response = await api.post<CreateOrderResponse>(BASE_PATH, payload);
    return response.data;
  },

  /**
   * Tạo đơn hàng offline tại cửa hàng
   */
  createOfflineOrder: async (payload: CreateOfflineOrderPayload): Promise<CreateOfflineOrderResponse> => {
    const response = await api.post<CreateOfflineOrderResponse>(`${BASE_PATH}/offline`, payload);
    return response.data;
  },

  /**
   * Đánh dấu đơn hàng đã giao thành công (PROCESSING → DELIVERED)
   */
  markDelivered: async (id: number | string): Promise<OrderDetail> => {
    const response = await api.patch<OrderDetailResponse>(`${BASE_PATH}/${id}/mark-delivered`);
    return response.data.data;
  },
};

export default orderService;
