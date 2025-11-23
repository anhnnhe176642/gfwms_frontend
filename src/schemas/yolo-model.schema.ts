import * as yup from 'yup';
import type { YoloModelStatus } from '@/types/yolo-model';

export const updateYoloModelSchema = yup.object({
  description: yup.string().optional().max(500, 'Mô tả không được vượt quá 500 ký tự'),
  version: yup.string().optional().max(50, 'Phiên bản không được vượt quá 50 ký tự'),
  status: yup.string<YoloModelStatus>().optional().oneOf(['ACTIVE', 'DEPRECATED', 'TESTING']),
});

export type UpdateYoloModelFormData = yup.InferType<typeof updateYoloModelSchema>;
