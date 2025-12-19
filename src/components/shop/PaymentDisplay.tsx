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

interface PaymentDisplayProps {
  invoiceId: number | string;
  paymentAmount: number;
  deadline: string;
  qrCodeUrl?: string;
  qrCodeBase64?: string;
  accountName?: string;
  invoiceStatus?: string;
  creditAmount?: number;
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

interface BankTransferInfo extends QRData {
  accountName?: string;
}

export default function PaymentDisplay({
  invoiceId,
  paymentAmount,
  deadline,
  qrCodeUrl,
  qrCodeBase64,
  accountName,
  invoiceStatus,
  creditAmount,
  onPaymentSuccess,
}: PaymentDisplayProps) {
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusResponse | null>(null);
  const [isPolling, setIsPolling] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [qrData, setQrData] = useState<BankTransferInfo | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const { clearCart } = useCartStore();
  const { clearSelectedStore } = useCartCheckoutStore();

  // Decode QR code URL to extract payment information
  useEffect(() => {
    if (!qrCodeUrl) return;

    try {
      const parsedData = decodeVietQR(qrCodeUrl);
      console.log('Decoded VietQR data:', parsedData);

      if (parsedData && Object.keys(parsedData).length > 0) {
        const data: BankTransferInfo = {};

        if (parsedData.amount) {
          data.amount = parsedData.amount;
        } else {
          data.amount = paymentAmount;
        }

        if (parsedData.description) {
          data.description = String(parsedData.description);
        } else {
          data.description = `Thanh toán hoá đơn #${invoiceId}`;
        }

        if (parsedData.bankBeneficiary) {
          data.bankBeneficiary = String(parsedData.bankBeneficiary);
        }

        if (parsedData.bankAccount) {
          data.bankAccount = String(parsedData.bankAccount);
        }

        if (parsedData.bankCode) {
          data.bankCode = String(parsedData.bankCode);
        }

        data.accountName = accountName;

        setQrData(data);
        console.log('Parsed QR data:', data);
      } else {
        setQrData({
          amount: paymentAmount,
          description: `Thanh toán hoá đơn #${invoiceId}`,
          accountName,
        });
      }
    } catch (error) {
      console.error('Lỗi decode QR code:', error);
      setQrData({
        amount: paymentAmount,
        description: `Thanh toán hoá đơn #${invoiceId}`,
        accountName,
      });
    }
  }, [qrCodeUrl, paymentAmount, invoiceId, accountName]);

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

    // Check if deadline has expired
    const deadlineDate = new Date(deadline);
    const isDeadlinePassed = new Date() > deadlineDate;

    if (isDeadlinePassed) {
      toast.error('Hết hạn thanh toán. Vui lòng tạo đơn hàng mới.');
      setIsPolling(false);
      return;
    }

    const pollPaymentStatus = async () => {
      // Re-check deadline before each poll
      const currentDeadlineDate = new Date(deadline);
      if (new Date() > currentDeadlineDate) {
        toast.error('Hết hạn thanh toán. Vui lòng tạo đơn hàng mới.');
        setIsPolling(false);
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
        return;
      }

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

          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }

          if (onPaymentSuccess) {
            onPaymentSuccess();
          } else {
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

    pollPaymentStatus();
    pollingIntervalRef.current = setInterval(pollPaymentStatus, 3000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [isPolling, invoiceId, deadline, onPaymentSuccess, router, clearCart, clearSelectedStore]);

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

  // Check if this is a pure CREDIT payment (no QR code needed)
  const isPureCreditPayment = invoiceStatus === 'CREDIT' && (!qrCodeUrl && !qrCodeBase64);
  
  // Check if this is a mixed payment (partial credit + partial payment)
  const isMixedPayment = invoiceStatus === 'CREDIT' && (qrCodeUrl || qrCodeBase64);

  // Render mixed payment (credit + QR code) info
  if (isMixedPayment) {
    return (
      <Card className="w-full border-orange-200/50 bg-linear-to-br from-orange-50 to-transparent dark:from-orange-950/30 dark:to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-orange-500" />
              <div>
                <CardTitle>Thanh toán hỗn hợp (Ghi nợ + QR Code)</CardTitle>
                <CardDescription>Hoá đơn #{invoiceId}</CardDescription>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-orange-600">
                {paymentAmount ? paymentAmount.toLocaleString('vi-VN') : '0'} ₫
              </p>
              <p className="text-xs text-muted-foreground">Cần thanh toán ngay</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Credit and Payment Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Ghi nợ</p>
              <p className="text-2xl font-bold text-green-600">
                {creditAmount ? creditAmount.toLocaleString('vi-VN') : '0'} ₫
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Thanh toán vào cuối tháng
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Cần thanh toán ngay</p>
              <p className="text-2xl font-bold text-blue-600">
                {paymentAmount ? paymentAmount.toLocaleString('vi-VN') : '0'} ₫
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Quét mã QR bên dưới
              </p>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-lg mb-4">Thanh toán QR Code</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* QR Code */}
              <div className="lg:col-span-2 flex flex-col items-center justify-start gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm w-full max-w-sm">
                  {qrCodeBase64 ? (
                    <img
                      src={qrCodeBase64}
                      alt="Payment QR Code"
                      className="w-full h-auto object-contain"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-gray-100 rounded flex items-center justify-center">
                      <p className="text-muted-foreground">Đang tải mã QR...</p>
                    </div>
                  )}
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  Quét mã bằng ứng dụng ngân hàng của bạn để thanh toán {paymentAmount ? paymentAmount.toLocaleString('vi-VN') : '0'} ₫
                </p>
              </div>

              {/* Transfer Info */}
              <div className="space-y-3">
                <p className="text-sm font-semibold">Thông tin chuyển khoản:</p>
                {qrData && (
                  <>
                    {qrData.bankBeneficiary && (
                      <div>
                        <p className="text-xs text-muted-foreground">Tên tài khoản</p>
                        <div className="flex items-center justify-between gap-2 mt-1">
                          <p className="text-sm font-medium">{qrData.bankBeneficiary}</p>
                          <button
                            onClick={() => copyToClipboard(qrData.bankBeneficiary || '', 'bankBeneficiary')}
                            className="text-xs hover:text-primary transition-colors"
                          >
                            {copiedField === 'bankBeneficiary' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    )}
                    {qrData.bankAccount && (
                      <div>
                        <p className="text-xs text-muted-foreground">Số tài khoản</p>
                        <div className="flex items-center justify-between gap-2 mt-1">
                          <p className="text-sm font-medium font-mono">{qrData.bankAccount}</p>
                          <button
                            onClick={() => copyToClipboard(qrData.bankAccount || '', 'bankAccount')}
                            className="text-xs hover:text-primary transition-colors"
                          >
                            {copiedField === 'bankAccount' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    )}
                    {qrData.description && (
                      <div>
                        <p className="text-xs text-muted-foreground">Nội dung</p>
                        <div className="flex items-center justify-between gap-2 mt-1">
                          <p className="text-sm font-medium wrap-break-word">{qrData.description}</p>
                          <button
                            onClick={() => copyToClipboard(qrData.description || '', 'description')}
                            className="text-xs hover:text-primary transition-colors shrink-0"
                          >
                            {copiedField === 'description' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <p className="text-sm text-orange-800 dark:text-orange-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                Hạn mức công nợ của bạn không đủ. Vui lòng thanh toán {paymentAmount ? paymentAmount.toLocaleString('vi-VN') : '0'} ₫ trong {timeRemaining} để hoàn thành đơn hàng. Số tiền còn lại sẽ được ghi nợ.
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render pure CREDIT payment info
  if (isPureCreditPayment) {
    return (
      <Card className="w-full border-green-200/50 bg-linear-to-br from-green-50 to-transparent dark:from-green-950/30 dark:to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <CardTitle>Đơn hàng ghi nợ</CardTitle>
                <CardDescription>Hoá đơn #{invoiceId}</CardDescription>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                {creditAmount ? creditAmount.toLocaleString('vi-VN') : '0'} ₫
              </p>
              <p className="text-xs text-muted-foreground">Ghi nợ</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-lg">Thông tin ghi nợ</h3>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Số tiền ghi nợ</p>
                <p className="text-2xl font-bold text-green-600">
                  {creditAmount ? creditAmount.toLocaleString('vi-VN') : '0'} ₫
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Thời hạn thanh toán</p>
                <p className="text-lg font-semibold">
                  {deadline ? new Date(deadline).toLocaleDateString('vi-VN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : 'Không xác định'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  (Cuối cùng của tháng)
                </p>
              </div>

              <div className="border-t border-green-200 dark:border-green-800 pt-4">
                <p className="text-sm font-semibold mb-2">Hướng dẫn thanh toán</p>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>✓ Đơn hàng của bạn đã được xác nhận</li>
                  <li>✓ Vui lòng thanh toán trước ngày cuối cùng của tháng</li>
                  <li>✓ Bạn sẽ nhận được thông báo nhắc nợ trước hạn</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button className="flex-1" onClick={() => {
              clearCart();
              clearSelectedStore();
              if (onPaymentSuccess) {
                onPaymentSuccess();
              } else {
                router.push('/shop');
              }
            }}>
              Tiếp tục mua sắm
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => {
              router.push(`/shop/order/${invoiceId}`);
            }}>
              Xem đơn hàng
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Original QR Code payment rendering
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
        {/* Split Layout: QR Code 2/3, Transfer Info 1/3 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: QR Code (2/3) */}
          <div className="lg:col-span-2 flex flex-col items-center justify-start gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm w-full max-w-sm">
              {qrCodeBase64 ? (
                <img
                  src={qrCodeBase64}
                  alt="Payment QR Code"
                  className="w-full h-auto object-contain"
                />
              ) : (
                <div className="w-full aspect-square bg-gray-100 rounded flex items-center justify-center">
                  <p className="text-muted-foreground">Đang tải mã QR...</p>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4 w-full text-sm">
              <p className="font-semibold mb-2 text-blue-900 dark:text-blue-100">Hướng dẫn:</p>
              <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-200 text-xs">
                <li>Mở ứng dụng ngân hàng</li>
                <li>Chọn "Quét mã QR"</li>
                <li>Quét mã bên trái</li>
                <li>Xác nhận và thanh toán</li>
              </ol>
            </div>
          </div>

          {/* RIGHT: Transfer Information */}
          <div className="space-y-4">
            {/* Amount */}
            <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/30">
              <p className="text-sm text-muted-foreground mb-2">Số tiền cần chuyển</p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-2xl font-bold text-primary">
                  {qrData?.amount ? qrData.amount.toLocaleString('vi-VN') : paymentAmount.toLocaleString('vi-VN')} ₫
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    copyToClipboard(
                      (qrData?.amount || paymentAmount).toString(),
                      'amount'
                    )
                  }
                >
                  {copiedField === 'amount' ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Bank Info Grid */}
            <div className="space-y-3">
              {/* Bank Name */}
              {qrData?.bankBeneficiary && (
                <div className="border rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Ngân hàng thụ hưởng</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm">{qrData.bankBeneficiary}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(qrData.bankBeneficiary!, 'bank')}
                    >
                      {copiedField === 'bank' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Account Holder */}
              {(qrData?.accountName || accountName) && (
                <div className="border rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Chủ tài khoản</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm">{qrData?.accountName || accountName}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(qrData?.accountName || accountName!, 'accountName')}
                    >
                      {copiedField === 'accountName' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Account Number */}
              {qrData?.bankAccount && (
                <div className="border rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Số tài khoản</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono font-semibold text-sm">{qrData.bankAccount}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(qrData.bankAccount!, 'account')}
                    >
                      {copiedField === 'account' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Content */}
              {qrData?.description && (
                <div className="border rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Nội dung chuyển khoản</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm break-all">{qrData.description}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 shrink-0"
                      onClick={() => copyToClipboard(qrData.description!, 'description')}
                    >
                      {copiedField === 'description' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Note */}
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-xs text-blue-800 dark:text-blue-200">
              <p>
                <span className="font-semibold">Lưu ý:</span> Vui lòng nhập chính xác nội dung để hệ thống tự động xác nhận.
              </p>
            </div>
          </div>
        </div>

        {/* Status Section - Full Width */}
        <div className="border-t pt-6 space-y-3">
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
        </div>
      </CardContent>
    </Card>
  );
}
