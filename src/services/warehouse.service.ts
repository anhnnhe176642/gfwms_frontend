import api from '@/lib/api';
import type {
  WarehouseListResponse,
  WarehouseListParams,
  WarehouseListItem,
  WarehouseStatus,
  ShelfListResponse,
  ShelfListParams,
  CreateShelfPayload,
  UpdateShelfPayload,
  CreateShelfResponse,
  UpdateShelfResponse,
  GetShelfResponse,
  ShelfListItem,
  ShelfDetail,
  ShelfWithFabricListResponse,
  ShelfWithGroupsListResponse,
  ShelfListApiResponse,
  FabricShelfDetailResponse,
  FabricShelfDetailData,
  FabricShelvesResponse,
  FabricShelvesData,
  FabricPickupResponse,
  FabricPickupData,
  FabricPickupParams,
} from '@/types/warehouse';
import type { CreateWarehouseFormData, UpdateWarehouseFormData } from '@/schemas/warehouse.schema';

const BASE_PATH = '/v1/warehouses';

export type UpdateWarehouseStatusPayload = {
  warehouseId: number;
  status: WarehouseStatus;
};

export type CreateWarehouseResponse = {
  message: string;
  warehouse: WarehouseListItem;
};

export type UpdateWarehouseResponse = {
  message: string;
  warehouse: WarehouseListItem;
};

export type GetWarehouseResponse = {
  message: string;
  warehouse: WarehouseListItem;
};

export const warehouseService = {
  /**
   * Lấy danh sách warehouse với phân trang và filter
   */
  getWarehouses: async (params?: WarehouseListParams): Promise<WarehouseListResponse> => {
    const response = await api.get<WarehouseListResponse>(BASE_PATH, { params });
    return response.data;
  },

  /**
   * Lấy danh sách warehouse cho infinite scroll (transform response)
   */
  getWarehousesForInfiniteScroll: async (params?: WarehouseListParams): Promise<{ data: WarehouseListItem[]; pagination: { hasNext: boolean } }> => {
    const response = await api.get<WarehouseListResponse>(BASE_PATH, { params });
    const apiData = response.data;
    return {
      data: apiData.data,
      pagination: {
        hasNext: apiData.pagination.hasNext ?? false,
      },
    };
  },

  /**
   * Lấy thông tin chi tiết một warehouse
   */
  getWarehouseById: async (id: string | number): Promise<WarehouseListItem> => {
    const response = await api.get<GetWarehouseResponse>(`${BASE_PATH}/${id}`);
    return response.data.warehouse;
  },

  /**
   * Tạo warehouse mới
   */
  createWarehouse: async (data: CreateWarehouseFormData): Promise<WarehouseListItem> => {
    const response = await api.post<CreateWarehouseResponse>(BASE_PATH, data);
    return response.data.warehouse;
  },

  /**
   * Cập nhật warehouse
   */
  updateWarehouse: async (id: string | number, data: UpdateWarehouseFormData): Promise<WarehouseListItem> => {
    const response = await api.patch<UpdateWarehouseResponse>(`${BASE_PATH}/${id}`, data);
    return response.data.warehouse;
  },

  /**
   * Cập nhật trạng thái warehouse
   */
  updateWarehouseStatus: async (payload: UpdateWarehouseStatusPayload): Promise<WarehouseListItem> => {
    const response = await api.patch<WarehouseListItem>(
      `${BASE_PATH}/${payload.warehouseId}/status`,
      { status: payload.status }
    );
    return response.data;
  },

  /**
   * Xóa warehouse
   */
  deleteWarehouse: async (id: string | number): Promise<void> => {
    await api.delete(`${BASE_PATH}/${id}`);
  },

  /**
   * Lấy danh sách kệ của một kho
   * Nếu fabricId được cung cấp, sẽ trả về các kệ chứa loại vải đó
   * Nếu groupBy được cung cấp, sẽ trả về kệ với fabricGroups thay vì fabricShelf
   * Kết quả sẽ bao gồm fabricShelf hoặc fabricGroups chi tiết cho từng kệ
   */
  getShelves: async (params?: ShelfListParams): Promise<ShelfListApiResponse> => {
    const response = await api.get<ShelfListApiResponse>('/v1/shelves', { params });
    return response.data;
  },

  /**
   * Lấy thông tin chi tiết một kệ
   */
  getShelfById: async (id: string | number): Promise<ShelfDetail> => {
    const response = await api.get<GetShelfResponse>(`/v1/shelves/${id}`);
    return response.data.shelf;
  },

  /**
   * Tạo kệ mới
   */
  createShelf: async (data: CreateShelfPayload): Promise<ShelfListItem> => {
    const response = await api.post<CreateShelfResponse>('/v1/shelves', data);
    return response.data.shelf;
  },

  /**
   * Cập nhật thông tin kệ
   */
  updateShelf: async (id: string | number, data: UpdateShelfPayload): Promise<ShelfListItem> => {
    const response = await api.put<UpdateShelfResponse>(`/v1/shelves/${id}`, data);
    return response.data.shelf;
  },

  /**
   * Xóa kệ
   */
  deleteShelf: async (id: string | number): Promise<void> => {
    await api.delete(`/v1/shelves/${id}`);
  },

  /**
   * Lấy chi tiết vải trong kệ
   */
  getFabricShelfDetail: async (shelfId: string | number, fabricId: string | number): Promise<FabricShelfDetailData> => {
    const response = await api.get<FabricShelfDetailResponse>(`/v1/fabric-shelf/shelf/${shelfId}/fabric/${fabricId}/detail`);
    return response.data.data;
  },

  /**
   * Lấy danh sách kệ chứa loại vải trong kho (với thông tin batch)
   */
  getFabricShelves: async (warehouseId: string | number, fabricId: string | number): Promise<FabricShelvesData> => {
    const response = await api.get<FabricShelvesResponse>(`${BASE_PATH}/${warehouseId}/fabrics/${fabricId}/shelves`);
    return response.data.data;
  },

  /**
   * Tính toán phân bổ lấy vải tối ưu từ các kệ/lô
   * @param warehouseId - ID của kho
   * @param fabricId - ID của loại vải
   * @param params - Tham số bao gồm quantity và priority
   * @returns Kết quả phân bổ tối ưu
   */
  getFabricPickup: async (
    warehouseId: string | number,
    fabricId: string | number,
    params: FabricPickupParams
  ): Promise<FabricPickupData> => {
    const response = await api.get<FabricPickupResponse>(
      `${BASE_PATH}/${warehouseId}/fabrics/${fabricId}/pickup`,
      { params }
    );
    return response.data.data;
  },
};

export default warehouseService;
