import api from '@/lib/api';
import type {
  InvoiceListParams,
  InvoiceListResponse,
  InvoiceDetail,
  InvoiceDetailResponse,
} from '@/types/invoice';

const BASE_PATH = '/v1/invoices';

export const invoiceService = {
  /**
   * Lấy danh sách hóa đơn
   */
  list: async (params?: InvoiceListParams): Promise<InvoiceListResponse> => {
    const response = await api.get<InvoiceListResponse>(BASE_PATH, { params });
    return response.data;
  },

  /**
   * Lấy chi tiết hóa đơn
   */
  getDetail: async (id: number | string): Promise<InvoiceDetail> => {
    const response = await api.get<InvoiceDetailResponse>(`${BASE_PATH}/${id}`);
    return response.data.invoice;
  },
};

export default invoiceService;
