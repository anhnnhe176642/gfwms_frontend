import api from '@/lib/api';
import { Detection } from '@/types/yolo';

interface SubmitFabricCountPayload {
  datasetId: string | number;
  imageFile: File;
  detections: Detection[];
  imageInfo: {
    width: number;
    height: number;
  };
  notes?: string;
}

export const fabricCountService = {
  /**
   * Gửi ảnh đếm vải cùng detections vào dataset để cải thiện
   * Chuyển đổi detections sang định dạng bbox và gửi trực tiếp
   */
  submitToDataset: async (payload: SubmitFabricCountPayload): Promise<any> => {
    const {
      datasetId,
      imageFile,
      detections,
      imageInfo,
      notes,
    } = payload;

    // Convert detections to annotations format
    const annotations = detections.map((detection) => {
      // Handle both API detections (with bbox) and custom detections (with center + dimensions)
      let x1, y1, x2, y2;

      if (detection.bbox) {
        // API detections already have bbox
        x1 = detection.bbox.x1;
        y1 = detection.bbox.y1;
        x2 = detection.bbox.x2;
        y2 = detection.bbox.y2;
      } else {
        // Custom detections use center + dimensions
        const halfWidth = detection.dimensions.width / 2;
        const halfHeight = detection.dimensions.height / 2;
        x1 = Math.max(0, detection.center.x - halfWidth);
        y1 = Math.max(0, detection.center.y - halfHeight);
        x2 = Math.min(imageInfo.width, detection.center.x + halfWidth);
        y2 = Math.min(imageInfo.height, detection.center.y + halfHeight);
      }

      return {
        class_id: detection.class_id,
        class_name: detection.class_name,
        confidence: detection.confidence,
        bbox: {
          x1: Math.round(x1),
          y1: Math.round(y1),
          x2: Math.round(x2),
          y2: Math.round(y2),
        },
      };
    });

    // Prepare form data
    const formData = new FormData();
    formData.append('image', imageFile);
    if (notes) {
      formData.append('notes', notes);
    }
    formData.append('detections', JSON.stringify(annotations));

    // Upload to dataset
    const response = await api.post(
      `/v1/yolo/datasets/${datasetId}/images`,
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
