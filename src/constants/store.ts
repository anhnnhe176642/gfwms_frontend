import { createEnumConfig, configToOptions } from '@/lib/configFactory';

/**
 * Store isActive status configurations
 */
export const STORE_ACTIVE_STATUS_CONFIG = createEnumConfig<'true' | 'false'>({
  true: {
    label: 'Hoạt động',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  },
  false: {
    label: 'Không hoạt động',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  },
});

/**
 * Array of status options for filters/selects
 */
export const STORE_ACTIVE_STATUS_OPTIONS = configToOptions(STORE_ACTIVE_STATUS_CONFIG);
