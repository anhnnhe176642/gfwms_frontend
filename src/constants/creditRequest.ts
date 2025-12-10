import type { CreditRequestStatus, CreditRequestType } from '@/types/creditRequest';
import { createEnumConfig, configToOptions } from '@/lib/configFactory';

/**
 * Credit Request status configurations
 */
export const CREDIT_REQUEST_STATUS_CONFIG = createEnumConfig<CreditRequestStatus>({
  PENDING: {
    label: 'Chờ xử lý',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  },
  APPROVED: {
    label: 'Đã duyệt',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  },
  REJECTED: {
    label: 'Bị từ chối',
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  },
});

/**
 * Credit Request type configurations
 */
export const CREDIT_REQUEST_TYPE_CONFIG = createEnumConfig<CreditRequestType>({
  INITIAL: {
    label: 'Đăng ký ban đầu',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  },
  INCREASE: {
    label: 'Tăng hạn mức',
    className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  },
});

/**
 * Array of status options for filters/selects
 */
export const CREDIT_REQUEST_STATUS_OPTIONS = configToOptions(CREDIT_REQUEST_STATUS_CONFIG);

/**
 * Array of type options for filters/selects
 */
export const CREDIT_REQUEST_TYPE_OPTIONS = configToOptions(CREDIT_REQUEST_TYPE_CONFIG);
