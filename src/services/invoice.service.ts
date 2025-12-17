import api from '@/lib/api';
import type {
  InvoiceListParams,
  InvoiceListResponse,
  InvoiceDetail,
  InvoiceDetailResponse,
} from '@/types/invoice';
import type { PaymentQRResponse, PaymentStatusResponse } from '@/types/payment';

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

  /**
   * Tạo mã QR thanh toán cho hóa đơn
   */
  createPaymentQR: async (invoiceId: number | string): Promise<PaymentQRResponse> => {
    const response = await api.post<{ message: string; data: PaymentQRResponse }>(
      `${BASE_PATH}/${invoiceId}/payment/qr-code`,
      {}
    );
    return response.data.data;
  },

  /**
   * Kiểm tra trạng thái thanh toán
   */
  getPaymentStatus: async (invoiceId: number | string): Promise<PaymentStatusResponse> => {
    const response = await api.get<PaymentStatusResponse>(
      `${BASE_PATH}/${invoiceId}/payment/status`
    );
    // API returns data directly, not wrapped in { message, data }
    return response.data as PaymentStatusResponse;
  },

  /**
   * Xác nhận thanh toán offline bằng tiền mặt
   */
  confirmOfflinePayment: async (
    invoiceId: number | string,
    amountPaid: number
  ): Promise<InvoiceDetail> => {
    const response = await api.post<{ message: string; data: any }>(
      `${BASE_PATH}/${invoiceId}/confirm-offline-payment`,
      {
        confirmed: true,
        amountPaid,
      }
    );
    return response.data.data;
  },
};

export default invoiceService;
