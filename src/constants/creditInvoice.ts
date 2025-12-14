import type { BadgeConfig } from '@/components/ui/badge';
import type { CreditInvoiceStatus } from '@/types/creditInvoice';

export const CREDIT_INVOICE_STATUS_CONFIG: Record<CreditInvoiceStatus, BadgeConfig<CreditInvoiceStatus>> = {
  PENDING: {
    value: 'PENDING',
    label: 'Chờ thanh toán',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  },
  PAID: {
    value: 'PAID',
    label: 'Đã thanh toán',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  },
  OVERDUE: {
    value: 'OVERDUE',
    label: 'Quá hạn',
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  },
  PARTIALLY_PAID: {
    value: 'PARTIALLY_PAID',
    label: 'Thanh toán một phần',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  },
  CANCELED: {
    value: 'CANCELED',
    label: 'Đã hủy',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  },
};
