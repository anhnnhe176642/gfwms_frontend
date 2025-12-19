'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/services/auth.service';
import { creditInvoiceService } from '@/services/creditInvoice.service';
import { CREDIT_REGISTRATION_STATUS_CONFIG } from '@/constants/creditRegistration';
import { CREDIT_INVOICE_STATUS_CONFIG } from '@/constants/creditInvoice';
import type { CreditRegistration } from '@/types/creditRegistration';
import type { CreditInvoiceListItem, CreditInvoiceListParams } from '@/types/creditInvoice';
import type { CreditInvoicePaymentQRResponse, QRData, PaymentStatusResponse } from '@/services/creditInvoice.service';
import { AlertCircle, TrendingDown, Calendar, Plus, Copy, Check, Loader2, CheckCircle, Clock } from 'lucide-react';
import { CreditRegistrationModal } from './CreditRegistrationModal';
import { IncreaseCreditsModal } from './IncreaseCreditsModal';
import { decodeVietQR } from '@/lib/vietqr-parser';
import { toast } from 'sonner';

export function DebtManagementTab() {
  const { user } = useAuth();
  const setUser = useAuthStore((state) => state.setUser);
  const creditRegistration = user?.creditRegistration as CreditRegistration | undefined;
  const [creditInvoices, setCreditInvoices] = useState<CreditInvoiceListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [increaseModalOpen, setIncreaseModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedCreditInvoice, setSelectedCreditInvoice] = useState<CreditInvoiceListItem | null>(null);
  const [paymentQRData, setPaymentQRData] = useState<CreditInvoicePaymentQRResponse | null>(null);
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusResponse | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch latest user info
        const authResponse = await authService.me();
        if (authResponse.user) {
          setUser(authResponse.user);
        }

        // Fetch credit invoices
        const response = await creditInvoiceService.getMyList({
          page: 1,
          limit: 20,
          order: 'desc',
        } as CreditInvoiceListParams);
        setCreditInvoices(response.data);
      } catch (err: any) {
        console.error('Lỗi tải thông tin:', err);
        setError('Không thể tải thông tin');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [setUser]);

  const handlePaymentClick = async (creditInvoice: CreditInvoiceListItem) => {
    setSelectedCreditInvoice(creditInvoice);
    setPaymentModalOpen(true);
    setIsGeneratingQR(true);
    setPaymentQRData(null);
    setQrData(null);
    setPaymentStatus(null);
    setIsPolling(false);

    try {
      const qrResponse = await creditInvoiceService.createPaymentQR(creditInvoice.id);
      setPaymentQRData(qrResponse);

      // Decode QR code URL to extract payment information
      try {
        const parsedData = decodeVietQR(qrResponse.qrCodeUrl);
        console.log('Decoded VietQR data:', parsedData);

        if (parsedData && Object.keys(parsedData).length > 0) {
          const decodedData: QRData = {};

          if (parsedData.amount) {
            decodedData.amount = parsedData.amount;
          } else {
            decodedData.amount = qrResponse.amount;
          }

          if (parsedData.description) {
            decodedData.description = String(parsedData.description);
          } else {
            decodedData.description = `Thanh toán công nợ #${creditInvoice.id}`;
          }

          if (parsedData.bankBeneficiary) {
            decodedData.bankBeneficiary = String(parsedData.bankBeneficiary);
          }

          if (parsedData.bankAccount) {
            decodedData.bankAccount = String(parsedData.bankAccount);
          }

          if (parsedData.bankCode) {
            decodedData.bankCode = String(parsedData.bankCode);
          }

          setQrData(decodedData);
          console.log('Parsed QR data:', decodedData);
        } else {
          setQrData({
            amount: qrResponse.amount,
            description: `Thanh toán công nợ #${creditInvoice.id}`,
          });
        }
      } catch (decodeErr) {
        console.error('Lỗi decode QR code:', decodeErr);
        setQrData({
          amount: qrResponse.amount,
          description: `Thanh toán công nợ #${creditInvoice.id}`,
        });
      }

      // Start polling payment status
      setIsPolling(true);
      setTimeRemaining(formatTimeRemaining(qrResponse.expiresAt));
    } catch (err: any) {
      console.error('Lỗi tạo mã QR:', err);
      toast.error('Không thể tạo mã QR. Vui lòng thử lại.');
      setPaymentModalOpen(false);
    } finally {
      setIsGeneratingQR(false);
    }
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

  // Start countdown timer
  useEffect(() => {
    if (!paymentQRData) return;

    setTimeRemaining(formatTimeRemaining(paymentQRData.expiresAt));

    countdownRef.current = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(paymentQRData.expiresAt));
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [paymentQRData]);

  // Poll payment status
  useEffect(() => {
    if (!isPolling || !selectedCreditInvoice || !paymentQRData) return;

    // Check if deadline has expired
    const deadlineDate = new Date(paymentQRData.expiresAt);
    const isDeadlinePassed = new Date() > deadlineDate;

    if (isDeadlinePassed) {
      toast.error('Hết hạn thanh toán. Vui lòng thực hiện thanh toán mới.');
      setIsPolling(false);
      return;
    }

    const pollPaymentStatus = async () => {
      // Re-check deadline before each poll
      const currentDeadlineDate = new Date(paymentQRData.expiresAt);
      if (new Date() > currentDeadlineDate) {
        toast.error('Hết hạn thanh toán. Vui lòng thực hiện thanh toán mới.');
        setIsPolling(false);
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
        return;
      }

      try {
        const status = await creditInvoiceService.getPaymentStatus(selectedCreditInvoice.id);
        console.log('Payment status response:', status);

        if (!status) {
          console.error('Không nhận được trạng thái thanh toán từ API');
          return;
        }
        setPaymentStatus(status);

        if (status.paymentStatus === 'SUCCESS') {
          toast.success('Thanh toán thành công!');
          setIsPolling(false);

          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }

          // Refresh user data and credit invoices list after 2 seconds
          setTimeout(async () => {
            try {
              // Fetch latest user info to update credit registration
              const authResponse = await authService.me();
              if (authResponse.user) {
                setUser(authResponse.user);
              }
            } catch (err) {
              console.error('Lỗi tải lại thông tin người dùng:', err);
            }

            try {
              // Fetch updated credit invoices
              const response = await creditInvoiceService.getMyList({
                page: 1,
                limit: 20,
                order: 'desc',
              } as CreditInvoiceListParams);
              setCreditInvoices(response.data);
            } catch (err) {
              console.error('Lỗi tải lại danh sách:', err);
            }
          }, 2000);
        } else if (status.paymentStatus === 'EXPIRED') {
          toast.error('Hết hạn thanh toán. Vui lòng thực hiện thanh toán mới.');
          setIsPolling(false);
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }
        } else if (status.paymentStatus === 'FAILED') {
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
  }, [isPolling, selectedCreditInvoice, paymentQRData]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!user) {
    return (
      <Card className="border-red-200 dark:border-red-900">
        <CardContent className="pt-6">
          <p className="text-red-600 dark:text-red-400">Vui lòng đăng nhập để xem thông tin công nợ</p>
        </CardContent>
      </Card>
    );
  }

  if (!creditRegistration) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle>Công nợ</CardTitle>
            <CardDescription>Thông tin công nợ của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12">
              <TrendingDown className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-6">Bạn chưa đăng ký công nợ</p>
              <Button onClick={() => setRegistrationModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Tạo đơn đăng ký hạn mức công nợ
              </Button>
            </div>
          </CardContent>
        </Card>
        <CreditRegistrationModal
          open={registrationModalOpen}
          onOpenChange={setRegistrationModalOpen}
        />
      </>
    );
  }

  const totalDebt = creditRegistration.creditUsed || 0;
  const totalLimit = creditRegistration.creditLimit || 0;
  const remaining = totalLimit - totalDebt;

  return (
    <>
      <div className="space-y-6">
        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Tổng quan công nợ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Hạn mức mong muốn</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                  {totalLimit.toLocaleString('vi-VN')} ₫
                </p>
              </div>
              <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Đã sử dụng</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">
                  {totalDebt.toLocaleString('vi-VN')} ₫
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Còn có thể sử dụng</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
                  {remaining.toLocaleString('vi-VN')} ₫
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credit List */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle>Chi tiết Hạn mức mong muốn</CardTitle>
                <CardDescription>Thông tin hạn mức công nợ của bạn</CardDescription>
              </div>
              <Button 
                onClick={() => setIncreaseModalOpen(true)}
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tăng hạn mức
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="font-medium">Hạn mức mong muốn #{creditRegistration.id}</p>
                  <p className="text-sm text-muted-foreground">
                    Ngày phê duyệt: {creditRegistration.approvalDate ? new Date(creditRegistration.approvalDate).toLocaleString('vi-VN') : 'N/A'}
                  </p>
                </div>
                {creditRegistration.status && (
                  <Badge value={creditRegistration.status as any} config={CREDIT_REGISTRATION_STATUS_CONFIG} />
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Hạn mức</p>
                  <p className="font-semibold text-blue-600 dark:text-blue-400">
                    {(creditRegistration.creditLimit || 0).toLocaleString('vi-VN')} ₫
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Đã sử dụng</p>
                  <p className="font-semibold text-red-600 dark:text-red-400">
                    {(creditRegistration.creditUsed || 0).toLocaleString('vi-VN')} ₫
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Còn lại</p>
                  <p className="font-semibold text-green-600 dark:text-green-400">
                    {((creditRegistration.creditLimit || 0) - (creditRegistration.creditUsed || 0)).toLocaleString('vi-VN')} ₫
                  </p>
                </div>
              </div>

              {creditRegistration.note && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
                  <p className="text-xs text-muted-foreground flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>Ghi chú: {creditRegistration.note}</span>
                  </p>
                </div>
              )}

              {creditRegistration.isLocked && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
                  <p className="text-xs text-orange-600 dark:text-orange-400 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>Hạn mức này đang bị khóa</span>
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Credit Invoices List */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách hóa đơn công nợ</CardTitle>
            <CardDescription>Các hóa đơn sử dụng công nợ theo tháng của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md p-4 mb-4">
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center py-8">
                <p className="text-muted-foreground">Đang tải...</p>
              </div>
            ) : creditInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <TrendingDown className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Bạn không có hóa đơn công nợ nào</p>
              </div>
            ) : (
              <div className="space-y-4">
                {creditInvoices.map((creditInvoice) => {
                  const statusConfig = CREDIT_INVOICE_STATUS_CONFIG[creditInvoice.status];
                  const invoiceRemaining = creditInvoice.totalCreditAmount - creditInvoice.creditPaidAmount;
                  return (
                    <div
                      key={creditInvoice.id}
                      className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-medium">Hóa đơn công nợ #{creditInvoice.id}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Calendar className="w-4 h-4" />
                            Hạn thanh toán: {new Date(creditInvoice.dueDate).toLocaleString('vi-VN')}
                          </div>
                        </div>
                        {statusConfig && (
                          <Badge value={creditInvoice.status} config={CREDIT_INVOICE_STATUS_CONFIG} />
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-muted-foreground">Tổng công nợ</p>
                          <p className="font-semibold text-blue-600 dark:text-blue-400">
                            {(creditInvoice.totalCreditAmount || 0).toLocaleString('vi-VN')} ₫
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Đã thanh toán</p>
                          <p className="font-semibold text-green-600 dark:text-green-400">
                            {(creditInvoice.creditPaidAmount || 0).toLocaleString('vi-VN')} ₫
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Còn phải trả</p>
                          <p className="font-semibold text-red-600 dark:text-red-400">
                            {invoiceRemaining.toLocaleString('vi-VN')} ₫
                          </p>
                        </div>
                      </div>

                      {/* Related Invoices */}
                      {creditInvoice.invoice && creditInvoice.invoice.length > 0 && (
                        <div className="pt-3 border-t border-gray-200 dark:border-slate-700">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Hóa đơn liên quan:</p>
                          <div className="space-y-1">
                            {creditInvoice.invoice.map((inv) => (
                              <div key={inv.id} className="text-xs text-muted-foreground flex justify-between">
                                <span>Hóa đơn #{inv.id} - Đơn hàng #{inv.orderId}</span>
                                <span className="font-medium">{inv.creditAmount.toLocaleString('vi-VN')} ₫</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Payment Button */}
                      {invoiceRemaining > 0 && (
                        <div className="pt-3 border-t border-gray-200 dark:border-slate-700">
                          <Button
                            size="sm"
                            onClick={() => handlePaymentClick(creditInvoice)}
                          >
                            Thanh toán
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CreditRegistrationModal
        open={registrationModalOpen}
        onOpenChange={setRegistrationModalOpen}
      />
      <IncreaseCreditsModal
        open={increaseModalOpen}
        onOpenChange={setIncreaseModalOpen}
        currentLimit={totalLimit}
      />

      {/* Payment QR Modal */}
      <Dialog 
        open={paymentModalOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setIsPolling(false);
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
            }
            if (countdownRef.current) {
              clearInterval(countdownRef.current);
            }
          }
          setPaymentModalOpen(open);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thanh toán công nợ</DialogTitle>
            <DialogDescription>
              Hóa đơn công nợ #{selectedCreditInvoice?.id}
            </DialogDescription>
          </DialogHeader>

          {isGeneratingQR ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2">Đang tạo mã QR...</span>
            </div>
          ) : paymentQRData ? (
            <div className="space-y-4">
              {/* Header with Amount */}
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Số tiền cần thanh toán</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {(paymentQRData.amount || 0).toLocaleString('vi-VN')} ₫
                </p>
              </div>

              {/* QR Code and Transfer Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* QR Code Section - Left */}
                <div className="flex flex-col items-center justify-start gap-3">
                  <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700 w-full">
                    {paymentQRData.qrCodeBase64 ? (
                      <img
                        src={paymentQRData.qrCodeBase64}
                        alt="Payment QR Code"
                        className="w-full h-auto object-contain"
                      />
                    ) : (
                      <div className="w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                        <p className="text-muted-foreground text-xs">Không thể hiển thị mã QR</p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-center text-muted-foreground">
                    Quét mã bằng ứng dụng ngân hàng
                  </p>
                </div>

                {/* Transfer Info - Right */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold">Thông tin chuyển khoản:</p>
                  {qrData && (
                    <>
                      {qrData.bankBeneficiary && (
                        <div>
                          <p className="text-xs text-muted-foreground">Tên tài khoản</p>
                          <div className="flex items-center justify-between gap-2 mt-0.5">
                            <p className="text-xs font-medium truncate">{qrData.bankBeneficiary}</p>
                            <button
                              onClick={() => copyToClipboard(qrData.bankBeneficiary || '', 'bankBeneficiary')}
                              className="text-xs hover:text-primary transition-colors shrink-0"
                            >
                              {copiedField === 'bankBeneficiary' ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                      {qrData.bankAccount && (
                        <div>
                          <p className="text-xs text-muted-foreground">Số tài khoản</p>
                          <div className="flex items-center justify-between gap-2 mt-0.5">
                            <p className="text-xs font-medium font-mono truncate">{qrData.bankAccount}</p>
                            <button
                              onClick={() => copyToClipboard(qrData.bankAccount || '', 'bankAccount')}
                              className="text-xs hover:text-primary transition-colors shrink-0"
                            >
                              {copiedField === 'bankAccount' ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                      {qrData.description && (
                        <div>
                          <p className="text-xs text-muted-foreground">Nội dung</p>
                          <div className="flex items-start justify-between gap-2 mt-0.5">
                            <p className="text-xs font-medium line-clamp-2">{qrData.description}</p>
                            <button
                              onClick={() => copyToClipboard(qrData.description || '', 'description')}
                              className="text-xs hover:text-primary transition-colors shrink-0 mt-0.5"
                            >
                              {copiedField === 'description' ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                      {qrData.bankCode && (
                        <div>
                          <p className="text-xs text-muted-foreground">Mã ngân hàng</p>
                          <p className="text-xs font-medium font-mono mt-0.5">{qrData.bankCode}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Payment Details */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                <div>
                  <p className="text-muted-foreground mb-0.5">Hạn thanh toán</p>
                  <p className="font-medium text-sm">
                    {paymentQRData.expiresAt
                      ? new Date(paymentQRData.expiresAt).toLocaleString('vi-VN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-0.5">Số hóa đơn</p>
                  <p className="font-medium text-sm">{paymentQRData.invoiceCount}</p>
                </div>
              </div>

              {/* Status Section */}
              <div className="border-t pt-4 space-y-3">
                <p className="text-center text-lg font-semibold">
                  {!paymentStatus ? 'Đang chờ thanh toán...' : 
                   paymentStatus.paymentStatus === 'SUCCESS' ? 'Thanh toán thành công! 🎉' :
                   paymentStatus.paymentStatus === 'FAILED' ? 'Thanh toán thất bại' :
                   paymentStatus.paymentStatus === 'EXPIRED' ? 'Hết hạn thanh toán' :
                   'Đang chờ thanh toán...'}
                </p>

                {paymentStatus && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border">
                    {paymentStatus.paymentStatus === 'SUCCESS' && (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                        <div>
                          <p className="font-semibold text-green-700 dark:text-green-400 text-sm">Thanh toán thành công</p>
                          <p className="text-xs text-muted-foreground">Cảm ơn bạn đã thanh toán</p>
                        </div>
                      </>
                    )}
                    {paymentStatus.paymentStatus === 'FAILED' && (
                      <>
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                        <p className="font-semibold text-red-700 dark:text-red-400 text-sm">Thanh toán thất bại. Vui lòng thử lại.</p>
                      </>
                    )}
                    {paymentStatus.paymentStatus === 'EXPIRED' && (
                      <>
                        <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
                        <p className="font-semibold text-orange-700 dark:text-orange-400 text-sm">Hết hạn thanh toán. Vui lòng thực hiện thanh toán mới.</p>
                      </>
                    )}
                    {paymentStatus.paymentStatus === 'PENDING' && (
                      <>
                        <Clock className="w-5 h-5 text-blue-500 animate-spin shrink-0" />
                        <div>
                          <p className="font-semibold text-blue-700 dark:text-blue-400 text-sm">Đang chờ thanh toán</p>
                          <p className="text-xs text-muted-foreground">Hết hạn trong: {timeRemaining}</p>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {!paymentStatus && (
                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm text-blue-700 dark:text-blue-300">
                    <span className="inline-flex items-center gap-2">
                      <Clock className="w-4 h-4 animate-spin" />
                      Đang kiểm tra trạng thái thanh toán... (Hết hạn trong: {timeRemaining})
                    </span>
                  </div>
                )}

                {paymentStatus?.paymentStatus === 'SUCCESS' && (
                  <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3 text-xs text-green-700 dark:text-green-300">
                    Số tiền {(paymentQRData.amount || 0).toLocaleString('vi-VN')} ₫ đã được ghi nhận. Hóa đơn công nợ của bạn đã được cập nhật.
                  </div>
                )}

                {paymentStatus?.paymentStatus === 'FAILED' && (
                  <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-300">
                    Thanh toán thất bại. Vui lòng kiểm tra lại thông tin và thử lại.
                  </div>
                )}

                {paymentStatus?.paymentStatus === 'EXPIRED' && (
                  <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-3 text-sm text-orange-700 dark:text-orange-300">
                    Hết hạn thanh toán. Vui lòng thực hiện thanh toán mới.
                  </div>
                )}
              </div>

              <Button 
                size="sm" 
                className="w-full" 
                onClick={() => setPaymentModalOpen(false)}
                disabled={!paymentStatus || paymentStatus.paymentStatus === 'PENDING'}
              >
                {paymentStatus?.paymentStatus === 'SUCCESS' ? 'Đóng' : paymentStatus?.paymentStatus === 'PENDING' ? 'Đang xử lý...' : 'Đóng'}
              </Button>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-red-600">Không thể tạo mã QR. Vui lòng thử lại.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
