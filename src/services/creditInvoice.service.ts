import api from '@/lib/api';
import type { CreditInvoiceListParams, CreditInvoiceListResponse } from '@/types/creditInvoice';

const BASE_PATH = '/v1/credit-invoices';

export const creditInvoiceService = {
  getMyList: async (params?: CreditInvoiceListParams): Promise<CreditInvoiceListResponse> => {
    const res = await api.get<CreditInvoiceListResponse>(`${BASE_PATH}/my`, { params });
    return res.data;
  },
};
