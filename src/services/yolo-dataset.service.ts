import api from '@/lib/api';
import type {
  DatasetListResponse,
  DatasetListParams,
  DatasetListItem,
  DatasetStatus,
  DatasetDetail,
  GetDatasetResponse,
  CreateDatasetPayload,
  UpdateDatasetPayload,
  CreateDatasetResponse,
  UpdateDatasetResponse,
  DatasetImageListResponse,
  DatasetImageListParams,
  UpdateDatasetImagePayload,
  UpdateDatasetImageResponse,
} from '@/types/yolo-dataset';

const BASE_PATH = '/v1/yolo/datasets';

export const yoloDatasetService = {
  /**
   * Lấy danh sách dataset với phân trang và filter
   */
  getDatasets: async (params?: DatasetListParams): Promise<DatasetListResponse> => {
    const response = await api.get<DatasetListResponse>(BASE_PATH, { params });
    return response.data;
  },

  /**
   * Lấy thông tin chi tiết một dataset
   */
  getDatasetById: async (datasetId: string | number): Promise<DatasetDetail> => {
    const response = await api.get<GetDatasetResponse>(`${BASE_PATH}/${datasetId}`);
    return response.data.data;
  },

  /**
   * Tạo dataset mới
   */
  createDataset: async (payload: CreateDatasetPayload): Promise<DatasetDetail> => {
    const response = await api.post<CreateDatasetResponse>(BASE_PATH, payload);
    return response.data.data;
  },

  /**
   * Cập nhật dataset
   */
  updateDataset: async (datasetId: string | number, payload: UpdateDatasetPayload): Promise<DatasetDetail> => {
    const response = await api.patch<UpdateDatasetResponse>(`${BASE_PATH}/${datasetId}`, payload);
    return response.data.data;
  },

  /**
   * Xóa dataset
   */
  deleteDataset: async (datasetId: string | number): Promise<void> => {
    await api.delete(`${BASE_PATH}/${datasetId}`);
  },

  /**
   * Thay đổi trạng thái dataset
   */
  updateDatasetStatus: async (datasetId: string | number, status: DatasetStatus): Promise<DatasetDetail> => {
    const response = await api.patch<UpdateDatasetResponse>(`${BASE_PATH}/${datasetId}`, { status });
    return response.data.data;
  },

  /**
   * Lấy danh sách ảnh trong dataset
   */
  getDatasetImages: async (datasetId: string | number, params?: DatasetImageListParams): Promise<DatasetImageListResponse> => {
    const response = await api.get<DatasetImageListResponse>(`${BASE_PATH}/${datasetId}/images`, { params });
    return response.data;
  },

  /**
   * Lấy thông tin chi tiết một ảnh
   */
  getImageById: async (imageId: string): Promise<any> => {
    const response = await api.get(`/v1/yolo/datasets/images/${imageId}`);
    return response.data.data;
  },

  /**
   * Tải ảnh lên dataset
   */
  uploadImage: async (datasetId: string | number, file: File, notes?: string): Promise<any> => {
    const formData = new FormData();
    formData.append('image', file);
    if (notes) {
      formData.append('notes', notes);
    }

    const response = await api.post(`${BASE_PATH}/${datasetId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Cập nhật thông tin ảnh (gán nhãn, cập nhật trạng thái, ghi chú)
   */
  updateImage: async (imageId: string, payload: UpdateDatasetImagePayload): Promise<any> => {
    const response = await api.patch<UpdateDatasetImageResponse>(
      `/v1/yolo/datasets/images/${imageId}`,
      payload
    );
    return response.data.data;
  },

  /**
   * Xóa ảnh từ dataset
   */
  deleteImage: async (imageId: string): Promise<void> => {
    await api.delete(`/v1/yolo/datasets/images/${imageId}`);
  },
};
