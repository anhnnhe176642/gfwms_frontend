import * as yup from 'yup';

/**
 * Schema xác thực tạo user mới
 */
export const createUserSchema = yup.object().shape({
  username: yup
    .string()
    .required('Username là bắt buộc')
    .min(3, 'Username phải ít nhất 3 ký tự')
    .matches(
      /^[a-zA-Z0-9_]+$/,
      'Username chỉ chứa chữ cái, số và dấu gạch dưới'
    ),
  password: yup
    .string()
    .required('Password là bắt buộc')
    .min(6, 'Password phải ít nhất 6 ký tự'),
  email: yup
    .string()
    .email('Email không hợp lệ')
    .required('Email là bắt buộc'),
  phone: yup
    .string()
    .required('Số điện thoại là bắt buộc')
    .matches(/^(\+84|0)[0-9]{9,10}$/, 'Số điện thoại không hợp lệ'),
  fullname: yup
    .string()
    .typeError('Họ tên phải là chuỗi'),
  gender: yup
    .string()
    .oneOf(['', 'MALE', 'FEMALE'], 'Giới tính không hợp lệ'),
  address: yup
    .string()
    .typeError('Địa chỉ phải là chuỗi'),
  dob: yup
    .string()
    .matches(/^$|^\d{4}-\d{2}-\d{2}$/, 'Ngày sinh phải có định dạng YYYY-MM-DD'),
  role: yup
    .string()
    .required('Role là bắt buộc'),
  status: yup
    .string()
    .required('Trạng thái là bắt buộc')
    .default('ACTIVE')
    .oneOf(['ACTIVE', 'INACTIVE', 'SUSPENDED'], 'Trạng thái không hợp lệ'),
});

export type CreateUserFormData = yup.InferType<typeof createUserSchema>;
