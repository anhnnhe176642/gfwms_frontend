import api from '@/lib/api';
import type {
  OrderListParams,
  OrderListResponse,
  OrderDetail,
  OrderDetailResponse,
} from '@/types/order';

const BASE_PATH = '/v1/orders';

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
};

export default orderService;
