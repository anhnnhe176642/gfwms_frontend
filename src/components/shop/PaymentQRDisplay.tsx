'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, CheckCircle, AlertCircle, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { invoiceService } from '@/services/invoice.service';
import { useCartStore } from '@/store/useCartStore';
import { useCartCheckoutStore } from '@/store/useCartCheckoutStore';
import type { PaymentStatusResponse } from '@/types/payment';
import { decodeVietQR } from '@/lib/vietqr-parser';

interface PaymentQRDisplayProps {
  invoiceId: number | string;
  paymentAmount: number;
  deadline: string;
  qrCodeUrl: string;
  qrCodeBase64: string;
  onPaymentSuccess?: () => void;
}

interface QRData {
  bankBeneficiary?: string;
  bankCode?: string;
  bankAccount?: string;
  amount?: number;
  description?: string;
  transactionId?: string;
}

export default function PaymentQRDisplay({
  invoiceId,
  paymentAmount,
  deadline,
  qrCodeUrl,
  qrCodeBase64,
  onPaymentSuccess,
}: PaymentQRDisplayProps) {
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusResponse | null>(null);
  const [isPolling, setIsPolling] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const { clearCart } = useCartStore();
  const { clearSelectedStore } = useCartCheckoutStore();

  // Decode QR code URL to extract payment information
  useEffect(() => {
    if (!qrCodeUrl) return;

    try {
      // Use custom VietQR decoder
      const parsedData = decodeVietQR(qrCodeUrl);
      console.log('Decoded VietQR data:', parsedData);

      if (parsedData && Object.keys(parsedData).length > 0) {
        const data: QRData = {};

        // Extract amount
        if (parsedData.amount) {
          data.amount = parsedData.amount;
        } else {
          data.amount = paymentAmount;
        }

        // Extract description/content
        if (parsedData.description) {
          data.description = String(parsedData.description);
        } else {
          data.description = `Thanh toán hoá đơn #${invoiceId}`;
        }

        // Extract bank beneficiary if available
        if (parsedData.bankBeneficiary) {
          data.bankBeneficiary = String(parsedData.bankBeneficiary);
        }

        // Extract account number
        if (parsedData.bankAccount) {
          data.bankAccount = String(parsedData.bankAccount);
        }

        // Extract bank code
        if (parsedData.bankCode) {
          data.bankCode = String(parsedData.bankCode);
        }

        setQrData(data);
        console.log('Parsed QR data:', data);
      } else {
        // Fallback if parsing fails
        setQrData({
          amount: paymentAmount,
          description: `Thanh toán hoá đơn #${invoiceId}`,
        });
      }
    } catch (error) {
      console.error('Lỗi decode QR code:', error);
      // Fallback
      setQrData({
        amount: paymentAmount,
        description: `Thanh toán hoá đơn #${invoiceId}`,
      });
    }
  }, [qrCodeUrl, paymentAmount, invoiceId]);

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
    setTimeRemaining(formatTimeRemaining(deadline));

    countdownRef.current = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(deadline));
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [deadline]);

  // Poll payment status
  useEffect(() => {
    if (!isPolling || !invoiceId) return;

    const pollPaymentStatus = async () => {
      try {
        const status = await invoiceService.getPaymentStatus(invoiceId);

        if (!status) {
          console.error('Không nhận được trạng thái thanh toán từ API');
          return;
        }
        setPaymentStatus(status);

        if (status.status === 'SUCCESS') {
          toast.success('Thanh toán thành công!');
          setIsPolling(false);
          clearCart();
          clearSelectedStore();

          // Stop polling
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }

          // Callback or redirect
          if (onPaymentSuccess) {
            onPaymentSuccess();
          } else {
            // Redirect to success page after 2 seconds
            setTimeout(() => {
              router.push(`/shop/order/${invoiceId}`);
            }, 2000);
          }
        } else if (status.status === 'EXPIRED') {
          toast.error('Hết hạn thanh toán. Vui lòng tạo đơn hàng mới.');
          setIsPolling(false);
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }
        } else if (status.status === 'FAILED') {
          toast.error('Thanh toán thất bại. Vui lòng thử lại.');
          setIsPolling(false);
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }
        }
      } catch (error) {
        console.error('Lỗi kiểm tra trạng thái thanh toán:', error);
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
  }, [isPolling, invoiceId, onPaymentSuccess, router, clearCart, clearSelectedStore]);

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

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <Card className="w-full border-primary/20 bg-linear-to-br from-blue-50 to-transparent dark:from-blue-950/30 dark:to-transparent">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <CardTitle>Thanh toán QR Code</CardTitle>
              <CardDescription>Hoá đơn #{invoiceId}</CardDescription>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">
              {paymentAmount ? paymentAmount.toLocaleString('vi-VN') : '0'} ₫
            </p>
            <p className="text-xs text-muted-foreground">
              Thời gian: <span className="font-semibold text-orange-600">{timeRemaining}</span>
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* QR Code Display */}
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            {qrCodeBase64 ? (
              <img
                src={qrCodeBase64}
                alt="Payment QR Code"
                className="w-64 h-64 object-contain"
              />
            ) : (
              <div className="w-64 h-64 bg-gray-100 rounded flex items-center justify-center">
                <p className="text-muted-foreground">Đang tải mã QR...</p>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4 w-full text-sm">
            <p className="font-semibold mb-2 text-blue-900 dark:text-blue-100">Hướng dẫn thanh toán:</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-200">
              <li>Mở ứng dụng ngân hàng trên điện thoại</li>
              <li>Chọn chức năng "Quét mã QR" hoặc "Chuyển tiền bằng QR"</li>
              <li>Quét mã QR bên trên</li>
              <li>Xác nhận thông tin và hoàn tất thanh toán</li>
            </ol>
          </div>
        </div>

        {/* Status Messages */}
        <div className="space-y-2">
          <p className="text-center text-lg font-semibold">{getStatusText()}</p>

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

          {!paymentStatus && (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm text-blue-700 dark:text-blue-300">
              Đang kiểm tra trạng thái thanh toán...
            </div>
          )}
        </div>

        {/* Payment Status Details */}
        {paymentStatus && (
          <div className="text-xs text-muted-foreground space-y-1 bg-muted/30 rounded p-3">
            <p>
              <span className="font-semibold">Trạng thái:</span> {paymentStatus.status}
            </p>
            {paymentStatus.paymentDate && (
              <p>
                <span className="font-semibold">Ngày thanh toán:</span>{' '}
                {new Date(paymentStatus.paymentDate).toLocaleString('vi-VN')}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
