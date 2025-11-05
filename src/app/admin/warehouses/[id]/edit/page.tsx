import { Metadata } from 'next';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { EditWarehouseForm } from '@/components/admin/warehouse-management';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Chỉnh sửa kho | GFWMS',
  description: 'Cập nhật thông tin kho hàng',
};

export default async function EditWarehousePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.WAREHOUSES.EDIT}>
      <EditWarehouseForm warehouseId={id} />
    </ProtectedRoute>
  );
}
