import api from '@/lib/api';
import type {
  CreditRegistration,
  CreditRegistrationListResponse,
  CreditRegistrationListParams,
} from '@/types/creditRegistration';

const BASE_PATH = '/v1/credit-registrations';

export const creditRegistrationService = {
  list: async (
    params?: CreditRegistrationListParams
  ): Promise<CreditRegistrationListResponse> => {
    const res = await api.get<CreditRegistrationListResponse>(BASE_PATH, {
      params,
    });
    return res.data;
  },

  getById: async (id: string | number): Promise<CreditRegistration> => {
    const res = await api.get<{ message: string; creditRegistration: CreditRegistration }>(
      `${BASE_PATH}/${id}`
    );
    return res.data.creditRegistration;
  },
};
