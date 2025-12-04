import { Metadata } from 'next';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { ExportFabricDetailView } from '@/components/admin/store-management/ExportFabricDetail/ExportFabricDetailView';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Chi tiết phiếu xuất | GFWMS',
  description: 'Xem thông tin chi tiết phiếu xuất hàng',
};

export default async function ExportFabricDetailPage({
  params,
}: {
  params: Promise<{ id: string; exportFabricId: string }>;
}) {
  const { id, exportFabricId } = await params;

  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.WAREHOUSES.EXPORT_FABRICS}>
      <ExportFabricDetailView warehouseId={id} exportFabricId={exportFabricId} />
    </ProtectedRoute>
  );
}
