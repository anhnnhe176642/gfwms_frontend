import * as yup from 'yup';

/**
 * Schema xác thực tạo fabric category mới
 */
export const createFabricCategorySchema = yup.object().shape({
  name: yup
    .string()
    .required('Tên danh mục là bắt buộc')
    .min(3, 'Tên danh mục phải ít nhất 3 ký tự')
    .max(255, 'Tên danh mục không được vượt quá 255 ký tự'),
  description: yup
    .string()
    .max(1000, 'Mô tả không được vượt quá 1000 ký tự')
    .optional(),
  sellingPricePerMeter: yup
    .number()
    .optional()
    .typeError('Giá bán/mét phải là số')
    .min(0, 'Giá bán/mét không được âm'),
  sellingPricePerRoll: yup
    .number()
    .optional()
    .typeError('Giá bán/cuộn phải là số')
    .min(0, 'Giá bán/cuộn không được âm'),
});

export type CreateFabricCategoryFormData = yup.InferType<typeof createFabricCategorySchema>;

/**
 * Schema xác thực cập nhật fabric category
 */
export const updateFabricCategorySchema = yup.object().shape({
  name: yup
    .string()
    .required('Tên danh mục là bắt buộc')
    .min(3, 'Tên danh mục phải ít nhất 3 ký tự')
    .max(255, 'Tên danh mục không được vượt quá 255 ký tự'),
  description: yup
    .string()
    .max(1000, 'Mô tả không được vượt quá 1000 ký tự')
    .optional(),
  sellingPricePerMeter: yup
    .number()
    .optional()
    .typeError('Giá bán/mét phải là số')
    .min(0, 'Giá bán/mét không được âm'),
  sellingPricePerRoll: yup
    .number()
    .optional()
    .typeError('Giá bán/cuộn phải là số')
    .min(0, 'Giá bán/cuộn không được âm'),
});

export type UpdateFabricCategoryFormData = yup.InferType<typeof updateFabricCategorySchema>;
