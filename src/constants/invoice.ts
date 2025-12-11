import type { InvoiceStatus } from '@/types/invoice';

export const INVOICE_STATUS_OPTIONS: { value: InvoiceStatus; label: string }[] = [
  { value: 'PAID', label: 'Đã thanh toán' },
  { value: 'UNPAID', label: 'Chưa thanh toán' },
  { value: 'OVERDUE', label: 'Quá hạn' },
  { value: 'CREDIT', label: 'Công nợ' },
  { value: 'REFUNDED', label: 'Đã hoàn tiền' },
  { value: 'CANCELED', label: 'Đã hủy' },
];

export const INVOICE_STATUS_CONFIG: Record<InvoiceStatus, { label: string; className: string }> = {
  PAID: {
    label: 'Đã thanh toán',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  },
  UNPAID: {
    label: 'Chưa thanh toán',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  },
  OVERDUE: {
    label: 'Quá hạn',
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  },
  CREDIT: {
    label: 'Công nợ',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  },
  REFUNDED: {
    label: 'Đã hoàn tiền',
    className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  },
  CANCELED: {
    label: 'Đã hủy',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  },
};

export const getInvoiceStatusLabel = (status: InvoiceStatus): string => {
  return INVOICE_STATUS_OPTIONS.find((opt) => opt.value === status)?.label || status;
};
