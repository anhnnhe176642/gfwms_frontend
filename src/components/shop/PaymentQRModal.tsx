'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { X, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { invoiceService } from '@/services/invoice.service';
import { useCartStore } from '@/store/useCartStore';
import { useCartCheckoutStore } from '@/store/useCartCheckoutStore';
import type { PaymentStatusResponse } from '@/types/payment';

interface PaymentQRModalProps {
  isOpen: boolean;
  invoiceId: number | string;
  paymentAmount: number;
  deadline: string;
  qrCodeBase64: string;
  onClose: () => void;
}

export default function PaymentQRModal({
  isOpen,
  invoiceId,
  paymentAmount,
  deadline,
  qrCodeBase64,
  onClose,
}: PaymentQRModalProps) {
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusResponse | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const { clearCart } = useCartStore();
  const { clearSelectedStore } = useCartCheckoutStore();

  // Format remaining time
  const formatTimeRemaining = (deadlineStr: string) => {
    const deadline = new Date(deadlineStr).getTime();
    const now = new Date().getTime();
    const remaining = deadline - now;

    if (remaining <= 0) {
      return 'Hết hạn';
    }

    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  // Start countdown timer
  useEffect(() => {
    if (!isOpen) return;

    setTimeRemaining(formatTimeRemaining(deadline));

    countdownRef.current = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(deadline));
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [isOpen, deadline]);

  // Poll payment status
  useEffect(() => {
    if (!isOpen || !invoiceId) return;

    const pollPaymentStatus = async () => {
      try {
        setIsPolling(true);
        const status = await invoiceService.getPaymentStatus(invoiceId);
        
        if (!status) {
          console.error('Không nhận được trạng thái thanh toán từ API');
          return;
        }
        
        setPaymentStatus(status);

        if (status.status === 'SUCCESS') {
          toast.success('Thanh toán thành công!');
          clearCart();
          clearSelectedStore();

          // Stop polling
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }

          // Redirect to success page after 2 seconds
          setTimeout(() => {
            onClose();
            router.push(`/shop/order/${status.invoiceId}`);
          }, 2000);
        } else if (status.status === 'EXPIRED') {
          toast.error('Hết hạn thanh toán. Vui lòng tạo đơn hàng mới.');
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }
        } else if (status.status === 'FAILED') {
          toast.error('Thanh toán thất bại. Vui lòng thử lại.');
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }
        }
      } catch (error) {
        console.error('Lỗi kiểm tra trạng thái thanh toán:', error);
      } finally {
        setIsPolling(false);
      }
    };

    // Poll immediately
    pollPaymentStatus();

    // Then poll every 3 seconds
    pollingIntervalRef.current = setInterval(pollPaymentStatus, 3000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [isOpen, invoiceId, onClose, clearCart, clearSelectedStore, router]);

  const getStatusIcon = () => {
    if (!paymentStatus) {
      return <Clock className="w-8 h-8 text-blue-500 animate-spin" />;
    }

    switch (paymentStatus.status) {
      case 'SUCCESS':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'FAILED':
      case 'EXPIRED':
        return <AlertCircle className="w-8 h-8 text-red-500" />;
      default:
        return <Clock className="w-8 h-8 text-blue-500 animate-spin" />;
    }
  };

  const getStatusText = () => {
    if (!paymentStatus) {
      return 'Đang chờ thanh toán...';
    }

    switch (paymentStatus.status) {
      case 'SUCCESS':
        return 'Thanh toán thành công! 🎉';
      case 'FAILED':
        return 'Thanh toán thất bại';
      case 'EXPIRED':
        return 'Hết hạn thanh toán';
      default:
        return 'Đang chờ thanh toán...';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Thanh toán QR Code
          </DialogTitle>
          <DialogDescription>
            Hóa đơn #{invoiceId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* QR Code */}
          <div className="flex justify-center">
            {qrCodeBase64 && (
              <div className="relative w-64 h-64">
                <Image
                  src={qrCodeBase64}
                  alt="Payment QR Code"
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </div>

        {/* Payment Info */}
          <div className="space-y-2 text-center">
            <p className="text-3xl font-bold text-primary">
              {paymentAmount ? paymentAmount.toLocaleString('vi-VN') : '0'} ₫
            </p>
            <p className="text-sm text-gray-600">
              Thời gian còn lại: <span className="font-semibold">{timeRemaining}</span>
            </p>
            <p className="text-lg font-semibold">{getStatusText()}</p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm">
            <p className="font-semibold mb-2">Hướng dẫn:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>Mở ứng dụng ngân hàng</li>
              <li>Chọn quét mã QR</li>
              <li>Quét mã QR bên trên</li>
              <li>Xác nhận và hoàn tất thanh toán</li>
            </ol>
          </div>

          {/* Status Messages */}
          {paymentStatus?.status === 'FAILED' && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-300">
              Thanh toán thất bại. Vui lòng kiểm tra lại thông tin và thử lại.
            </div>
          )}

          {paymentStatus?.status === 'EXPIRED' && (
            <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-3 text-sm text-orange-700 dark:text-orange-300">
              Hết hạn thanh toán. Vui lòng tạo đơn hàng mới để thanh toán.
            </div>
          )}

          {/* Close Button */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isPolling}
            >
              Đóng
            </Button>
            {paymentStatus?.status === 'FAILED' && (
              <Button className="flex-1" onClick={() => window.location.reload()}>
                Thử lại
              </Button>
            )}
          </div>

          {/* Status Info */}
          {paymentStatus && (
            <div className="text-xs text-gray-500 space-y-1">
              <p>Trạng thái: {paymentStatus.status}</p>
              {paymentStatus.transactionId && (
                <p>Mã giao dịch: {paymentStatus.transactionId}</p>
              )}
              {paymentStatus.paymentDate && (
                <p>
                  Ngày thanh toán:{' '}
                  {new Date(paymentStatus.paymentDate).toLocaleString('vi-VN')}
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
