import api from '@/lib/api';

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
   * Tạo phiếu xuất kho mới
   */
  createExportFabric: async (data: CreateExportFabricRequest): Promise<ExportFabricDetail> => {
    const response = await api.post<CreateExportFabricResponse>(BASE_PATH, data);
    return response.data.exportFabric;
  },
};

export default exportFabricService;
