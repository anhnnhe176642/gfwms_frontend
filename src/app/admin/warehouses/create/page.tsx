import { Metadata } from 'next';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { CreateWarehouseForm } from '@/components/admin/warehouse-management';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Tạo kho mới | GFWMS',
  description: 'Tạo một kho hàng mới trong hệ thống',
};

export default function CreateWarehousePage() {
  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.WAREHOUSES.CREATE}>
      <CreateWarehouseForm />
    </ProtectedRoute>
  );
}
