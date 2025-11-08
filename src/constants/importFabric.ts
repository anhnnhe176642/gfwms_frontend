import type { ImportFabricStatus } from '@/types/importFabric';
import { createEnumConfig, configToOptions } from '@/lib/configFactory';

/**
 * Import Fabric status configurations
 */
export const IMPORT_FABRIC_STATUS_CONFIG = createEnumConfig<ImportFabricStatus>({
  PENDING: {
    label: 'Chờ xử lý',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  },
  COMPLETED: {
    label: 'Hoàn tất',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  },
  CANCELLED: {
    label: 'Hủy bỏ',
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  },
});

/**
 * Array of status options for filters/selects
 */
export const IMPORT_FABRIC_STATUS_OPTIONS = configToOptions(IMPORT_FABRIC_STATUS_CONFIG);
