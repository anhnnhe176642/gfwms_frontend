import * as yup from 'yup';

/**
 * Schema xác thực tạo kệ mới
 */
export const createShelfSchema = yup.object().shape({
  code: yup
    .string()
    .required('Mã kệ là bắt buộc')
    .min(2, 'Mã kệ phải ít nhất 2 ký tự')
    .max(50, 'Mã kệ không được vượt quá 50 ký tự'),
  maxQuantity: yup
    .number()
    .typeError('Sức chứa tối đa phải là số')
    .required('Sức chứa tối đa là bắt buộc')
    .positive('Sức chứa tối đa phải là số dương')
    .integer('Sức chứa tối đa phải là số nguyên')
    .min(1, 'Sức chứa tối đa phải ít nhất 1')
    .max(1000, 'Sức chứa tối đa không được vượt quá 1000'),
});

export type CreateShelfFormData = yup.InferType<typeof createShelfSchema>;

/**
 * Schema xác thực cập nhật kệ
 */
export const updateShelfSchema = yup.object().shape({
  code: yup
    .string()
    .required('Mã kệ là bắt buộc')
    .min(2, 'Mã kệ phải ít nhất 2 ký tự')
    .max(50, 'Mã kệ không được vượt quá 50 ký tự'),
  maxQuantity: yup
    .number()
    .typeError('Sức chứa tối đa phải là số')
    .required('Sức chứa tối đa là bắt buộc')
    .positive('Sức chứa tối đa phải là số dương')
    .integer('Sức chứa tối đa phải là số nguyên')
    .min(1, 'Sức chứa tối đa phải ít nhất 1')
    .max(1000, 'Sức chứa tối đa không được vượt quá 1000'),
});

export type UpdateShelfFormData = yup.InferType<typeof updateShelfSchema>;
