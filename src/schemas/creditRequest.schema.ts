import * as yup from 'yup';

export const createCreditRequestSchema = yup.object({
  requestLimit: yup
    .number()
    .required('Hạn mức là bắt buộc')
    .positive('Hạn mức phải lớn hơn 0')
    .typeError('Hạn mức phải là số'),
  note: yup
    .string()
    .optional()
    .max(500, 'Ghi chú không được vượt quá 500 ký tự'),
});

export type CreateCreditRequestFormData = yup.InferType<typeof createCreditRequestSchema>;

export const creditRequestStatusSchema = yup.object({
  status: yup
    .string()
    .oneOf(['APPROVED', 'REJECTED'] as const, 'Trạng thái không hợp lệ')
    .required('Trạng thái là bắt buộc'),
});

export type CreditRequestStatusFormData = yup.InferType<typeof creditRequestStatusSchema>;
