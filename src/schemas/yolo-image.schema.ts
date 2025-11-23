import * as yup from 'yup';

export const updateImageStatusSchema = yup.object().shape({
  status: yup
    .string()
    .oneOf(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'])
    .required('Trạng thái là bắt buộc'),
  notes: yup.string().optional(),
});

export type UpdateImageStatusFormData = yup.InferType<typeof updateImageStatusSchema>;

export const updateImageNotesSchema = yup.object().shape({
  notes: yup.string().required('Ghi chú là bắt buộc'),
});

export type UpdateImageNotesFormData = yup.InferType<typeof updateImageNotesSchema>;
