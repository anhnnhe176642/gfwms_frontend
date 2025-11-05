import * as yup from 'yup';

/**
 * Schema xác thực tạo warehouse mới
 */
export const createWarehouseSchema = yup.object().shape({
  name: yup
    .string()
    .required('Tên kho là bắt buộc')
    .min(3, 'Tên kho phải ít nhất 3 ký tự')
    .max(255, 'Tên kho không được vượt quá 255 ký tự'),
  address: yup
    .string()
    .required('Địa chỉ là bắt buộc')
    .min(5, 'Địa chỉ phải ít nhất 5 ký tự')
    .max(500, 'Địa chỉ không được vượt quá 500 ký tự'),
});

export type CreateWarehouseFormData = yup.InferType<typeof createWarehouseSchema>;

/**
 * Schema xác thực cập nhật warehouse
 */
export const updateWarehouseSchema = yup.object().shape({
  name: yup
    .string()
    .required('Tên kho là bắt buộc')
    .min(3, 'Tên kho phải ít nhất 2 ký tự')
    .max(255, 'Tên kho không được vượt quá 255 ký tự'),
  address: yup
    .string()
    .required('Địa chỉ là bắt buộc')
    .min(5, 'Địa chỉ phải ít nhất 5 ký tự')
    .max(500, 'Địa chỉ không được vượt quá 500 ký tự'),
  status: yup
    .string()
    .required('Trạng thái là bắt buộc')
    .oneOf(['ACTIVE', 'INACTIVE'], 'Trạng thái không hợp lệ'),
});

export type UpdateWarehouseFormData = yup.InferType<typeof updateWarehouseSchema>;
