import * as yup from 'yup';

/**
 * Schema xác thực tạo store mới
 */
export const createStoreSchema = yup.object().shape({
  name: yup
    .string()
    .required('Tên cửa hàng là bắt buộc')
    .min(3, 'Tên cửa hàng phải ít nhất 3 ký tự')
    .max(255, 'Tên cửa hàng không được vượt quá 255 ký tự'),
  address: yup
    .string()
    .required('Địa chỉ là bắt buộc')
    .min(5, 'Địa chỉ phải ít nhất 5 ký tự')
    .max(500, 'Địa chỉ không được vượt quá 500 ký tự'),
});

export type CreateStoreFormData = yup.InferType<typeof createStoreSchema>;

/**
 * Schema xác thực cập nhật store
 */
export const updateStoreSchema = yup.object().shape({
  name: yup
    .string()
    .required('Tên cửa hàng là bắt buộc')
    .min(3, 'Tên cửa hàng phải ít nhất 3 ký tự')
    .max(255, 'Tên cửa hàng không được vượt quá 255 ký tự'),
  address: yup
    .string()
    .required('Địa chỉ là bắt buộc')
    .min(5, 'Địa chỉ phải ít nhất 5 ký tự')
    .max(500, 'Địa chỉ không được vượt quá 500 ký tự'),
  isActive: yup
    .boolean()
    .required('Trạng thái là bắt buộc'),
});

export type UpdateStoreFormData = yup.InferType<typeof updateStoreSchema>;
