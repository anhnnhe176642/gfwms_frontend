import api from '@/lib/api';
import type {
  FabricCategoryListResponse,
  FabricCategoryListParams,
  FabricCategoryListItem,
  CreateFabricCategoryPayload,
  UpdateFabricCategoryPayload,
  CreateFabricCategoryResponse,
  UpdateFabricCategoryResponse,
  GetFabricCategoryResponse,
} from '@/types/fabricCategory';

const BASE_PATH = '/v1/fabric-category';

export const fabricCategoryService = {
  /**
   * Lấy danh sách fabric category với phân trang và filter
   */
  getFabricCategories: async (params?: FabricCategoryListParams): Promise<FabricCategoryListResponse> => {
    const response = await api.get<FabricCategoryListResponse>(BASE_PATH, { params });
    return response.data;
  },

  /**
   * Lấy thông tin chi tiết một fabric category
   */
  getFabricCategoryById: async (id: string | number): Promise<FabricCategoryListItem> => {
    const response = await api.get<GetFabricCategoryResponse>(`${BASE_PATH}/${id}`);
    return response.data.data;
  },

  /**
   * Tạo fabric category mới
   */
  createFabricCategory: async (data: CreateFabricCategoryPayload): Promise<FabricCategoryListItem> => {
    const response = await api.post<CreateFabricCategoryResponse>(BASE_PATH, data);
    return response.data.data;
  },

  /**
   * Cập nhật fabric category
   */
  updateFabricCategory: async (
    id: string | number,
    data: UpdateFabricCategoryPayload
  ): Promise<FabricCategoryListItem> => {
    const response = await api.put<UpdateFabricCategoryResponse>(`${BASE_PATH}/${id}`, data);
    return response.data.data;
  },

  /**
   * Xóa fabric category
   */
  deleteFabricCategory: async (id: string | number): Promise<void> => {
    await api.delete(`${BASE_PATH}/${id}`);
  },

  /**
   * Tải ảnh lên cho fabric category
   */
  uploadFabricCategoryImage: async (id: string | number, file: File): Promise<FabricCategoryListItem> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.put<UpdateFabricCategoryResponse>(`${BASE_PATH}/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },
};

export default fabricCategoryService;
