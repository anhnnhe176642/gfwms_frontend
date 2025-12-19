'use client';

import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { invoiceService } from '@/services/invoice.service';
import type { InvoiceDetail } from '@/types/invoice';
import { getServerErrorMessage } from '@/lib/errorHandler';
import { exportInvoiceToPDF } from '@/lib/pdf';
import { useNavigation } from '@/hooks/useNavigation';
import { InvoiceStatusBadge } from '@/components/admin/table/Badges';
import { IsLoading } from '@/components/common/IsLoading';
import { ConfirmOfflinePaymentDialog } from './ConfirmOfflinePaymentDialog';
import {
  ArrowLeft,
  Loader2,
  FileText,
  Printer,
  Package,
  RefreshCw,
  CreditCard,
  Calendar,
  User,
  ShoppingCart,
  CheckCircle2,
} from 'lucide-react';

interface InvoiceDetailViewProps {
  invoiceId: string | number;
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: 'Tiền mặt',
  CREDIT_CARD: 'Thẻ Công nợ',
  BANK_TRANSFER: 'Chuyển khoản',
  MOMO: 'MoMo',
  VNPAY: 'VNPay',
};

export function InvoiceDetailView({ invoiceId }: InvoiceDetailViewProps) {
  const { handleGoBack } = useNavigation();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [confirmPaymentOpen, setConfirmPaymentOpen] = useState(false);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await invoiceService.getDetail(invoiceId);
      setInvoice(data);
    } catch (err) {
      const errorMessage = getServerErrorMessage(err) || 'Không thể tải chi tiết hóa đơn';
      setError(errorMessage);
      console.error('Failed to fetch invoice detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId]);

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    if (!invoiceRef.current) {
      toast.error('Không thể xuất PDF');
      return;
    }

    try {
      setExporting(true);
      await exportInvoiceToPDF(invoiceRef.current, 'Hóa_Đơn', invoice?.id || '');
      toast.success('Xuất PDF thành công');
    } catch (err) {
      console.error('Failed to export PDF:', err);
      const errorMsg = err instanceof Error ? err.message : 'Xuất PDF thất bại';
      toast.error(errorMsg);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <IsLoading message="Đang tải chi tiết hóa đơn..." />;
  }

  if (error || !invoice) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleGoBack} className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Chi tiết hóa đơn</h1>
          </div>
        </div>

        <Card className="bg-card">
          <CardContent className="flex justify-center items-center h-64">
            <div className="text-center">
              <p className="text-red-500 mb-2">{error || 'Không tìm thấy hóa đơn'}</p>
              <Button onClick={handleGoBack} variant="outline">
                Quay lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalMeter = invoice.order.orderItems
    .filter(item => item.saleUnit === 'METER')
    .reduce((sum, item) => sum + item.quantity, 0);
  const totalRoll = invoice.order.orderItems
    .filter(item => item.saleUnit === 'ROLL')
    .reduce((sum, item) => sum + item.quantity, 0);
  const totalItems = invoice.order.orderItems.length;
  const orderTotal = invoice.order.orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleGoBack} className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Chi tiết hóa đơn</h1>
            <p className="text-muted-foreground mt-1">Hóa đơn #{invoice.id}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 print:hidden">
          <Button
            variant="outline"
            onClick={fetchDetail}
            disabled={loading}
            size="icon"
            title="Làm mới"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          {/* Confirm Offline Payment Button - for CASH */}
          {invoice.paymentType === 'CASH' && invoice.invoiceStatus !== 'PAID' && (
            <Button
              onClick={() => setConfirmPaymentOpen(true)}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="h-4 w-4" />
              Xác nhận thanh toán tiền mặt
            </Button>
          )}
          {/* Confirm Offline Payment Button - for CREDIT with mixed payment */}
          {invoice.paymentType === 'CREDIT' && invoice.invoiceStatus === 'UNPAID' && (
            <Button
              onClick={() => setConfirmPaymentOpen(true)}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="h-4 w-4" />
              Xác nhận thanh toán tiền mặt
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleExportPDF}
            disabled={exporting}
            className="gap-2"
          >
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang xuất...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Xuất PDF
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handlePrintInvoice}
            disabled={exporting}
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            In
          </Button>
        </div>
      </div>

      {/* Invoice Card */}
      <Card
        className="bg-white dark:bg-slate-950 print:shadow-none print:border-0"
        ref={invoiceRef}
      >
        <CardContent className="p-0">
          {/* Header Section */}
          <div className="border-b p-8 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">HÓA ĐƠN</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Mã hóa đơn:{' '}
                  <span className="font-semibold text-foreground">#{invoice.id}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Mã đơn hàng:{' '}
                  <span className="font-semibold text-foreground">#{invoice.orderId}</span>
                </p>
              </div>
              <div className="text-right space-y-2">
                <InvoiceStatusBadge status={invoice.invoiceStatus} />
                <p className="text-sm text-muted-foreground">
                  Ngày lập:{' '}
                  <span className="font-semibold text-foreground">
                    {new Date(invoice.invoiceDate).toLocaleDateString('vi-VN')}
                  </span>
                </p>
                {invoice.paymentDeadline && (
                  <p className="text-sm text-muted-foreground">
                    Hạn thanh toán:{' '}
                    <span className="font-semibold text-foreground">
                      {new Date(invoice.paymentDeadline).toLocaleDateString('vi-VN')}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="border-b p-8">
            <div className="grid grid-cols-2 gap-8">
              {/* Customer Info */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Khách hàng
                </h3>
                <p className="font-medium text-foreground">{invoice.order.user.username}</p>
                <p className="text-sm text-muted-foreground">{invoice.order.user.email}</p>
              </div>

              {/* Order Info */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Đơn hàng
                </h3>
                <p className="font-medium text-foreground">Đơn hàng #{invoice.order.id}</p>
                <p className="text-sm text-muted-foreground">
                  Ngày đặt: {new Date(invoice.order.orderDate).toLocaleDateString('vi-VN')}
                </p>
                {invoice.order.notes && (
                  <p className="text-sm text-muted-foreground">Ghi chú: {invoice.order.notes}</p>
                )}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="border-b p-8 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2">
                  <th className="text-left py-3 px-2 font-semibold text-foreground">STT</th>
                  <th className="text-left py-3 px-2 font-semibold text-foreground">Sản phẩm</th>
                  <th className="text-left py-3 px-2 font-semibold text-foreground">Màu sắc</th>
                  <th className="text-center py-3 px-2 font-semibold text-foreground">Kích thước</th>
                  <th className="text-right py-3 px-2 font-semibold text-foreground">SL</th>
                  <th className="text-center py-3 px-2 font-semibold text-foreground">Đơn vị</th>
                  <th className="text-right py-3 px-2 font-semibold text-foreground">Đơn giá</th>
                  <th className="text-right py-3 px-2 font-semibold text-foreground">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {invoice.order.orderItems.map((item, index) => (
                  <tr key={item.id} className="border-b hover:bg-muted/50">
                    <td className="py-4 px-2 text-center font-medium">{index + 1}</td>
                    <td className="py-4 px-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{item.fabric.category.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {item.fabric.gloss.description} • {item.fabric.supplier.name}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-2 whitespace-nowrap">{item.fabric.color.name}</td>
                    <td className="py-4 px-2 text-center whitespace-nowrap text-xs">
                      {item.fabric.length}m × {item.fabric.width}m
                    </td>
                    <td className="py-4 px-2 text-right font-medium whitespace-nowrap">
                      {item.quantity.toLocaleString('vi-VN')}
                    </td>
                    <td className="py-4 px-2 text-center whitespace-nowrap text-sm font-medium">
                      {item.saleUnit === 'METER' ? 'Mét' : item.saleUnit === 'ROLL' ? 'Cuộn' : item.saleUnit}
                    </td>
                    <td className="py-4 px-2 text-right font-medium whitespace-nowrap">
                      {item.price.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="py-4 px-2 text-right font-medium text-foreground whitespace-nowrap">
                      {(item.quantity * item.price).toLocaleString('vi-VN')} ₫
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Section */}
          <div className="p-8">
            <div className="flex justify-end">
              <div className="w-full max-w-xs space-y-3">
                {totalMeter > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Tổng mét:</span>
                    <span className="font-medium text-foreground">
                      {totalMeter.toLocaleString('vi-VN')} m
                    </span>
                  </div>
                )}
                {totalRoll > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Tổng cuộn:</span>
                    <span className="font-medium text-foreground">
                      {totalRoll.toLocaleString('vi-VN')} cuộn
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Số mặt hàng:</span>
                  <span className="font-medium text-foreground">
                    {totalItems} loại
                  </span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Tổng đơn hàng:</span>
                  <span className="font-medium text-foreground">
                    {orderTotal.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
                <div className="border-t-2 border-b-2 py-3 flex justify-between font-bold text-base">
                  <span>Tổng hóa đơn:</span>
                  <span className="text-lg text-blue-600 dark:text-blue-500">
                    {invoice.order.totalAmount.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          {invoice.payment && (
            <div className="border-t p-8">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Thông tin thanh toán
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm bg-muted/50 p-4 rounded-lg">
                <div className="col-span-1">
                  <p className="text-muted-foreground text-xs mb-1">Mã giao dịch</p>
                  <p className="font-mono font-medium break-all text-xs">{invoice.payment.transactionId || 'N/A'}</p>
                </div>
                <div className="col-span-1">
                  <p className="text-muted-foreground text-xs mb-1">Phương thức</p>
                  <p className="font-medium">
                    {PAYMENT_METHOD_LABELS[invoice.payment.paymentMethod] ||
                      invoice.payment.paymentMethod}
                  </p>
                </div>
                <div className="col-span-1">
                  <p className="text-muted-foreground text-xs mb-1">Ngày thanh toán</p>
                  <p className="font-medium">
                    {new Date(invoice.payment.paymentDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div className="col-span-1">
                  <p className="text-muted-foreground text-xs mb-1">Số tiền</p>
                  <p className="font-medium text-green-600">
                    {invoice.payment.amount.toLocaleString('vi-VN')} ₫
                  </p>
                </div>
                {invoice.payment.notes && (
                  <div className="col-span-1 md:col-span-2 lg:col-span-4">
                    <p className="text-muted-foreground text-xs mb-1">Ghi chú</p>
                    <p className="font-medium">{invoice.payment.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t bg-muted/30 p-8 text-xs text-muted-foreground space-y-2 print:bg-white print:border-0">
            <p>Ngày tạo: {new Date(invoice.createdAt).toLocaleString('vi-VN')}</p>
            <p>Lần cập nhật cuối: {new Date(invoice.updatedAt).toLocaleString('vi-VN')}</p>
          </div>
        </CardContent>
      </Card>

      {/* Confirm Offline Payment Dialog */}
      {invoice && (
        <ConfirmOfflinePaymentDialog
          open={confirmPaymentOpen}
          onOpenChange={setConfirmPaymentOpen}
          invoice={invoice}
          onSuccess={fetchDetail}
        />
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border-0 {
            border: none !important;
          }
          .print\\:bg-white {
            background-color: white !important;
          }
        }
      `}</style>
    </div>
  );
}

export default InvoiceDetailView;
