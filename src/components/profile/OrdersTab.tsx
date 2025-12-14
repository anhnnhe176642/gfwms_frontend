'use client';

import React, { useState, useEffect } from 'react';
import { OrderListItem } from '@/types/order';
import { orderService } from '@/services/order.service';
import { getServerErrorMessage } from '@/lib/errorHandler';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OrderCard } from '@/components/shop/order';
import { Loader2, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function OrdersTab() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await orderService.getMyOrders({ limit: 5 });
      setOrders(response.data);
    } catch (err: any) {
      const errorMsg = getServerErrorMessage(err) || 'Không thể tải danh sách đơn hàng';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (orderId: number) => {
    router.push(`/shop/order/${orderId}`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
        <p className="text-muted-foreground">Đang tải đơn hàng...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 flex flex-col items-center justify-center gap-4 text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold mb-2">Không có đơn hàng</h3>
            <p className="text-muted-foreground max-w-md">
              Bạn chưa có đơn hàng nào. Hãy bắt đầu mua hàng ngay!
            </p>
          </div>
          <Button onClick={() => router.push('/shop')}>
            Quay lại cửa hàng
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      {orders.length > 0 && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => router.push('/shop/orders')}
            className="w-full"
          >
            Xem tất cả đơn hàng
          </Button>
        </div>
      )}
    </div>
  );
}
