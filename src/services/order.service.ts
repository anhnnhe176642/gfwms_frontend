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

export type CreateOfflineOrderPayload = {
  customerPhone?: string;
  storeId: number;
  orderItems: Array<{
    fabricId: number;
    quantity: number;
    saleUnit: SaleUnit;
  }>;
  paymentType: PaymentType;
  notes?: string;
};

export const orderService = {
  /**
   * Lấy tất cả đơn hàng (Admin)
   */
  list: async (params?: OrderListParams): Promise<OrderListResponse> => {
    const response = await api.get<OrderListResponse>(`${BASE_PATH}/all`, { params });
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
   * Tạo đơn hàng offline tại cửa hàng
   */
  createOfflineOrder: async (payload: CreateOfflineOrderPayload): Promise<OrderDetail> => {
    const response = await api.post<OrderDetailResponse>(`${BASE_PATH}/offline`, payload);
    return response.data.data;
  },
};

export default orderService;
