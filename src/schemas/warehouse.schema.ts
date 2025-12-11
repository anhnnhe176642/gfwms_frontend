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
  latitude: yup
    .number()
    .required('Vĩ độ là bắt buộc')
    .min(-90, 'Vĩ độ phải từ -90 đến 90')
    .max(90, 'Vĩ độ phải từ -90 đến 90'),
  longitude: yup
    .number()
    .required('Kinh độ là bắt buộc')
    .min(-180, 'Kinh độ phải từ -180 đến 180')
    .max(180, 'Kinh độ phải từ -180 đến 180'),
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
  latitude: yup
    .number()
    .required('Vĩ độ là bắt buộc')
    .min(-90, 'Vĩ độ phải từ -90 đến 90')
    .max(90, 'Vĩ độ phải từ -90 đến 90'),
  longitude: yup
    .number()
    .required('Kinh độ là bắt buộc')
    .min(-180, 'Kinh độ phải từ -180 đến 180')
    .max(180, 'Kinh độ phải từ -180 đến 180'),
  status: yup
    .string()
    .required('Trạng thái là bắt buộc')
    .oneOf(['ACTIVE', 'INACTIVE'], 'Trạng thái không hợp lệ'),
});

export type UpdateWarehouseFormData = yup.InferType<typeof updateWarehouseSchema>;
