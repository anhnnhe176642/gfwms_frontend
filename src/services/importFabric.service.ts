import api from '@/lib/api';
import type {
  ImportFabricListResponse,
  ImportFabricListParams,
  ImportFabricDetailResponse,
} from '@/types/importFabric';

const BASE_PATH = '/v1/import-fabrics';

export type CreateImportFabricRequest = {
  warehouseId: number;
  items: Array<{
    thickness: number;
    glossId: number;
    length: number;
    width: number;
    weight: number;
    categoryId: number;
    colorId: string;
    supplierId: number;
    quantity: number;
    price: number;
  }>;
  signatureImage?: File;
};

export type CreateImportFabricResponse = {
  message: string;
  data: {
    id: number;
  };
};

export type AllocateToShelfRequest = {
  importFabricId: number;
  shelves: Array<{
    shelfId: number;
    quantity: number;
  }>;
};

export type AllocatedShelf = {
  shelfId: number;
  quantity: number;
};

export type AllocateToShelfResponse = {
  message: string;
  data: {
    importFabricId: number;
    fabricId: number;
    allocatedShelves: AllocatedShelf[];
  };
};

export type UpdateImportFabricStatusRequest = {
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
};

export type UpdateImportFabricStatusResponse = {
  message: string;
  data: {
    id: number;
    status: string;
  };
};

export const importFabricService = {
  /**
   * Lấy danh sách phiếu nhập kho với phân trang và filter
   */
  getImportFabrics: async (params?: ImportFabricListParams): Promise<ImportFabricListResponse> => {
    const response = await api.get<ImportFabricListResponse>(BASE_PATH, { params });
    return response.data;
  },

  /**
   * Lấy chi tiết phiếu nhập kho
   */
  getImportFabricDetail: async (id: number): Promise<ImportFabricDetailResponse> => {
    const response = await api.get<ImportFabricDetailResponse>(`${BASE_PATH}/${id}`);
    return response.data;
  },

  /**
   * Tạo phiếu nhập kho mới
   * Gửi FormData với warehouseId, items (JSON string), và signature image (optional)
   */
  createImportFabric: async (data: CreateImportFabricRequest): Promise<CreateImportFabricResponse> => {
    const formData = new FormData();
    formData.append('warehouseId', data.warehouseId.toString());
    formData.append('items', JSON.stringify(data.items));
    if (data.signatureImage) {
      formData.append('signatureImage', data.signatureImage);
    }

    const response = await api.post<CreateImportFabricResponse>(BASE_PATH, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Phân bổ vải vào kệ
   */
  allocateToShelves: async (fabricId: number, data: AllocateToShelfRequest): Promise<AllocateToShelfResponse> => {
    const response = await api.post<AllocateToShelfResponse>(`/v1/fabric-shelf/${fabricId}/allocate-to-shelves`, data);
    return response.data;
  },

  /**
   * Cập nhật status phiếu nhập
   */
  updateImportFabricStatus: async (
    id: number,
    data: UpdateImportFabricStatusRequest
  ): Promise<UpdateImportFabricStatusResponse> => {
    const response = await api.put<UpdateImportFabricStatusResponse>(`${BASE_PATH}/${id}/status`, data);
    return response.data;
  },
};

export default importFabricService;
