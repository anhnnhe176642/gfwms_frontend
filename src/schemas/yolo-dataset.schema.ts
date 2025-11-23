import * as yup from 'yup';

/**
 * Schema xác thực tạo dataset mới
 */
export const createDatasetSchema = yup.object().shape({
  name: yup
    .string()
    .required('Tên dataset là bắt buộc')
    .min(3, 'Tên dataset phải ít nhất 3 ký tự')
    .max(255, 'Tên dataset không được vượt quá 255 ký tự')
    .matches(/^[a-zA-Z0-9_-]+$/, 'Tên dataset chỉ được chứa chữ, số, gạch dưới (_) và gạch ngang (-)'),
  description: yup
    .string()
    .optional()
    .default('')
    .max(1000, 'Mô tả không được vượt quá 1000 ký tự'),
  classes: yup
    .array()
    .of(
      yup
        .string()
        .required('Tên lớp là bắt buộc')
        .trim()
        .min(2, 'Tên lớp phải ít nhất 2 ký tự')
        .max(100, 'Tên lớp không được vượt quá 100 ký tự')
        .matches(/^[a-zA-Z0-9_-]+$/, 'Tên lớp chỉ được chứa chữ, số, gạch dưới (_) và gạch ngang (-)')
    )
    .required('Ít nhất phải có một lớp')
    .min(1, 'Ít nhất phải có một lớp')
    .max(50, 'Không được vượt quá 50 lớp')
    .default([]),
});

export type CreateDatasetFormData = yup.InferType<typeof createDatasetSchema>;

/**
 * Schema xác thực cập nhật dataset
 */
export const updateDatasetSchema = yup.object().shape({
  name: yup
    .string()
    .required('Tên dataset là bắt buộc')
    .min(3, 'Tên dataset phải ít nhất 3 ký tự')
    .max(255, 'Tên dataset không được vượt quá 255 ký tự')
    .matches(/^[a-zA-Z0-9_-]+$/, 'Tên dataset chỉ được chứa chữ, số, gạch dưới (_) và gạch ngang (-)'),
  description: yup
    .string()
    .optional()
    .default('')
    .max(1000, 'Mô tả không được vượt quá 1000 ký tự'),
  status: yup
    .string()
    .optional()
    .oneOf(['DRAFT', 'ACTIVE', 'ARCHIVED'], 'Trạng thái không hợp lệ'),
  classes: yup
    .array()
    .of(
      yup
        .string()
        .required('Tên lớp là bắt buộc')
        .trim()
        .min(2, 'Tên lớp phải ít nhất 2 ký tự')
        .max(100, 'Tên lớp không được vượt quá 100 ký tự')
        .matches(/^[a-zA-Z0-9_-]+$/, 'Tên lớp chỉ được chứa chữ, số, gạch dưới (_) và gạch ngang (-)')
    )
    .optional()
    .min(0, 'Không được vượt quá 0 lớp')
    .max(50, 'Không được vượt quá 50 lớp')
    .default([]),
});

export type UpdateDatasetFormData = yup.InferType<typeof updateDatasetSchema>;
