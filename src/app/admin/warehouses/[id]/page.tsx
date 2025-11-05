import { Metadata } from 'next';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { WarehouseDetailView } from '@/components/admin/warehouse-management';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Chi tiết kho | GFWMS',
  description: 'Xem thông tin chi tiết kho hàng',
};

export default async function WarehouseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.WAREHOUSES.DETAIL}>
      <WarehouseDetailView warehouseId={id} />
    </ProtectedRoute>
  );
}
