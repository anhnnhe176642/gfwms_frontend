import api from '@/lib/api';
import type {
  ExportFabricListParams,
  ExportFabricListResponse,
  ExportFabricDetail as ExportFabricDetailType,
  ExportFabricStatus,
  SuggestAllocationRequest,
  SuggestAllocationResponse,
  SuggestFabricAllocation,
} from '@/types/exportFabric';

export type ExportFabricItem = {
  fabricId: number;
  quantity: number;
};

export type CreateExportFabricRequest = {
  warehouseId: number;
  storeId: number;
  note?: string;
  exportItems: ExportFabricItem[];
};

export type CreateExportFabricRequestPayload = {
  storeId: number;
  note?: string;
  exportItems: ExportFabricItem[];
};

export type ExportFabricCreatedBy = {
  username: string;
  email: string;
};

export type ExportFabricWarehouse = {
  name: string;
};

export type ExportFabricStore = {
  name: string;
};

export type ExportFabricItemDetail = {
  fabricId: number;
  quantity: number;
  price: number | null;
  fabric: {
    id: number;
    colorId: string;
    categoryId: number;
    sellingPrice: number;
    supplierId: number;
  };
  shelfSuggestions?: Array<{
    shelfId: number;
    shelfCode: string;
    availableQuantity: number;
  }>;
};

export type ExportFabricDetail = {
  id: number;
  warehouseId: number;
  warehouse: ExportFabricWarehouse;
  store: ExportFabricStore;
  status: ExportFabricStatus;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  createdBy: ExportFabricCreatedBy;
  receivedById: string | null;
  receivedBy: ExportFabricCreatedBy | null;
  exportItems: ExportFabricItemDetail[];
};

export type CreateExportFabricResponse = {
  message: string;
  exportFabric: ExportFabricDetail;
};

const BASE_PATH = '/v1/export-fabrics';

export const exportFabricService = {
  /**
   * Lấy danh sách phiếu xuất vải theo kho
   */
  list: async (params?: ExportFabricListParams): Promise<ExportFabricListResponse> => {
    const response = await api.get<ExportFabricListResponse>(BASE_PATH, { params });
    return response.data;
  },

  /**
   * Lấy chi tiết phiếu xuất vải
   */
  getDetail: async (id: number | string): Promise<ExportFabricDetail> => {
    const response = await api.get<{ message: string; exportFabric: ExportFabricDetail }>(
      `${BASE_PATH}/${id}`
    );
    return response.data.exportFabric;
  },

  /**
   * Tạo phiếu xuất kho mới
   */
  createExportFabric: async (data: CreateExportFabricRequest): Promise<ExportFabricDetail> => {
    const response = await api.post<CreateExportFabricResponse>(BASE_PATH, data);
    return response.data.exportFabric;
  },

  /**
   * Lấy chi tiết phiếu xuất để xem trước khi duyệt (theo warehouse id của export fabric)
   */
  getPreview: async (exportFabricId: number | string): Promise<ExportFabricDetail> => {
    const response = await api.get<{ message: string; exportFabric: ExportFabricDetail }>(
      `${BASE_PATH}/warehouse/${exportFabricId}`
    );
    return response.data.exportFabric;
  },

  /**
   * Duyệt phiếu xuất kho
   */
  approveExport: async (
    exportFabricId: number | string,
    batchPickupDetails: Array<{
      fabricId: number;
      batches: Array<{
        importId: number;
        shelfId: number;
        pickQuantity: number;
      }>;
    }>,
    note?: string
  ): Promise<ExportFabricDetail> => {
    const response = await api.patch<{ message: string; exportFabric: ExportFabricDetail }>(
      `${BASE_PATH}/${exportFabricId}/status`,
      {
        status: 'APPROVED',
        batchPickupDetails,
        ...(note && { note }),
      }
    );
    return response.data.exportFabric;
  },

  /**
   * Xác nhận nhận hàng từ cửa hàng (APPROVED -> COMPLETED)
   * Chuyển status từ APPROVED sang COMPLETED
   * Tự động cộng vải vào FabricStore
   */
  completeExport: async (exportFabricId: number | string): Promise<ExportFabricDetail> => {
    const response = await api.post<{ message: string; exportFabric: ExportFabricDetail }>(
      `${BASE_PATH}/${exportFabricId}/complete`
    );
    return response.data.exportFabric;
  },

  /**
   * Từ chối phiếu xuất kho (PENDING -> REJECTED)
   * Nhân viên kho từ chối yêu cầu xuất với lí do
   */
  rejectExport: async (
    exportFabricId: number | string,
    note: string
  ): Promise<ExportFabricDetail> => {
    const response = await api.patch<{ message: string; exportFabric: ExportFabricDetail }>(
      `${BASE_PATH}/${exportFabricId}/status`,
      {
        status: 'REJECTED',
        note,
      }
    );
    return response.data.exportFabric;
  },

  /**
   * Tạo yêu cầu xuất kho mới (không cần chọn kho)
   */
  createExportRequest: async (data: CreateExportFabricRequestPayload): Promise<ExportFabricDetail> => {
    const response = await api.post<CreateExportFabricResponse>(`${BASE_PATH}/request`, data);
    return response.data.exportFabric;
  },

  /**
   * Gợi ý phân bổ tối ưu cho các fabric (Greedy Algorithm)
   */
  suggestAllocation: async (data: SuggestAllocationRequest): Promise<SuggestFabricAllocation[]> => {
    const response = await api.post<SuggestAllocationResponse>(`${BASE_PATH}/suggest`, data);
    return response.data.warehouseAllocations.fabrics;
  },

  /**
   * Tạo batch phiếu xuất vải (1 phiếu per warehouse)
   */
  createBatchExport: async (data: {
    storeId: number;
    note?: string;
    warehouseAllocations: Array<{
      warehouseId: number;
      items: Array<{
        fabricId: number;
        quantity: number;
      }>;
    }>;
  }): Promise<{
    batchId: number;
    exports: ExportFabricDetail[];
  }> => {
    const response = await api.post<{
      message: string;
      batchId: number;
      exports: ExportFabricDetail[];
    }>(`${BASE_PATH}/batch`, data);
    return {
      batchId: response.data.batchId,
      exports: response.data.exports,
    };
  },
};

export default exportFabricService;

// Re-export types for convenience
export type {
  ExportFabricListItem,
  ExportFabricListResponse,
  ExportFabricListParams,
  ExportFabricStatus,
} from '@/types/exportFabric';
