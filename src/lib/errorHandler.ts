/**
 * Backend error response types
 */
export interface BackendFieldError {
  field: string;
  message: string;
}

export interface BackendValidationError {
  message: string;
  errors: BackendFieldError[];
}

export interface BackendError {
  message: string;
  errors?: BackendFieldError[];
}

/**
 * Extract field errors from backend response
 * 
 * Backend response format:
 * {
 *   "message": "Email đã được sử dụng",
 *   "errors": [
 *     { "field": "email", "message": "Email đã được sử dụng" }
 *   ]
 * }
 * 
 * If errors array exists, extract field-level errors
 * Otherwise, field errors will be empty (message only)
 */
export const extractFieldErrors = (error: unknown): Record<string, string> => {
  const fieldErrors: Record<string, string> = {};

  try {
    // Check if it's an axios error with response data
    const errorObj = error as { response?: { data?: unknown } };
    const response = errorObj?.response?.data;

    if (!response) {
      return fieldErrors;
    }

    // Check if there's an errors array with field details
    const responseData = response as { errors?: unknown };
    if (responseData.errors && Array.isArray(responseData.errors) && responseData.errors.length > 0) {
      responseData.errors.forEach((err: unknown) => {
        const errorItem = err as BackendFieldError;
        if (errorItem.field && errorItem.message) {
          fieldErrors[errorItem.field] = errorItem.message;
        }
      });
    }

    return fieldErrors;
  } catch {
    return fieldErrors;
  }
};

/**
 * Get server error message from backend response
 * 
 * Always checks for "message" field first (luôn có message được trả về)
 * This works for:
 * - Validation errors (400): "Email đã được sử dụng"
 * - Conflict errors (409): "Email đã được sử dụng"
 * - Any error with a message field
 */
export const getServerErrorMessage = (error: unknown): string | null => {
  try {
    const errorObj = error as { response?: { data?: unknown } };
    const response = errorObj?.response?.data;

    // Always return message if it exists
    const responseData = response as { message?: unknown };
    if (responseData?.message && typeof responseData.message === 'string') {
      return responseData.message;
    }

    return null;
  } catch {
    return null;
  }
};

/**
 * Get HTTP status code from error
 */
export const getErrorStatus = (error: unknown): number | null => {
  const errorObj = error as { response?: { status?: unknown } };
  return (errorObj?.response?.status as number) || null;
};

const errorHandlerExports = {
  extractFieldErrors,
  getServerErrorMessage,
  getErrorStatus,
};

export default errorHandlerExports;
