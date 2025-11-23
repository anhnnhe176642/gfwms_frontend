import type { BadgeConfig } from '@/components/ui/badge';
import type { DatasetStatus, DatasetImageStatus } from '@/types/yolo-dataset';

export const DATASET_STATUS_CONFIG: Record<DatasetStatus, BadgeConfig<DatasetStatus>> = {
  ACTIVE: {
    label: 'Hoạt động',
    value: 'ACTIVE',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  ARCHIVED: {
    label: 'Lưu trữ',
    value: 'ARCHIVED',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  },
};

export const IMAGE_STATUS_CONFIG: Record<DatasetImageStatus, BadgeConfig<DatasetImageStatus>> = {
  PENDING: {
    label: 'Chờ xử lý',
    value: 'PENDING',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  PROCESSING: {
    label: 'Đang xử lý',
    value: 'PROCESSING',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  },
  COMPLETED: {
    label: 'Hoàn thành',
    value: 'COMPLETED',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  FAILED: {
    label: 'Thất bại',
    value: 'FAILED',
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
};
