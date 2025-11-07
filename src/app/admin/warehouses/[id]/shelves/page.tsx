import { Metadata } from 'next';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { WarehouseShelvesList } from '@/components/admin/warehouse-management/WarehouseShelvesList';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Danh sách kệ | GFWMS',
  description: 'Xem danh sách kệ trong kho',
};

export default async function WarehouseShelvesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.SHELVES.LIST}>
      <WarehouseShelvesList warehouseId={id} />
    </ProtectedRoute>
  );
}
