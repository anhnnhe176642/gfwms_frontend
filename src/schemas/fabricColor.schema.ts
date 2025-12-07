import * as yup from 'yup';

/**
 * Schema xác thực tạo fabric color mới
 */
export const createFabricColorSchema = yup.object().shape({
  id: yup
    .string()
    .required('Mã màu vải là bắt buộc')
    .min(1, 'Mã màu vải không được rỗng')
    .max(100, 'Mã màu vải không được vượt quá 100 ký tự'),
  name: yup
    .string()
    .required('Tên màu vải là bắt buộc')
    .min(1, 'Tên màu vải không được rỗng')
    .max(255, 'Tên màu vải không được vượt quá 255 ký tự'),
  hexCode: yup
    .string()
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Mã hex không hợp lệ (vd: #FF5733)'),
});

export type CreateFabricColorFormData = yup.InferType<typeof createFabricColorSchema>;

/**
 * Schema xác thực cập nhật fabric color
 */
export const updateFabricColorSchema = yup.object().shape({
  name: yup
    .string()
    .required('Tên màu vải là bắt buộc')
    .min(1, 'Tên màu vải không được rỗng')
    .max(255, 'Tên màu vải không được vượt quá 255 ký tự'),
  hexCode: yup
    .string()
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Mã hex không hợp lệ (vd: #FF5733)'),
});

export type UpdateFabricColorFormData = yup.InferType<typeof updateFabricColorSchema>;
