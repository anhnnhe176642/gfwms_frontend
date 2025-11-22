import { useState, useCallback } from 'react';
import * as yup from 'yup';

interface FormErrors {
  [key: string]: string;
}

/**
 * Custom hook để xử lý form validation với Yup
 * @param schema - Yup schema để xác thực
 * @param onSubmit - Callback khi form hợp lệ
 * @returns Object chứa form state, handlers, và utilities
 */
export const useFormValidation = <T extends Record<string, unknown>>(
  schema: yup.Schema<unknown>,
  onSubmit: (values: T) => Promise<void> | void
) => {
  // Initialize values with schema defaults
  const getInitialValues = useCallback(() => {
    try {
      return schema.cast({}) as T;
    } catch {
      return {} as T;
    }
  }, [schema]);

  const [values, setValues] = useState<T>(getInitialValues());
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Xác thực toàn bộ form
   */
  const validateForm = useCallback(async (formValues: T): Promise<boolean> => {
    try {
      await schema.validate(formValues, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const newErrors: FormErrors = {};
        const touchedFields: Record<string, boolean> = {};
        err.inner.forEach((error) => {
          if (error.path) {
            newErrors[error.path] = error.message;
            touchedFields[error.path] = true;
          }
        });
        setErrors(newErrors);
        setTouched((prev) => ({ ...prev, ...touchedFields }));
      }
      return false;
    }
  }, [schema]);

  /**
   * Xác thực một field
   */
  const validateField = useCallback(
    async (name: string, value: unknown): Promise<string | undefined> => {
      try {
        await schema.validateAt(name, { [name]: value });
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
        return undefined;
      } catch (err) {
        if (err instanceof yup.ValidationError) {
          const errorMessage = err.message;
          setErrors((prev) => ({
            ...prev,
            [name]: errorMessage,
          }));
          return errorMessage;
        }
      }
    },
    [schema]
  );

  /**
   * Handle change event
   */
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const fieldValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

      setValues((prev) => ({
        ...prev,
        [name]: fieldValue,
      }));

      // Validate field nếu đã touch
      if (touched[name]) {
        validateField(name, fieldValue);
      }
    },
    [touched, validateField]
  );

  /**
   * Handle blur event
   */
  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setTouched((prev) => ({
        ...prev,
        [name]: true,
      }));
      validateField(name, value);
    },
    [validateField]
  );

  /**
   * Handle form submit
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsLoading(true);

      const isValid = await validateForm(values);
      if (isValid) {
        try {
          await onSubmit(values);
        } catch (err) {
          console.error('Form submission error:', err);
        }
      }
      setIsLoading(false);
    },
    [values, validateForm, onSubmit]
  );

  /**
   * Reset form
   */
  const resetForm = useCallback((initialValues?: T) => {
    setValues(initialValues || ({} as T));
    setErrors({});
    setTouched({});
  }, []);

  /**
   * Set field value (programmatic)
   */
  const setFieldValue = useCallback((name: string, value: unknown) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  /**
   * Set field error
   */
  const setFieldError = useCallback((name: string, error: string) => {
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  }, []);

  /**
   * Set multiple field errors at once (for backend validation errors)
   */
  const setFieldErrors = useCallback((fieldErrors: Record<string, string>) => {
    setErrors((prev) => ({
      ...prev,
      ...fieldErrors,
    }));
    // Also mark all fields as touched so errors are displayed
    setTouched((prev) => {
      const allTouched = { ...prev };
      Object.keys(fieldErrors).forEach((field) => {
        allTouched[field] = true;
      });
      return allTouched;
    });
  }, []);

  return {
    values,
    errors,
    touched,
    isLoading,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError,
    setFieldErrors,
    setErrors,
    setTouched,
    validateForm,
    validateField,
  };
};

export default useFormValidation;
