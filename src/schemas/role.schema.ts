import * as yup from 'yup';

/**
 * Schema xác thực tạo role mới
 * permissions: Mảng các permission keys (strings)
 */
export const createRoleSchema = yup.object().shape({
  name: yup
    .string()
    .default('')
    .min(0, 'Tên vai trò phải ít nhất 2 ký tự')
    .max(100, 'Tên vai trò không được quá 100 ký tự'),
  fullName: yup
    .string()
    .required('Tên đầy đủ là bắt buộc')
    .min(2, 'Tên đầy đủ phải ít nhất 2 ký tự')
    .max(200, 'Tên đầy đủ không được quá 200 ký tự'),
  description: yup
    .string()
    .required('Mô tả là bắt buộc')
    .min(5, 'Mô tả phải ít nhất 5 ký tự')
    .max(500, 'Mô tả không được quá 500 ký tự'),
  permissions: yup
    .array()
    .of(yup.string().required())
    .required('Vui lòng chọn ít nhất một quyền')
    .min(1, 'Vui lòng chọn ít nhất một quyền'),
});

export type CreateRoleFormData = yup.InferType<typeof createRoleSchema>;

/**
 * Schema xác thực cập nhật role
 * permissions: Mảng các permission keys (strings)
 */
export const updateRoleSchema = yup.object().shape({
  name: yup
    .string()
    .default('')
    .min(0, 'Tên vai trò phải ít nhất 2 ký tự')
    .max(100, 'Tên vai trò không được quá 100 ký tự'),
  fullName: yup
    .string()
    .required('Tên đầy đủ là bắt buộc')
    .min(2, 'Tên đầy đủ phải ít nhất 2 ký tự')
    .max(200, 'Tên đầy đủ không được quá 200 ký tự'),
  description: yup
    .string()
    .required('Mô tả là bắt buộc')
    .min(5, 'Mô tả phải ít nhất 5 ký tự')
    .max(500, 'Mô tả không được quá 500 ký tự'),
  permissions: yup
    .array()
    .of(yup.string().required())
    .required('Vui lòng chọn ít nhất một quyền')
    .min(1, 'Vui lòng chọn ít nhất một quyền'),
});

export type UpdateRoleFormData = yup.InferType<typeof updateRoleSchema>;
