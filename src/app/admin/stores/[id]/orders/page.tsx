'use client';

import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { OrderListTable } from '@/components/admin/order-management';
import { ROUTES } from '@/config/routes';
import { useParams } from 'next/navigation';

export default function StoreOrdersPage() {
  const params = useParams();
  const storeId = params.id as string;

  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.STORES.ORDERS}>
      <div className="container mx-auto py-8 px-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Đơn hàng cửa hàng</h1>
          <p className="text-muted-foreground mt-1">
            Xem và quản lý các đơn hàng của cửa hàng
          </p>
        </div>

        <OrderListTable storeId={storeId} />
      </div>
    </ProtectedRoute>
  );
}
