import type { BadgeConfig } from '@/components/ui/badge';
import type { DatasetStatus } from '@/types/yolo-dataset';

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
