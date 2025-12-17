'use client';

import { OrderListItem } from '@/types/order';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Package, CheckCircle, XCircle, AlertCircle, CreditCard, Wallet } from 'lucide-react';
import { SALE_UNIT_CONFIG } from '@/constants/order';

interface OrderCardProps {
  order: OrderListItem;
  onViewDetails?: (orderId: number) => void;
}

export function OrderCard({ order, onViewDetails }: OrderCardProps) {
  const storeInfo = order.store as any;
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">Đơn hàng #{order.id}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(order.orderDate).toLocaleString('vi-VN')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-primary">
              {order.totalAmount.toLocaleString('vi-VN')} ₫
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Status badges */}
          <div className="flex items-center gap-2 flex-wrap">
          {order.status === 'PENDING' && (
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              <Clock className="w-3 h-3" />
              Đang chờ
            </div>
          )}
          {order.status === 'PROCESSING' && (
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              <Package className="w-3 h-3" />
              Đang xử lý
            </div>
          )}
          {order.status === 'DELIVERED' && (
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <CheckCircle className="w-3 h-3" />
              Đã giao
            </div>
          )}
          {order.status === 'CANCELED' && (
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
              <XCircle className="w-3 h-3" />
              Đã hủy
            </div>
          )}
          {order.status === 'FAILED' && (
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
              <AlertCircle className="w-3 h-3" />
              Thất bại
            </div>
          )}

          {order.invoice?.invoiceStatus === 'UNPAID' && (
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
              {order.invoice?.paymentType === 'CREDIT' ? <CreditCard className="w-3 h-3" /> : <Wallet className="w-3 h-3" />}
              Chưa thanh toán
            </div>
          )}
          {order.invoice?.invoiceStatus === 'PAID' && (
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              {order.invoice?.paymentType === 'CREDIT' ? <CreditCard className="w-3 h-3" /> : <Wallet className="w-3 h-3" />}
              Đã thanh toán
            </div>
          )}
          {(order.invoice?.invoiceStatus === 'OVERDUE' || order.invoice?.invoiceStatus === 'REFUNDED') && (
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
              {order.invoice?.paymentType === 'CREDIT' ? <CreditCard className="w-3 h-3" /> : <Wallet className="w-3 h-3" />}
              {order.invoice?.invoiceStatus === 'OVERDUE' ? 'Quá hạn' : 'Hoàn tiền'}
            </div>
          )}
        </div>

        {/* Store info */}
        {order.store ? (
          <div className="text-sm">
            <p className="text-muted-foreground">Cửa hàng:</p>
            <p className="font-medium">{storeInfo?.name || 'N/A'}</p>
            <p className="text-xs text-muted-foreground">{storeInfo?.address || 'N/A'}</p>
          </div>
        ) : null}

        {/* Items preview */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Sản phẩm ({order.orderItems.length}):
          </p>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {order.orderItems.slice(0, 3).map((item: any) => (
              <div key={item.id} className="text-sm text-muted-foreground flex justify-between items-center">
                <span>
                  {item.fabric.category.name} - {item.fabric.color.name}
                </span>
                <div className="flex items-center gap-1">
                  <span>x{item.quantity}</span>
                  <Badge value={item.saleUnit} config={SALE_UNIT_CONFIG} />
                </div>
              </div>
            ))}
            {order.orderItems.length > 3 && (
              <p className="text-xs text-muted-foreground italic">
                +{order.orderItems.length - 3} sản phẩm khác
              </p>
            )}
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="text-sm">
            <p className="text-muted-foreground">Ghi chú:</p>
            <p className="text-sm italic">{order.notes}</p>
          </div>
        )}

        {/* Invoice info */}
        {order.invoice && (
          <div className="bg-muted p-3 rounded-md text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tổng tiền:</span>
              <span className="font-medium">{order.invoice.totalAmount.toLocaleString('vi-VN')} ₫</span>
            </div>
            {order.invoice.paymentType === 'CREDIT' && order.invoice.paidAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Đã thanh toán:</span>
                <span className="font-medium text-green-600">{order.invoice.paidAmount.toLocaleString('vi-VN')} ₫</span>
              </div>
            )}
            {order.invoice.creditAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dùng công nợ:</span>
                <span className="font-medium text-blue-600">{order.invoice.creditAmount.toLocaleString('vi-VN')} ₫</span>
              </div>
            )}
            {order.invoice.paymentDeadline && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Hạn thanh toán:</span>
                <span>
                  {new Date(order.invoice.paymentDeadline).toLocaleString('vi-VN')}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action button */}
        {onViewDetails && (
          <Button
            onClick={() => onViewDetails(order.id)}
            variant="outline"
            className="w-full"
          >
            Xem chi tiết
          </Button>
        )}
        </div>
      </CardContent>
    </Card>
  );
}
