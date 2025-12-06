import { Metadata } from 'next';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { OrderListTable } from '@/components/admin/order-management';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Quản lý đơn hàng | GFWMS',
  description: 'Danh sách đơn hàng',
};

export default function OrdersPage() {
  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.ORDERS.LIST}>
      <div className="container mx-auto py-8 px-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý đơn hàng</h1>
          <p className="text-muted-foreground mt-1">
            Xem và quản lý các đơn hàng trong hệ thống
          </p>
        </div>

        <OrderListTable />
      </div>
    </ProtectedRoute>
  );
}
