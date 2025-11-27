import type { ExportFabricStatus } from '@/types/exportFabric';
import { createEnumConfig, configToOptions } from '@/lib/configFactory';

/**
 * Export Fabric status configurations
 */
export const EXPORT_FABRIC_STATUS_CONFIG = createEnumConfig<ExportFabricStatus>({
  PENDING: {
    label: 'Chờ xử lý',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  },
  APPROVED: {
    label: 'Phê duyệt',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  },
  REJECTED: {
    label: 'Từ chối',
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  },
});

/**
 * Array of status options for filters/selects
 */
export const EXPORT_FABRIC_STATUS_OPTIONS = configToOptions(EXPORT_FABRIC_STATUS_CONFIG);
