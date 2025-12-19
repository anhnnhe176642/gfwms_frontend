import api from '@/lib/api';
import type { DashboardParams, DashboardResponse } from '@/types/dashboard';

const BASE_PATH = '/v1/dashboard';

export const dashboardService = {
  /**
   * Lấy toàn bộ dữ liệu dashboard
   */
  getFullDashboard: async (params?: DashboardParams): Promise<DashboardResponse> => {
    const response = await api.get<DashboardResponse>(`${BASE_PATH}/full`, { params });
    return response.data;
  },
};

export default dashboardService;
