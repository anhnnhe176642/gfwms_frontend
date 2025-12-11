import * as yup from 'yup';
import type { AdjustmentType } from '@/types/warehouse';

export const adjustFabricSchema = yup.object().shape({
  importId: yup
    .number()
    .required('Vui lòng chọn lô nhập')
    .min(1, 'ID lô nhập không hợp lệ'),
  quantity: yup
    .number()
    .required('Vui lòng nhập số lượng')
    .positive('Số lượng phải lớn hơn 0')
    .typeError('Số lượng phải là số'),
  type: yup
    .mixed<AdjustmentType>()
    .oneOf(['IMPORT', 'DESTROY'], 'Loại điều chỉnh không hợp lệ')
    .required('Vui lòng chọn loại điều chỉnh'),
  reason: yup
    .string()
    .required('Vui lòng nhập lý do điều chỉnh')
    .min(5, 'Lý do phải ít nhất 5 ký tự')
    .max(500, 'Lý do không được vượt quá 500 ký tự'),
});

export type AdjustFabricFormData = yup.InferType<typeof adjustFabricSchema>;
