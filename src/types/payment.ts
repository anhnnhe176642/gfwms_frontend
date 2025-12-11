export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentType {
  CASH = 'CASH',
  CREDIT = 'CREDIT',
}

export type PaymentQRResponse = {
  paymentId: number;
  invoiceId: number;
  paymentUrl: string;
  qrCodeUrl: string;
  qrCodeBase64: string;
  amount: number;
  currency: string;
  expiresAt: string;
  accountName?: string;
  bankName?: string;
  bankAccount?: string;
};

export type PaymentStatusResponse = {
  invoiceId: number;
  paymentId: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED' | 'REFUNDED';
  amount: number;
  paymentDate?: string;
  payOSStatus?: string;
  transactionId?: string;
};

export type PaymentInfo = {
  invoiceId: number;
  paymentId: number;
  paymentUrl: string;
  qrCodeBase64: string;
  amount: number;
  deadline: string;
  status: PaymentStatus;
};
