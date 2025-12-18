'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { orderService } from '@/services/order.service';
import { SALE_UNIT_CONFIG } from '@/constants/order';
import type { OrderDetail } from '@/types/order';
import { IsLoading } from '@/components/common';
import { Clock, Package, CheckCircle, XCircle, AlertCircle, CreditCard, Wallet, MapPin, Phone, User, Calendar } from 'lucide-react';

interface OrderDetailModalProps {
  orderId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailModal({ orderId, open, onOpenChange }: OrderDetailModalProps) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId || !open) return;

    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await orderService.getDetail(orderId);
        setOrder(data);
      } catch (err: any) {
        console.error('Lỗi tải chi tiết đơn hàng:', err);
        setError('Không thể tải chi tiết đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId, open]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'PROCESSING':
        return <Package className="w-4 h-4" />;
      case 'DELIVERED':
        return <CheckCircle className="w-4 h-4" />;
      case 'CANCELED':
        return <XCircle className="w-4 h-4" />;
      case 'FAILED':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Đang chờ';
      case 'PROCESSING':
        return 'Đang xử lý';
      case 'DELIVERED':
        return 'Hoàn thành';
      case 'CANCELED':
        return 'Đã hủy';
      case 'FAILED':
        return 'Thất bại';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'CANCELED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'FAILED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInvoiceStatusLabel = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'Đã thanh toán';
      case 'UNPAID':
        return 'Chưa thanh toán';
      case 'OVERDUE':
        return 'Quá hạn';
      case 'REFUNDED':
        return 'Hoàn tiền';
      default:
        return status;
    }
  };

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'UNPAID':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'OVERDUE':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'REFUNDED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết đơn hàng #{orderId}</DialogTitle>
          <DialogDescription>Thông tin chi tiết về đơn hàng của bạn</DialogDescription>
        </DialogHeader>

        {loading && <IsLoading />}

        {error && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md p-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {order && !loading && (
          <div className="space-y-6">
            {/* Order Header */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">Đơn hàng #{order.id}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(order.orderDate).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary mb-2">
                      {order.totalAmount.toLocaleString('vi-VN')} ₫
                    </p>
                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {getStatusLabel(order.status)}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Thông tin khách hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Tên khách hàng</p>
                      <p className="font-medium">{order.user.fullname || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">@{order.user.username || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Số điện thoại</p>
                      <p className="font-medium">{order.user.phone || 'Không có'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 md:col-span-2">
                    <CreditCard className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{order.user.email || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {order.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">Ghi chú</p>
                    <p className="font-medium">{order.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Store Info */}
            {order.store && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Thông tin cửa hàng</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{order.store.name}</p>
                      <p className="text-sm text-muted-foreground">{order.store.address}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sản phẩm ({order.orderItems.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.orderItems.map((item: any, index: number) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Fabric Info */}
                        <div>
                          <h4 className="font-semibold mb-2">Vải #{index + 1}</h4>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="text-muted-foreground">Loại:</span>
                              <span className="ml-2 font-medium">{item.fabric.category.name}</span>
                            </p>
                            <p>
                              <span className="text-muted-foreground">Màu:</span>
                              <span className="ml-2 font-medium flex items-center gap-2">
                                {item.fabric.color.name}
                                {item.fabric.color.hexCode && (
                                  <span
                                    className="w-4 h-4 rounded border"
                                    style={{ backgroundColor: item.fabric.color.hexCode }}
                                  />
                                )}
                              </span>
                            </p>
                            <p>
                              <span className="text-muted-foreground">Độ bóng:</span>
                              <span className="ml-2 font-medium">{item.fabric.gloss.description}</span>
                            </p>
                          </div>
                        </div>

                        {/* Specifications */}
                        <div>
                          <h4 className="font-semibold mb-2">Thông số kỹ thuật</h4>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="text-muted-foreground">Độ dày:</span>
                              <span className="ml-2 font-medium">{item.fabric.thickness}mm</span>
                            </p>
                            <p>
                              <span className="text-muted-foreground">Dài:</span>
                              <span className="ml-2 font-medium">{item.fabric.length}m</span>
                            </p>
                            <p>
                              <span className="text-muted-foreground">Rộng:</span>
                              <span className="ml-2 font-medium">{item.fabric.width}m</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Item Details */}
                      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                        <div>
                          <p className="text-sm text-muted-foreground">Số lượng</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="font-semibold">{item.quantity}</p>
                            <Badge value={item.saleUnit} config={SALE_UNIT_CONFIG} />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Đơn giá</p>
                          <p className="font-semibold">{item.price.toLocaleString('vi-VN')} ₫</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Thành tiền</p>
                          <p className="font-semibold text-primary">
                            {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Invoice Info */}
            {order.invoice && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Thông tin thanh toán</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Status */}
                    <div className="flex items-center justify-between pb-4 border-b">
                      <span className="text-muted-foreground">Trạng thái</span>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getInvoiceStatusColor(order.invoice.invoiceStatus)}`}>
                        {getInvoiceStatusLabel(order.invoice.invoiceStatus)}
                      </div>
                    </div>

                    {/* Payment Type */}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Loại thanh toán</span>
                      <span className="font-medium">
                        {order.invoice.paymentType === 'CASH' ? 'Tiền mặt' : 'Ghi nợ'}
                      </span>
                    </div>

                    {/* Amounts */}
                    <div className="space-y-2 pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Tổng tiền</span>
                        <span className="font-semibold">{order.invoice.totalAmount.toLocaleString('vi-VN')} ₫</span>
                      </div>
                      {order.invoice.paymentType === 'CREDIT' && order.invoice.paidAmount > 0 && (
                        <div className="flex items-center justify-between text-green-600">
                          <span className="text-muted-foreground">Đã thanh toán</span>
                          <span className="font-semibold">{order.invoice.paidAmount.toLocaleString('vi-VN')} ₫</span>
                        </div>
                      )}
                      {order.invoice.creditAmount > 0 && (
                        <div className="flex items-center justify-between text-blue-600">
                          <span className="text-muted-foreground">Dùng công nợ</span>
                          <span className="font-semibold">{order.invoice.creditAmount.toLocaleString('vi-VN')} ₫</span>
                        </div>
                      )}
                    </div>

                    {/* Deadline */}
                    {order.invoice.paymentDeadline && (
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-muted-foreground">Hạn thanh toán</span>
                        <span className="font-medium">
                          {new Date(order.invoice.paymentDeadline).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
