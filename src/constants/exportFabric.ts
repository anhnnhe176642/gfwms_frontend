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
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  },
  COMPLETED: {
    label: 'Hoàn thành',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  },
  REJECTED: {
    label: 'Từ chối',
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  },
  CANCELLED: {
    label: 'Hủy',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  },
});

/**
 * Array of status options for filters/selects
 */
export const EXPORT_FABRIC_STATUS_OPTIONS = configToOptions(EXPORT_FABRIC_STATUS_CONFIG);
