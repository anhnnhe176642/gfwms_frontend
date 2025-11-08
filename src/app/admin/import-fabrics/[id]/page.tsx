import { Metadata } from 'next';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { ImportFabricDetailView } from '@/components/admin/import-fabric-management';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Chi tiết phiếu nhập | GFWMS',
  description: 'Xem thông tin chi tiết phiếu nhập hàng',
};

export default async function ImportFabricDetailPage({
  params,
}: {
  params: Promise<{ id: string; importId: string }>;
}) {
  const { id, importId } = await params;

  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.WAREHOUSES.IMPORT_FABRICS_DETAIL}>
      <ImportFabricDetailView warehouseId={id} importId={importId} />
    </ProtectedRoute>
  );
}
