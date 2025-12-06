import { Metadata } from 'next';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { OrderDetailView } from '@/components/admin/order-management';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Chi tiết đơn hàng | GFWMS',
  description: 'Xem thông tin chi tiết đơn hàng',
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.ORDERS.DETAIL}>
      <OrderDetailView orderId={id} />
    </ProtectedRoute>
  );
}
