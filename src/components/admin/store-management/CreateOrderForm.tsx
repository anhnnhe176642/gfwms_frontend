'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCreateOrderStore } from '@/store/useCreateOrderStore';
import { orderService, type PaymentMethod } from '@/services/order.service';
import { invoiceService } from '@/services/invoice.service';
import { getServerErrorMessage, extractFieldErrors } from '@/lib/errorHandler';
import { cn } from '@/lib/utils';
import { ArrowLeft, Send, ShoppingCart, QrCode, Banknote, Copy, Check, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { decodeVietQR } from '@/lib/vietqr-parser';
import type { PaymentQRResponse, PaymentStatusResponse } from '@/types/payment';

export function CreateOrderForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  // QR Payment Modal State
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrData, setQrData] = useState<PaymentQRResponse | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusResponse | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [decodedQrInfo, setDecodedQrInfo] = useState<{
    bankBeneficiary?: string;
    bankAccount?: string;
    description?: string;
    bankCode?: string;
  } | null>(null);

  const {
    storeId,
    storeName,
    selectedItems,
    customerPhone,
    paymentType,
    paymentMethod,
    notes,
    goToStep1,
    setCustomerPhone,
    setPaymentType,
    setPaymentMethod,
    setNotes,
    getOrderData,
    reset,
    setIsSubmitting: setStoreIsSubmitting,
  } = useCreateOrderStore();

  if (!storeId) {
    return <div>Lỗi: Không tìm thấy cửa hàng</div>;
  }

  const handleGoBack = () => {
    goToStep1();
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setFieldErrors({});

    const orderData = getOrderData();
    if (!orderData) {
      toast.error('Dữ liệu đơn hàng không hợp lệ');
      return;
    }

    setIsSubmitting(true);
    setStoreIsSubmitting(true);

    try {
      const response = await orderService.createOfflineOrder(orderData);
      const result = response.data;

      if (paymentMethod === 'QR') {
        // QR Payment: Generate QR code and show modal
        const invoiceId = result.invoice?.id;
        if (!invoiceId) {
          toast.error('Không thể lấy ID hóa đơn');
          return;
        }

        try {
          const qrResponse = await invoiceService.createPaymentQR(invoiceId);
          setQrData(qrResponse);
          
          // Decode QR to get bank info
          try {
            const parsedData = decodeVietQR(qrResponse.qrCodeUrl);
            if (parsedData && Object.keys(parsedData).length > 0) {
              setDecodedQrInfo({
                bankBeneficiary: parsedData.bankBeneficiary ? String(parsedData.bankBeneficiary) : undefined,
                bankAccount: parsedData.bankAccount ? String(parsedData.bankAccount) : undefined,
                description: parsedData.description ? String(parsedData.description) : `Thanh toán hóa đơn #${invoiceId}`,
                bankCode: parsedData.bankCode ? String(parsedData.bankCode) : undefined,
              });
            }
          } catch (decodeErr) {
            console.error('Lỗi decode QR:', decodeErr);
          }

          setQrModalOpen(true);
          setTimeRemaining(formatTimeRemaining(qrResponse.expiresAt));
          startPaymentPolling(invoiceId, qrResponse.expiresAt);
          
          toast.success('Đã tạo đơn hàng, vui lòng thanh toán bằng QR');
        } catch (qrError) {
          console.error('Lỗi tạo QR:', qrError);
          toast.error('Không thể tạo mã QR. Đơn hàng đã được tạo.');
          // Still redirect to invoice
          reset();
          router.push(`/admin/invoices/${invoiceId}`);
        }
      } else {
        // DIRECT Payment: Immediate success
        toast.success('Tạo đơn hàng thành công');

        // Reset store and redirect to invoice detail or order detail
        reset();
        if (result.invoice) {
          router.push(`/admin/invoices/${result.invoice.id}`);
        } else {
          // Fallback to order detail page if invoice not created
          router.push(`/admin/orders/${result.id}`);
        }
      }
    } catch (error) {
      const errors = extractFieldErrors(error);
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
      }
      
      const message = getServerErrorMessage(error) || 'Không thể tạo đơn hàng';
      toast.error(message);
      console.error('Create order error:', error);
    } finally {
      setIsSubmitting(false);
      setStoreIsSubmitting(false);
    }
  };

  const startPaymentPolling = (invoiceId: number, expiresAt: string) => {
    setIsPolling(true);
    setPaymentStatus(null);

    const countdownInterval = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(expiresAt));
    }, 1000);

    const pollStatus = async () => {
      // Check deadline
      if (new Date() > new Date(expiresAt)) {
        clearInterval(countdownInterval);
        clearInterval(pollInterval);
        setIsPolling(false);
        toast.error('Hết hạn thanh toán');
        return;
      }

      try {
        const status = await invoiceService.getPaymentStatus(invoiceId);
        setPaymentStatus(status);

        if (status.status === 'SUCCESS') {
          clearInterval(countdownInterval);
          clearInterval(pollInterval);
          setIsPolling(false);
          toast.success('Thanh toán thành công!');
          
          // Redirect after 2 seconds
          setTimeout(() => {
            setQrModalOpen(false);
            reset();
            router.push(`/admin/invoices/${invoiceId}`);
          }, 2000);
        } else if (status.status === 'FAILED' || status.status === 'EXPIRED') {
          clearInterval(countdownInterval);
          clearInterval(pollInterval);
          setIsPolling(false);
          toast.error(status.status === 'FAILED' ? 'Thanh toán thất bại' : 'Hết hạn thanh toán');
        }
      } catch (err) {
        console.error('Lỗi kiểm tra trạng thái:', err);
      }
    };

    const pollInterval = setInterval(pollStatus, 3000);
    pollStatus(); // Initial check
  };

  const handleCloseQrModal = () => {
    setQrModalOpen(false);
    setIsPolling(false);
    setQrData(null);
    setPaymentStatus(null);
    setDecodedQrInfo(null);
    
    // Redirect to invoices list
    reset();
    router.push('/admin/invoices');
  };

  // Calculate summary
  const totalItems = selectedItems.size;
  const totalQuantity = Array.from(selectedItems.values()).reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleGoBack}
          disabled={isSubmitting}
          className="h-9 w-9"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tạo đơn hàng</h1>
          <p className="text-muted-foreground mt-1">
            {storeName} • {totalItems} loại vải • {totalQuantity.toLocaleString()} cái
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Form */}
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin đơn hàng</CardTitle>
              <CardDescription>
                Nhập thông tin khách hàng và phương thức thanh toán
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Customer Phone */}
                <div className="space-y-2">
                  <Label htmlFor="customerPhone" className="text-sm font-medium">
                    Số điện thoại khách
                  </Label>
                  <Input
                    id="customerPhone"
                    placeholder="0123456789"
                    value={customerPhone}
                    onChange={(e) => {
                      setCustomerPhone(e.target.value);
                      // Clear error when user starts typing
                      if (fieldErrors.customerPhone) {
                        setFieldErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.customerPhone;
                          return newErrors;
                        });
                      }
                    }}
                    type="tel"
                    disabled={isSubmitting}
                    className={fieldErrors.customerPhone ? 'border-destructive focus-visible:ring-destructive' : ''}
                  />
                  {fieldErrors.customerPhone && (
                    <p className="text-xs text-destructive">{fieldErrors.customerPhone}</p>
                  )}
                </div>

                {/* Payment Type */}
                <div className="space-y-2">
                  <Label htmlFor="paymentType" className="text-sm font-medium">
                    Phương thức thanh toán
                  </Label>
                  <Select
                    value={paymentType}
                    onValueChange={(value: any) => setPaymentType(value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="paymentType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">Tiền mặt</SelectItem>
                      <SelectItem value="CREDIT">Công nợ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Payment Method (only for CASH) */}
                {paymentType === 'CASH' && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Hình thức thanh toán
                    </Label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="DIRECT"
                          checked={paymentMethod === 'DIRECT'}
                          onChange={() => setPaymentMethod('DIRECT')}
                          disabled={isSubmitting}
                          className="h-4 w-4 text-primary"
                        />
                        <div className="flex items-center gap-1.5">
                          <Banknote className="h-4 w-4" />
                          <span className="text-sm">Tiền mặt</span>
                        </div>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="QR"
                          checked={paymentMethod === 'QR'}
                          onChange={() => setPaymentMethod('QR')}
                          disabled={isSubmitting}
                          className="h-4 w-4 text-primary"
                        />
                        <div className="flex items-center gap-1.5">
                          <QrCode className="h-4 w-4" />
                          <span className="text-sm">QR Code</span>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium">
                    Ghi chú (tuỳ chọn)
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Ghi chú thêm về đơn hàng..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoBack}
                    disabled={isSubmitting}
                  >
                    Quay lại
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="gap-2">
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Đang tạo...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Tạo đơn hàng
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShoppingCart className="h-5 w-5" />
                Tóm tắt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selected Items */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {Array.from(selectedItems.values()).map((item) => (
                  <div
                    key={item.fabricId}
                    className="pb-2 border-b text-sm last:border-b-0"
                  >
                    <div className="font-medium truncate">
                      {item.fabric.fabricInfo.category} ({item.fabric.fabricInfo.color})
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {item.quantity} {item.saleUnit === 'METER' ? 'meter' : 'roll'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span>Loại vải:</span>
                  <span className="font-medium">{totalItems}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tổng số lượng:</span>
                  <span className="font-medium">{totalQuantity.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span>Loại thanh toán:</span>
                  <span className="font-medium">
                    {paymentType === 'CASH' ? 'Tiền mặt' : 'Công nợ'}
                  </span>
                </div>
                {paymentType === 'CASH' && (
                  <div className="flex justify-between text-sm">
                    <span>Hình thức:</span>
                    <span className="font-medium flex items-center gap-1">
                      {paymentMethod === 'QR' ? (
                        <>
                          <QrCode className="h-3 w-3" />
                          QR Code
                        </>
                      ) : (
                        <>
                          <Banknote className="h-3 w-3" />
                          Tiền mặt
                        </>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* QR Payment Modal */}
      <Dialog open={qrModalOpen} onOpenChange={(open) => !open && handleCloseQrModal()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Thanh toán QR
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Payment Status */}
            {paymentStatus?.status === 'SUCCESS' ? (
              <div className="flex flex-col items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="h-12 w-12 text-green-600" />
                <p className="font-semibold text-green-700 dark:text-green-400">Thanh toán thành công!</p>
                <p className="text-sm text-muted-foreground">Đang chuyển hướng...</p>
              </div>
            ) : paymentStatus?.status === 'FAILED' || paymentStatus?.status === 'EXPIRED' ? (
              <div className="flex flex-col items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <AlertCircle className="h-12 w-12 text-red-600" />
                <p className="font-semibold text-red-700 dark:text-red-400">
                  {paymentStatus.status === 'FAILED' ? 'Thanh toán thất bại' : 'Hết hạn thanh toán'}
                </p>
              </div>
            ) : (
              <>
                {/* QR Code */}
                {qrData && (
                  <div className="flex flex-col items-center gap-3">
                    <div className="bg-white p-3 rounded-lg border">
                      <img
                        src={qrData.qrCodeBase64}
                        alt="QR Code"
                        className="w-48 h-48"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Còn lại: {timeRemaining}</span>
                    </div>
                    <p className="text-lg font-semibold">
                      {qrData.amount.toLocaleString()} VND
                    </p>
                  </div>
                )}

                {/* Bank Transfer Info */}
                {decodedQrInfo && (
                  <div className="space-y-2 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Thông tin chuyển khoản:</p>
                    {decodedQrInfo.bankBeneficiary && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Chủ TK:</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(decodedQrInfo.bankBeneficiary!, 'beneficiary')}
                          className="flex items-center gap-1 hover:text-primary"
                        >
                          <span className="font-medium">{decodedQrInfo.bankBeneficiary}</span>
                          {copiedField === 'beneficiary' ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    )}
                    {decodedQrInfo.bankAccount && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Số TK:</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(decodedQrInfo.bankAccount!, 'account')}
                          className="flex items-center gap-1 hover:text-primary"
                        >
                          <span className="font-medium">{decodedQrInfo.bankAccount}</span>
                          {copiedField === 'account' ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    )}
                    {decodedQrInfo.bankCode && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Ngân hàng:</span>
                        <span className="font-medium">{decodedQrInfo.bankCode}</span>
                      </div>
                    )}
                    {qrData && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Số tiền:</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(qrData.amount.toString(), 'amount')}
                          className="flex items-center gap-1 hover:text-primary"
                        >
                          <span className="font-medium">{qrData.amount.toLocaleString()} VND</span>
                          {copiedField === 'amount' ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    )}
                    {decodedQrInfo.description && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Nội dung:</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(decodedQrInfo.description!, 'description')}
                          className="flex items-center gap-1 hover:text-primary"
                        >
                          <span className="font-medium truncate max-w-[180px]">{decodedQrInfo.description}</span>
                          {copiedField === 'description' ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Polling indicator */}
                {isPolling && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span>Đang chờ thanh toán...</span>
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseQrModal}>
              {paymentStatus?.status === 'SUCCESS' ? 'Đóng' : 'Huỷ thanh toán'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreateOrderForm;
