import { api } from '@/lib/api';
import { YoloDetectParams, YoloDetectionResponse } from '@/types/yolo';

export const yoloService = {
  /**
   * Gọi API phát hiện objects từ ảnh
   * @param params - image file và confidence threshold (optional)
   * @returns Detection result với bounding boxes và thông tin chi tiết
   */
  detect: async (params: YoloDetectParams): Promise<YoloDetectionResponse> => {
    const formData = new FormData();
    formData.append('image', params.image);
    
    if (params.confidence !== undefined) {
      formData.append('confidence', params.confidence.toString());
    }

    const response = await api.post<YoloDetectionResponse>(
      '/v1/yolo/detect',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return response.data;
  },
};
