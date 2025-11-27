import api from '@/lib/api';
import type {
  ExportFabricListParams,
  ExportFabricListResponse,
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
};

export type ExportFabricDetail = {
  id: number;
  warehouseId: number;
  warehouse: ExportFabricWarehouse;
  store: ExportFabricStore;
  status: string;
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
   * Tạo phiếu xuất kho mới
   */
  createExportFabric: async (data: CreateExportFabricRequest): Promise<ExportFabricDetail> => {
    const response = await api.post<CreateExportFabricResponse>(BASE_PATH, data);
    return response.data.exportFabric;
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
