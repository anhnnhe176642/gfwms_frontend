import * as yup from 'yup';

/**
 * Schema xác thực mục nhập kho
 * String fields for form input (will be converted to numbers on submit)
 */
export const importFabricItemSchema = yup.object().shape({
  thickness: yup
    .string()
    .required('Độ dày là bắt buộc')
    .test('is-positive-number', 'Độ dày phải là số dương', (value) => {
      if (!value) return false;
      const num = parseFloat(value);
      return !isNaN(num) && num > 0;
    }),
  glossId: yup
    .string()
    .required('Độ bóng là bắt buộc')
    .test('is-positive-number', 'Độ bóng không hợp lệ', (value) => {
      if (!value) return false;
      const num = parseInt(value);
      return !isNaN(num) && num > 0;
    }),
  length: yup
    .string()
    .required('Chiều dài là bắt buộc')
    .test('is-positive-number', 'Chiều dài phải là số dương', (value) => {
      if (!value) return false;
      const num = parseFloat(value);
      return !isNaN(num) && num > 0;
    }),
  width: yup
    .string()
    .required('Chiều rộng là bắt buộc')
    .test('is-positive-number', 'Chiều rộng phải là số dương', (value) => {
      if (!value) return false;
      const num = parseFloat(value);
      return !isNaN(num) && num > 0;
    }),
  weight: yup
    .string()
    .required('Trọng lượng là bắt buộc')
    .test('is-positive-number', 'Trọng lượng phải là số dương', (value) => {
      if (!value) return false;
      const num = parseFloat(value);
      return !isNaN(num) && num > 0;
    }),
  categoryId: yup
    .string()
    .required('Loại vải là bắt buộc')
    .test('is-positive-number', 'Loại vải không hợp lệ', (value) => {
      if (!value) return false;
      const num = parseInt(value);
      return !isNaN(num) && num > 0;
    }),
  colorId: yup
    .string()
    .required('Màu sắc là bắt buộc'),
  supplierId: yup
    .string()
    .required('Nhà cung cấp là bắt buộc')
    .test('is-positive-number', 'Nhà cung cấp không hợp lệ', (value) => {
      if (!value) return false;
      const num = parseInt(value);
      return !isNaN(num) && num > 0;
    }),
  quantity: yup
    .string()
    .required('Số lượng là bắt buộc')
    .test('is-positive-integer', 'Số lượng phải là số nguyên dương', (value) => {
      if (!value) return false;
      const num = parseInt(value);
      return !isNaN(num) && num > 0 && Number.isInteger(num);
    }),
  price: yup
    .string()
    .required('Giá là bắt buộc')
    .test('is-positive-number', 'Giá phải là số dương', (value) => {
      if (!value) return false;
      const num = parseFloat(value);
      return !isNaN(num) && num > 0;
    }),
});

export type CreateImportFabricItemFormData = yup.InferType<typeof importFabricItemSchema>;

/**
 * Schema xác thực tạo đơn nhập kho
 */
export const createImportFabricSchema = yup.object().shape({
  items: yup
    .array()
    .of(importFabricItemSchema)
    .required('Phải có ít nhất một mục nhập')
    .min(1, 'Phải có ít nhất một mục nhập')
    .default([
      {
        thickness: '',
        glossId: '',
        length: '',
        width: '',
        weight: '',
        categoryId: '',
        colorId: '',
        supplierId: '',
        quantity: '',
        price: '',
      },
    ]),
  signatureImage: yup
    .mixed<File>()
    .nullable()
    .optional()
    .test('fileSize', 'Ảnh chữ ký phải nhỏ hơn 10MB', (file) => {
      if (!file) return true;
      return file instanceof File && file.size <= 10 * 1024 * 1024;
    })
    .test('fileType', 'Định dạng ảnh không hợp lệ (JPEG, PNG, GIF, WEBP)', (file) => {
      if (!file) return true;
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      return file instanceof File && validTypes.includes(file.type);
    }),
});

export type CreateImportFabricFormData = yup.InferType<typeof createImportFabricSchema>;
