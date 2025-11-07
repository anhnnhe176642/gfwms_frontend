import * as yup from 'yup';

/**
 * Schema xác thực tạo fabric gloss mới
 */
export const createFabricGlossSchema = yup.object().shape({
  description: yup
    .string()
    .required('Mô tả độ bóng là bắt buộc')
    .min(2, 'Mô tả độ bóng phải ít nhất 2 ký tự')
    .max(255, 'Mô tả độ bóng không được vượt quá 255 ký tự'),
});

export type CreateFabricGlossFormData = yup.InferType<typeof createFabricGlossSchema>;

/**
 * Schema xác thực cập nhật fabric gloss
 */
export const updateFabricGlossSchema = yup.object().shape({
  description: yup
    .string()
    .required('Mô tả độ bóng là bắt buộc')
    .min(2, 'Mô tả độ bóng phải ít nhất 2 ký tự')
    .max(255, 'Mô tả độ bóng không được vượt quá 255 ký tự'),
});

export type UpdateFabricGlossFormData = yup.InferType<typeof updateFabricGlossSchema>;
