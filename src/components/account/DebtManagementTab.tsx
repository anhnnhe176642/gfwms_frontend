'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/services/auth.service';
import { creditInvoiceService } from '@/services/creditInvoice.service';
import { CREDIT_REGISTRATION_STATUS_CONFIG } from '@/constants/creditRegistration';
import { CREDIT_INVOICE_STATUS_CONFIG } from '@/constants/creditInvoice';
import type { CreditRegistration } from '@/types/creditRegistration';
import type { CreditInvoiceListItem, CreditInvoiceListParams } from '@/types/creditInvoice';
import { AlertCircle, TrendingDown, Calendar, Plus } from 'lucide-react';
import { CreditRegistrationModal } from './CreditRegistrationModal';
import { IncreaseCreditsModal } from './IncreaseCreditsModal';

export function DebtManagementTab() {
  const { user } = useAuth();
  const setUser = useAuthStore((state) => state.setUser);
  const creditRegistration = user?.creditRegistration as CreditRegistration | undefined;
  const [creditInvoices, setCreditInvoices] = useState<CreditInvoiceListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [increaseModalOpen, setIncreaseModalOpen] = useState(false);

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
    </>
  );
}
