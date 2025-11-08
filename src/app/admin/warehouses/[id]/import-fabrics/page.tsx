import { Metadata } from 'next';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { WarehouseImportFabricsList } from '@/components/admin/warehouse-management';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Danh sách phiếu nhập kho | GFWMS',
  description: 'Xem danh sách các phiếu nhập kho hàng',
};

export default async function WarehouseImportFabricsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.WAREHOUSES.DETAIL}>
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <WarehouseImportFabricsList warehouseId={id} />
      </div>
    </ProtectedRoute>
  );
}
