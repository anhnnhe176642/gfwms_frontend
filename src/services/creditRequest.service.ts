import api from '@/lib/api';
import type {
  CreditRequestListResponse,
  CreditRequestListParams,
  CreditRequestListItem,
  CreditRequest,
  UpdateCreditRequestStatusPayload,
} from '@/types/creditRequest';

const BASE_PATH = '/v1/credit-requests';

export interface CreateCreditRequestPayload {
  requestLimit: number;
  note?: string;
}

export const creditRequestService = {
  /**
   * Lấy danh sách lịch sử đơn hạn mức (INITIAL + INCREASE)
   */
  getRequests: async (params?: CreditRequestListParams): Promise<CreditRequestListResponse> => {
    const response = await api.get<CreditRequestListResponse>(BASE_PATH, { params });
    return response.data;
  },

  /**
   * Lấy chi tiết một đơn hạn mức
   */
  getRequestById: async (id: number): Promise<CreditRequest> => {
    const response = await api.get<{ message: string; request: CreditRequest }>(`${BASE_PATH}/${id}`);
    return response.data.request;
  },

  /**
   * Tạo đơn đăng ký nợ mới
   */
  createInitialRequest: async (payload: CreateCreditRequestPayload): Promise<CreditRequest> => {
    const response = await api.post<{ message: string; request: CreditRequest }>(
      `${BASE_PATH}/initial`,
      payload
    );
    return response.data.request;
  },

  /**
   * Phê duyệt đơn đăng ký hạn mức
   */
  approveCreditRequest: async (payload: UpdateCreditRequestStatusPayload): Promise<CreditRequestListItem> => {
    const response = await api.patch<CreditRequestListItem>(
      `${BASE_PATH}/${payload.requestId}/approve`,
      {
        status: payload.status,
        ...(payload.requestLimit !== undefined && { requestLimit: payload.requestLimit }),
        ...(payload.note && { note: payload.note }),
      }
    );
    return response.data;
  },

  /**
   * Từ chối đơn đăng ký hạn mức
   */
  rejectCreditRequest: async (payload: UpdateCreditRequestStatusPayload): Promise<CreditRequestListItem> => {
    const response = await api.patch<CreditRequestListItem>(
      `${BASE_PATH}/${payload.requestId}/reject`,
      {
        status: payload.status,
        ...(payload.note && { note: payload.note }),
      }
    );
    return response.data;
  },

  /**
   * Tạo đơn tăng hạn mức nợ
   */
  increaseCredit: async (payload: CreateCreditRequestPayload): Promise<CreditRequest> => {
    const response = await api.post<{ message: string; request: CreditRequest }>(
      `${BASE_PATH}/increase`,
      payload
    );
    return response.data.request;
  },
};
