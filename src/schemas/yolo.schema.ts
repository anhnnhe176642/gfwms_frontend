import * as yup from 'yup';

export const yoloDetectSchema = yup.object().shape({
  image: yup
    .mixed()
    .required('Vui lòng chọn ảnh')
    .test(
      'fileType',
      'Chỉ hỗ trợ ảnh (JPEG, PNG, GIF, WebP)',
      (value) => {
        if (!value) return false;
        if (!(value instanceof File)) return false;
        
        const supportedTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
        ];
        return supportedTypes.includes(value.type);
      }
    )
    .test(
      'fileSize',
      'Ảnh không được vượt quá 10MB',
      (value) => {
        if (!value || !(value instanceof File)) return false;
        return value.size <= 10 * 1024 * 1024; // 10MB
      }
    ),
  confidence: yup
    .number()
    .optional()
    .typeError('Confidence phải là số')
    .min(0, 'Confidence tối thiểu là 0')
    .max(1, 'Confidence tối đa là 1')
    .default(0.5),
});

export type YoloDetectFormData = yup.InferType<typeof yoloDetectSchema>;
