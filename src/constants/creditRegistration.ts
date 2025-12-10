import type { CreditRegistrationStatus } from '@/types/creditRegistration';
import { createEnumConfig, configToOptions } from '@/lib/configFactory';

/**
 * Credit Registration status configurations
 */
export const CREDIT_REGISTRATION_STATUS_CONFIG = createEnumConfig<CreditRegistrationStatus>({
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
 * Array of status options for filters/selects
 */
export const CREDIT_REGISTRATION_STATUS_OPTIONS = configToOptions(CREDIT_REGISTRATION_STATUS_CONFIG);

/**
 * Lock status options for filtering
 */
export const CREDIT_REGISTRATION_LOCK_STATUS_OPTIONS = [
  { label: 'Khóa', value: 'true' },
  { label: 'Mở', value: 'false' },
];
