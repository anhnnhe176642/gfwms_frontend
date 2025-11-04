import type { UserStatus, UserGender } from '@/types/user';
import { createEnumConfig, configToOptions } from '@/lib/configFactory';

/**
 * User status configurations
 * Using generic factory for better reusability
 */
export const USER_STATUS_CONFIG = createEnumConfig<UserStatus>({
  ACTIVE: {
    label: 'Hoạt động',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  },
  INACTIVE: {
    label: 'Không hoạt động',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  },
  SUSPENDED: {
    label: 'Bị cấm',
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  },
});

/**
 * User gender configurations
 * Using generic factory for better reusability
 */
export const USER_GENDER_CONFIG = createEnumConfig<UserGender>({
  MALE: { label: 'Nam', className: '' },
  FEMALE: { label: 'Nữ', className: '' },
});

/**
 * Array of status options for filters/selects
 */
export const USER_STATUS_OPTIONS = configToOptions(USER_STATUS_CONFIG);

/**
 * Array of gender options for filters/selects
 */
export const USER_GENDER_OPTIONS = configToOptions(USER_GENDER_CONFIG);
