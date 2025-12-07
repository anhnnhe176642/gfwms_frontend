'use client';

import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { orderService } from '@/services/order.service';
import type { OrderDetail } from '@/types/order';
import { getServerErrorMessage } from '@/lib/errorHandler';
import { exportInvoiceToPDF } from '@/lib/pdf';
import { useNavigation } from '@/hooks/useNavigation';
import { OrderStatusBadge, PaymentTypeBadge, InvoiceStatusBadge } from '@/components/admin/table/Badges';
import { IsLoading } from '@/components/common/IsLoading';
import { SALE_UNIT_LABELS } from '@/constants/order';
import {
  ArrowLeft,
  Loader2,
  FileText,
  Printer,
  Package,
  RefreshCw,
  CreditCard,
  User,
  ShoppingCart,
  Store,
  Clock,
  Phone,
  FileCheck,
} from 'lucide-react';

interface OrderDetailViewProps {
  orderId: string | number;
}

export function OrderDetailView({ orderId }: OrderDetailViewProps) {
  const { handleGoBack } = useNavigation();
  const orderRef = useRef<HTMLDivElement>(null);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getDetail(orderId);
      setOrder(data);
    } catch (err) {
      const errorMessage = getServerErrorMessage(err) || 'Không thể tải chi tiết đơn hàng';
      setError(errorMessage);
      console.error('Failed to fetch order detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    if (!orderRef.current) {
      toast.error('Không thể xuất PDF');
      return;
    }

    try {
      setExporting(true);
      await exportInvoiceToPDF(orderRef.current, 'Don_Hang', order?.id || '');
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
    return <IsLoading message="Đang tải chi tiết đơn hàng..." />;
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleGoBack} className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Chi tiết đơn hàng</h1>
          </div>
        </div>

        <Card className="bg-card">
          <CardContent className="flex justify-center items-center h-64">
            <div className="text-center">
              <p className="text-red-500 mb-2">{error || 'Không tìm thấy đơn hàng'}</p>
              <Button onClick={handleGoBack} variant="outline">
                Quay lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalItems = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const remainingAmount = order.totalAmount - order.paidAmount;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleGoBack} className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Chi tiết đơn hàng</h1>
            <p className="text-muted-foreground mt-1">Đơn hàng #{order.id}</p>
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
            onClick={handlePrint}
            disabled={exporting}
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            In
          </Button>
        </div>
      </div>

      {/* Order Card */}
      <Card
        className="bg-white dark:bg-slate-950 print:shadow-none print:border-0"
        ref={orderRef}
      >
        <CardContent className="p-0">
          {/* Header Section */}
          <div className="border-b p-8 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">ĐƠN HÀNG</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Mã đơn hàng:{' '}
                  <span className="font-semibold text-foreground">#{order.id}</span>
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.isOffline
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                        : 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300'
                    }`}
                  >
                    <Store className="h-3 w-3 inline mr-1" />
                    {order.isOffline ? 'Offline' : 'Online'}
                  </span>
                </div>
              </div>
              <div className="text-right space-y-2">
                <OrderStatusBadge status={order.status} />
                <p className="text-sm text-muted-foreground">
                  Ngày đặt:{' '}
                  <span className="font-semibold text-foreground">
                    {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                  </span>
                </p>
                {order.paymentDeadline && (
                  <p className="text-sm text-muted-foreground">
                    Hạn thanh toán:{' '}
                    <span className="font-semibold text-foreground">
                      {new Date(order.paymentDeadline).toLocaleDateString('vi-VN')}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Customer & Payment Information */}
          <div className="border-b p-8">
            <div className="grid grid-cols-2 gap-8">
              {/* Customer Info */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Khách hàng
                </h3>
                <p className="font-medium text-foreground">
                  {order.user.fullname || order.user.username}
                </p>
                <p className="text-sm text-muted-foreground">{order.user.email}</p>
                {(order.customerPhone || order.user.phone) && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {order.customerPhone || order.user.phone}
                  </p>
                )}
              </div>

              {/* Payment Info */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Thanh toán
                </h3>
                <div className="flex items-center gap-2">
                  <PaymentTypeBadge type={order.paymentType} />
                </div>
                <div className="text-sm space-y-1">
                  <p className="text-muted-foreground">
                    Đã thanh toán:{' '}
                    <span className="font-semibold text-green-600">
                      {order.paidAmount.toLocaleString('vi-VN')} ₫
                    </span>
                  </p>
                  {order.creditAmount > 0 && (
                    <p className="text-muted-foreground">
                      Công nợ:{' '}
                      <span className="font-semibold text-amber-600">
                        {order.creditAmount.toLocaleString('vi-VN')} ₫
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Staff Info (for offline orders) */}
            {order.createdByStaff && (
              <div className="mt-6 pt-4 border-t">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2 mb-2">
                  <Store className="h-4 w-4" />
                  Nhân viên tạo đơn
                </h3>
                <p className="font-medium text-foreground">{order.createdByStaff.fullname}</p>
                <p className="text-sm text-muted-foreground">@{order.createdByStaff.username}</p>
              </div>
            )}

            {/* Notes */}
            {order.notes && (
              <div className="mt-6 pt-4 border-t">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4" />
                  Ghi chú
                </h3>
                <p className="text-sm text-foreground">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="border-b p-8 overflow-x-auto">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2 mb-4">
              <ShoppingCart className="h-4 w-4" />
              Sản phẩm đặt hàng ({order.orderItems.length} loại)
            </h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2">
                  <th className="text-left py-3 px-2 font-semibold text-foreground">STT</th>
                  <th className="text-left py-3 px-2 font-semibold text-foreground">Sản phẩm</th>
                  <th className="text-left py-3 px-2 font-semibold text-foreground">Màu sắc</th>
                  <th className="text-center py-3 px-2 font-semibold text-foreground">Kích thước</th>
                  <th className="text-center py-3 px-2 font-semibold text-foreground">Đơn vị</th>
                  <th className="text-right py-3 px-2 font-semibold text-foreground">SL</th>
                  <th className="text-right py-3 px-2 font-semibold text-foreground">Đơn giá</th>
                  <th className="text-right py-3 px-2 font-semibold text-foreground">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {order.orderItems.map((item, index) => (
                  <tr key={item.id} className="border-b hover:bg-muted/50">
                    <td className="py-4 px-2 text-center font-medium">{index + 1}</td>
                    <td className="py-4 px-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{item.fabric.category.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {item.fabric.gloss.description} • Dày: {item.fabric.thickness}mm
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-2 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {item.fabric.color.hexCode && (
                          <div
                            className="w-4 h-4 rounded border border-input"
                            style={{ backgroundColor: item.fabric.color.hexCode }}
                          />
                        )}
                        <span>{item.fabric.color.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-center whitespace-nowrap text-xs">
                      {item.fabric.length}m × {item.fabric.width}m
                    </td>
                    <td className="py-4 px-2 text-center whitespace-nowrap">
                      <span className="px-2 py-1 rounded bg-muted text-xs font-medium">
                        {SALE_UNIT_LABELS[item.saleUnit] || item.saleUnit}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-right font-medium whitespace-nowrap">
                      {item.quantity.toLocaleString('vi-VN')}
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
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Tổng số lượng:</span>
                  <span className="font-medium text-foreground">
                    {totalItems.toLocaleString('vi-VN')} sản phẩm
                  </span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Số mặt hàng:</span>
                  <span className="font-medium text-foreground">
                    {order.orderItems.length} loại
                  </span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Đã thanh toán:</span>
                  <span className="font-medium text-green-600">
                    {order.paidAmount.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
                {remainingAmount > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Còn lại:</span>
                    <span className="font-medium text-amber-600">
                      {remainingAmount.toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                )}
                <div className="border-t-2 border-b-2 py-3 flex justify-between font-bold text-base">
                  <span>Tổng đơn hàng:</span>
                  <span className="text-lg text-blue-600 dark:text-blue-500">
                    {order.totalAmount.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Information */}
          {order.invoice && (
            <div className="border-t p-8">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
                <FileCheck className="h-4 w-4" />
                Thông tin hóa đơn
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-muted/50 p-4 rounded-lg">
                <div>
                  <p className="text-muted-foreground">Mã hóa đơn</p>
                  <p className="font-mono font-medium">#{order.invoice.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Trạng thái</p>
                  <div className="mt-1">
                    <InvoiceStatusBadge status={order.invoice.invoiceStatus} />
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground">Hạn thanh toán</p>
                  <p className="font-medium">
                    {new Date(order.invoice.dueDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tổng tiền</p>
                  <p className="font-medium text-blue-600">
                    {order.invoice.totalAmount.toLocaleString('vi-VN')} ₫
                  </p>
                </div>
                {order.invoice.notes && (
                  <div className="col-span-4">
                    <p className="text-muted-foreground">Ghi chú</p>
                    <p className="font-medium">{order.invoice.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t bg-muted/30 p-8 text-xs text-muted-foreground space-y-2 print:bg-white print:border-0">
            <p className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Ngày tạo: {new Date(order.createdAt).toLocaleString('vi-VN')}
            </p>
            <p className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Lần cập nhật cuối: {new Date(order.updatedAt).toLocaleString('vi-VN')}
            </p>
          </div>
        </CardContent>
      </Card>

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

export default OrderDetailView;
