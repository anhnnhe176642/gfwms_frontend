import type { WarehouseStatus } from '@/types/warehouse';
import { createEnumConfig, configToOptions } from '@/lib/configFactory';

/**
 * Warehouse status configurations
 */
export const WAREHOUSE_STATUS_CONFIG = createEnumConfig<WarehouseStatus>({
  ACTIVE: {
    label: 'Hoạt động',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  },
  INACTIVE: {
    label: 'Không hoạt động',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  },
});

/**
 * Array of status options for filters/selects
 */
export const WAREHOUSE_STATUS_OPTIONS = configToOptions(WAREHOUSE_STATUS_CONFIG);
