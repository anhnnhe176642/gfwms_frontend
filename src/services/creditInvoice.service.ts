import api from '@/lib/api';
import type { CreditInvoiceListParams, CreditInvoiceListResponse } from '@/types/creditInvoice';

const BASE_PATH = '/v1/credit-invoices';

export type QRData = {
  bankBeneficiary?: string;
  bankCode?: string;
  bankAccount?: string;
  amount?: number;
  description?: string;
  transactionId?: string;
};

export type CreditInvoicePaymentQRResponse = {
  paymentId: number;
  creditInvoiceId: number;
  paymentUrl: string;
  qrCodeUrl: string;
  qrCodeBase64: string;
  amount: number;
  currency: string;
  expiresAt: string;
  invoiceCount: number;
};

export type PaymentStatusResponse = {
  creditInvoiceId: number;
  creditInvoiceStatus: 'PENDING' | 'PAID' | 'EXPIRED';
  totalCreditAmount: number;
  creditPaidAmount: number;
  paymentId: number;
  paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED';
  amount: number;
  paymentDate: string;
  transactionId?: string;
  invoiceCount: number;
};

export const creditInvoiceService = {
  getMyList: async (params?: CreditInvoiceListParams): Promise<CreditInvoiceListResponse> => {
    const res = await api.get<CreditInvoiceListResponse>(`${BASE_PATH}/my`, { params });
    return res.data;
  },

  /**
   * Tạo mã QR thanh toán cho Credit Invoice (gom tháng)
   */
  createPaymentQR: async (creditInvoiceId: number | string): Promise<CreditInvoicePaymentQRResponse> => {
    const res = await api.post<{ message: string; data: CreditInvoicePaymentQRResponse }>(
      `${BASE_PATH}/${creditInvoiceId}/payment/qr-code`,
      {}
    );
    return res.data.data;
  },

  /**
   * Kiểm tra trạng thái thanh toán công nợ
   */
  getPaymentStatus: async (creditInvoiceId: number | string): Promise<PaymentStatusResponse> => {
    const res = await api.get<PaymentStatusResponse>(
      `${BASE_PATH}/${creditInvoiceId}/payment/status`
    );
    // API returns data directly
    return res.data as PaymentStatusResponse;
  },
};
