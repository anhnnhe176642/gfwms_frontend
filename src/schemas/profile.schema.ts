import * as yup from 'yup';
import type { InferType } from 'yup';

/**
 * Schema cho Update Profile
 */
export const updateProfileSchema = yup.object({
  fullname: yup
    .string()
    .max(100, 'Họ tên không được vượt quá 100 ký tự')
    .optional()
    .nullable(),
  
  phone: yup
    .string()
    .matches(/^[0-9+\-\s()]+$/, 'Số điện thoại không hợp lệ')
    .min(10, 'Số điện thoại phải có ít nhất 10 ký tự')
    .max(15, 'Số điện thoại không được vượt quá 15 ký tự')
    .optional()
    .nullable(),
  
  gender: yup
    .string()
    .oneOf(['MALE', 'FEMALE'], 'Giới tính phải là MALE hoặc FEMALE')
    .optional()
    .nullable(),
  
  address: yup
    .string()
    .max(255, 'Địa chỉ không được vượt quá 255 ký tự')
    .optional()
    .nullable(),
  
  dob: yup
    .date()
    .max(new Date(), 'Ngày sinh không được lớn hơn ngày hiện tại')
    .optional()
    .nullable()
    .transform((value, originalValue) => {
      // Handle empty string
      if (originalValue === '' || originalValue === null) return null;
      return value;
    }),
});

export type UpdateProfileFormData = InferType<typeof updateProfileSchema>;

/**
 * Schema cho Change Password
 */
export const changePasswordSchema = yup.object({
  currentPassword: yup
    .string()
    .required('Password hiện tại là bắt buộc')
    .min(6, 'Password phải có ít nhất 6 ký tự')
    .max(255, 'Password không được vượt quá 255 ký tự'),
  
  newPassword: yup
    .string()
    .required('Password mới là bắt buộc')
    .min(6, 'Password mới phải có ít nhất 6 ký tự')
    .max(255, 'Password mới không được vượt quá 255 ký tự')
    .test(
      'different-from-current',
      'Password mới phải khác password hiện tại',
      function(value) {
        return value !== this.parent.currentPassword;
      }
    ),
  
  confirmPassword: yup
    .string()
    .required('Xác nhận password là bắt buộc')
    .oneOf([yup.ref('newPassword')], 'Password xác nhận không khớp'),
});

export type ChangePasswordFormData = InferType<typeof changePasswordSchema>;

/**
 * Client-side validation cho avatar upload
 */
export const validateAvatarFile = (file: File): string | null => {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (!file) {
    return 'Avatar file là bắt buộc';
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WEBP)';
  }

  if (file.size > MAX_SIZE) {
    return 'Kích thước file không được vượt quá 5MB';
  }

  return null;
};
