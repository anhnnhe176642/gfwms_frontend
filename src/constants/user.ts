import type { UserStatus, UserRole, UserGender } from '@/types/user';
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
 * User role configurations
 * Using generic factory for better reusability
 */
export const USER_ROLE_CONFIG = createEnumConfig<UserRole>({
  ADMIN: {
    label: 'Quản trị viên',
    className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  },
  MANAGER: {
    label: 'Quản lý',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  },
  USER: {
    label: 'Người dùng',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  },
});

/**
 * User gender configurations
 * Using generic factory for better reusability
 */
export const USER_GENDER_CONFIG = createEnumConfig<UserGender>({
  MALE: { label: 'Nam', className: '' },
  FEMALE: { label: 'Nữ', className: '' },
  OTHER: { label: 'Khác', className: '' },
});

/**
 * Array of status options for filters/selects
 */
export const USER_STATUS_OPTIONS = configToOptions(USER_STATUS_CONFIG);

/**
 * Array of role options for filters/selects
 */
export const USER_ROLE_OPTIONS = configToOptions(USER_ROLE_CONFIG);

/**
 * Array of gender options for filters/selects
 */
export const USER_GENDER_OPTIONS = configToOptions(USER_GENDER_CONFIG);
