import * as yup from 'yup';

/**
 * Schema xác thực tạo role mới
 */
export const createRoleSchema = yup.object().shape({
  name: yup
    .string()
    .required('Tên vai trò là bắt buộc')
    .min(2, 'Tên vai trò phải ít nhất 2 ký tự')
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
    .of(yup.number().required())
    .required('Vui lòng chọn ít nhất một quyền')
    .min(1, 'Vui lòng chọn ít nhất một quyền'),
});

export type CreateRoleFormData = yup.InferType<typeof createRoleSchema>;

/**
 * Schema xác thực cập nhật role
 */
export const updateRoleSchema = yup.object().shape({
  name: yup.string().default(''),
  fullName: yup
    .string()
    .default('')
    .typeError('Tên đầy đủ phải là chuỗi'),
  description: yup
    .string()
    .default('')
    .typeError('Mô tả phải là chuỗi'),
  permissions: yup
    .array()
    .of(yup.number().required())
    .required('Vui lòng chọn ít nhất một quyền')
    .min(1, 'Vui lòng chọn ít nhất một quyền'),
});

export type UpdateRoleFormData = yup.InferType<typeof updateRoleSchema>;
