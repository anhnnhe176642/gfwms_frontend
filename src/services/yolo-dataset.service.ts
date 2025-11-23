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
  ImportDatasetFromZipResponse,
  ImportDatasetToExistingResponse,
  ExportDatasetResponse,
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
   * Lấy thông tin chi tiết một ảnh (bao gồm annotations nếu có)
   */
  getImageById: async (imageId: string): Promise<any> => {
    const response = await api.get(`/v1/yolo/datasets/images/${imageId}`);
    return response.data.data;
  },

  /**
   * Lấy thông tin dataset cùng danh sách classes
   */
  getDatasetWithClasses: async (datasetId: string | number): Promise<any> => {
    const response = await api.get(`${BASE_PATH}/${datasetId}`);
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
   * Lưu annotations (labels) cho ảnh
   * Annotations (pixel format) - Source of truth
   * Array of: {class_id, class_name, x1, y1, x2, y2, confidence}
   * x1, y1 = top-left corner; x2, y2 = bottom-right corner (pixel coordinates)
   * Input: annotations with x (x1 pixel), y (y1 pixel), width (pixels), height (pixels)
   */
  saveImageAnnotations: async (imageId: string, annotations: any[]): Promise<any> => {
    const payload: UpdateDatasetImagePayload = {
      annotations: annotations.map((ann) => {
        // Convert from x, y, width, height (pixel format) to x1, y1, x2, y2 (pixel format)
        const x1Pixel = ann.x || 0;
        const y1Pixel = ann.y || 0;
        const x2Pixel = (ann.x || 0) + (ann.width || 0);
        const y2Pixel = (ann.y || 0) + (ann.height || 0);

        return {
          class_id: ann.classId,
          class_name: ann.className,
          confidence: ann.confidence || 1,
          x1: Math.max(0, x1Pixel),
          y1: Math.max(0, y1Pixel),
          x2: Math.max(0, x2Pixel),
          y2: Math.max(0, y2Pixel),
        };
      }),
      status: 'COMPLETED',
    };

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

  /**
   * Import dataset từ file ZIP
   * @param zipFile - File ZIP chứa dataset
   * @param name - Tên dataset (bắt buộc)
   * @param description - Mô tả dataset (tùy chọn)
   */
  importZipDataset: async (
    zipFile: File,
    name: string,
    description?: string
  ): Promise<ImportDatasetFromZipResponse> => {
    const formData = new FormData();
    formData.append('zipFile', zipFile);
    formData.append('name', name);
    if (description) {
      formData.append('description', description);
    }

    const response = await api.post<ImportDatasetFromZipResponse>(
      `${BASE_PATH}/import-zip`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Import ảnh vào dataset có sẵn từ file ZIP
   * @param datasetId - ID của dataset
   * @param zipFile - File ZIP chứa ảnh
   */
  importDatasetToExisting: async (
    datasetId: string | number,
    zipFile: File
  ): Promise<ImportDatasetToExistingResponse> => {
    const formData = new FormData();
    formData.append('zipFile', zipFile);

    const response = await api.post<ImportDatasetToExistingResponse>(
      `${BASE_PATH}/${datasetId}/import`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Xuất dataset thành file ZIP
   * @param datasetId - ID của dataset cần xuất
   */
  exportDataset: async (datasetId: string | number): Promise<Blob> => {
    const response = await api.get<Blob>(
      `${BASE_PATH}/${datasetId}/export`,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  },
};
