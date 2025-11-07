import * as yup from 'yup';

/**
 * Schema xác thực tạo nhà cung cấp mới
 */
export const createSupplierSchema = yup.object().shape({
  name: yup
    .string()
    .required('Tên nhà cung cấp là bắt buộc')
    .min(1, 'Tên nhà cung cấp không được rỗng')
    .max(255, 'Tên nhà cung cấp không được vượt quá 255 ký tự'),
  address: yup
    .string()
    .required('Địa chỉ là bắt buộc')
    .min(1, 'Địa chỉ không được rỗng')
    .max(500, 'Địa chỉ không được vượt quá 500 ký tự'),
  phone: yup
    .string()
    .required('Số điện thoại là bắt buộc')
    .matches(/^[0-9]{10,11}$/, 'Số điện thoại phải có 10-11 chữ số'),
});

export type CreateSupplierFormData = yup.InferType<typeof createSupplierSchema>;

/**
 * Schema xác thực cập nhật nhà cung cấp
 */
export const updateSupplierSchema = yup.object().shape({
  name: yup
    .string()
    .required('Tên nhà cung cấp là bắt buộc')
    .min(1, 'Tên nhà cung cấp không được rỗng')
    .max(255, 'Tên nhà cung cấp không được vượt quá 255 ký tự'),
  address: yup
    .string()
    .required('Địa chỉ là bắt buộc')
    .min(1, 'Địa chỉ không được rỗng')
    .max(500, 'Địa chỉ không được vượt quá 500 ký tự'),
  phone: yup
    .string()
    .required('Số điện thoại là bắt buộc')
    .matches(/^[0-9]{10,11}$/, 'Số điện thoại phải có 10-11 chữ số'),
  isActive: yup
    .boolean()
    .required('Trạng thái là bắt buộc'),
});

export type UpdateSupplierFormData = yup.InferType<typeof updateSupplierSchema>;
