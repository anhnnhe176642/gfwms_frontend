import type { OrderStatus, PaymentType, SaleUnit } from '@/types/order';
import type { BadgeConfig } from '@/components/ui/badge';

export const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'PENDING', label: 'Chờ xử lý' },
  { value: 'PROCESSING', label: 'Đang xử lý' },
  { value: 'DELIVERED', label: 'Hoàn thành' },
  { value: 'CANCELED', label: 'Đã hủy' },
  { value: 'FAILED', label: 'Thất bại' },
];

export const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: {
    label: 'Chờ xử lý',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  },
  PROCESSING: {
    label: 'Đang xử lý',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  },
  DELIVERED: {
    label: 'Hoàn thành',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  },
  CANCELED: {
    label: 'Đã hủy',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  },
  FAILED: {
    label: 'Thất bại',
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  },
};

export const PAYMENT_TYPE_OPTIONS: { value: PaymentType; label: string }[] = [
  { value: 'CASH', label: 'Tiền mặt' },
  { value: 'CREDIT', label: 'Công nợ' },
];

export const PAYMENT_TYPE_CONFIG: Record<PaymentType, { label: string; className: string }> = {
  CASH: {
    label: 'Tiền mặt',
    className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  },
  CREDIT: {
    label: 'Công nợ',
    className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  },
};

export const IS_OFFLINE_OPTIONS: { value: string; label: string }[] = [
  { value: 'true', label: 'Offline' },
  { value: 'false', label: 'Online' },
];

export const SALE_UNIT_LABELS: Record<string, string> = {
  METER: 'Mét',
  ROLL: 'Cuộn',
};

export const SALE_UNIT_CONFIG: Record<SaleUnit, BadgeConfig<SaleUnit>> = {
  METER: {
    value: 'METER',
    label: 'Mét',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  },
  ROLL: {
    value: 'ROLL',
    label: 'Cuộn',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  },
};

export const getOrderStatusLabel = (status: OrderStatus): string => {
  return ORDER_STATUS_OPTIONS.find((opt) => opt.value === status)?.label || status;
};

export const getPaymentTypeLabel = (type: PaymentType): string => {
  return PAYMENT_TYPE_OPTIONS.find((opt) => opt.value === type)?.label || type;
};
