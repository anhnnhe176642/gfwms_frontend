'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderCard } from '@/components/shop/order/OrderCard';
import { OrderDetailModal } from '@/components/account/OrderDetailModal';
import { orderService } from '@/services/order.service';
import type { OrderListItem, OrderListParams } from '@/types/order';
import type { OrderStatus } from '@/types/order';
import { IsLoading } from '@/components/common';
import { Package } from 'lucide-react';
import Link from 'next/link';

const STATUS_CONFIG: { value: OrderStatus; label: string }[] = [
  { value: 'PENDING', label: 'Đang chờ' },
  { value: 'PROCESSING', label: 'Đang xử lý' },
  { value: 'DELIVERED', label: 'Hoàn thành' },
  { value: 'FAILED', label: 'Thất bại' },
  { value: 'CANCELED', label: 'Đã hủy' },
];

export function OrdersTab() {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<OrderStatus>('PENDING');
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const response = await orderService.getMyOrders({
          page: 1,
          limit: 100,
        } as OrderListParams);
        setOrders(response.data);
      } catch (err: any) {
        console.error('Lỗi tải đơn hàng:', err);
        setError('Không thể tải danh sách đơn hàng');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (isLoading) {
    return <IsLoading />;
  }

  if (error) {
    return (
      <Card className="border-red-200 dark:border-red-900">
        <CardContent className="pt-6">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Đơn hàng</CardTitle>
          <CardDescription>Danh sách đơn hàng của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <Package className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-6">Bạn chưa có đơn hàng nào</p>
            <Link href="/shop/fabrics">
              <Button>Đặt hàng ngay</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredOrders = orders.filter((order) => order.status === activeStatus);
  const totalByStatus = STATUS_CONFIG.map((status) => ({
    ...status,
    count: orders.filter((order) => order.status === status.value).length,
  }));

  const handleViewDetails = (orderId: number) => {
    setSelectedOrderId(orderId);
    setDetailModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Đơn hàng</CardTitle>
          <CardDescription>Danh sách đơn hàng của bạn theo trạng thái</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeStatus} onValueChange={(value) => setActiveStatus(value as OrderStatus)}>
            <TabsList className="grid w-full grid-cols-5">
              {totalByStatus.map((status) => (
                <TabsTrigger key={status.value} value={status.value} className="text-xs sm:text-sm">
                  <span>{status.label}</span>
                  {status.count > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-primary/20 text-primary rounded-full text-xs font-medium">
                      {status.count}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {totalByStatus.map((status) => (
              <TabsContent key={status.value} value={status.value} className="space-y-4 mt-6">
                {filteredOrders.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Không có đơn hàng nào ở trạng thái "{status.label}"</p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredOrders.map((order) => (
                    <OrderCard 
                      key={order.id} 
                      order={order}
                      onViewDetails={handleViewDetails}
                    />
                  ))
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <OrderDetailModal
        orderId={selectedOrderId}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />
    </div>
  );
}
