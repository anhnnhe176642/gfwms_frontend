import * as yup from 'yup';

/**
 * Schema xác thực đăng nhập
 */
export const loginSchema = yup.object().shape({
  usernameOrEmail: yup
    .string()
    .required('Vui lòng nhập username hoặc email')
    .min(3, 'Username/email phải ít nhất 3 ký tự'),
  password: yup
    .string()
    .required('Vui lòng nhập mật khẩu')
    .min(6, 'Mật khẩu phải ít nhất 6 ký tự'),
});

/**
 * Schema xác thực đăng ký
 */
export const registerSchema = yup.object().shape({
  username: yup
    .string()
    .required('Vui lòng nhập username')
    .min(3, 'Username phải ít nhất 3 ký tự')
    .matches(
      /^[a-zA-Z0-9_]+$/,
      'Username chỉ chứa chữ cái, số và dấu gạch dưới'
    ),
  password: yup
    .string()
    .required('Vui lòng nhập mật khẩu')
    .min(6, 'Mật khẩu phải ít nhất 6 ký tự'),
  email: yup
    .string()
    .email('Email không hợp lệ')
    .required('Vui lòng nhập email'),
  phone: yup
    .string()
    .required('Vui lòng nhập số điện thoại')
    .matches(/^(\+84|0)[0-9]{9,10}$/, 'Số điện thoại không hợp lệ'),
  fullname: yup
    .string()
    .required('Vui lòng nhập họ tên'),
  gender: yup
    .string()
    .required('Vui lòng chọn giới tính')
    .oneOf(['MALE', 'FEMALE'], 'Giới tính không hợp lệ'),
  address: yup
    .string()
    .required('Vui lòng nhập địa chỉ'),
  dob: yup
    .string()
    .required('Vui lòng nhập ngày sinh')
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Ngày sinh phải có định dạng YYYY-MM-DD'),
});

/**
 * Schema xác thực yêu cầu đặt lại mật khẩu
 */
export const requestPasswordResetSchema = yup.object().shape({
  email: yup
    .string()
    .email('Email không hợp lệ')
    .required('Vui lòng nhập email'),
});

/**
 * Schema xác thực xác nhận PIN và đặt mật khẩu mới
 */
export const resetPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .email('Email không hợp lệ')
    .required('Vui lòng nhập email'),
  pin: yup
    .string()
    .required('Vui lòng nhập mã PIN')
    .length(6, 'Mã PIN phải là 6 ký tự'),
  newPassword: yup
    .string()
    .required('Vui lòng nhập mật khẩu mới')
    .min(6, 'Mật khẩu phải ít nhất 6 ký tự')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/,
      'Mật khẩu phải chứa ít nhất 1 chữ cái viết hoa, 1 chữ cái viết thường và 1 số'
    ),
});

/**
 * Schema xác thực đổi mật khẩu
 */
export const changePasswordSchema = yup.object().shape({
  currentPassword: yup
    .string()
    .required('Vui lòng nhập mật khẩu hiện tại'),
  newPassword: yup
    .string()
    .required('Vui lòng nhập mật khẩu mới')
    .min(6, 'Mật khẩu phải ít nhất 6 ký tự')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/,
      'Mật khẩu phải chứa ít nhất 1 chữ cái viết hoa, 1 chữ cái viết thường và 1 số'
    )
    .notOneOf(
      [yup.ref('currentPassword')],
      'Mật khẩu mới không được trùng với mật khẩu hiện tại'
    ),
  confirmPassword: yup
    .string()
    .required('Vui lòng nhập lại mật khẩu')
    .oneOf([yup.ref('newPassword')], 'Mật khẩu không khớp'),
});

/**
 * Schema xác thực email xác minh
 */
export const verifyEmailSchema = yup.object().shape({
  email: yup
    .string()
    .email('Email không hợp lệ')
    .required('Vui lòng nhập email'),
  pin: yup
    .string()
    .required('Vui lòng nhập mã PIN')
    .length(6, 'Mã PIN phải là 6 ký tự'),
});

// Export types từ schema
export type LoginFormData = yup.InferType<typeof loginSchema>;
export type RegisterFormData = yup.InferType<typeof registerSchema>;
export type RequestPasswordResetData = yup.InferType<typeof requestPasswordResetSchema>;
export type ResetPasswordData = yup.InferType<typeof resetPasswordSchema>;
export type ChangePasswordData = yup.InferType<typeof changePasswordSchema>;
export type VerifyEmailData = yup.InferType<typeof verifyEmailSchema>;
