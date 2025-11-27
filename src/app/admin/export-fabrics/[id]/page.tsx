import { Metadata } from 'next';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { ExportFabricDetailView } from '@/components/admin/store-management/ExportFabricDetail/ExportFabricDetailView';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Chi tiết phiếu xuất | GFWMS',
  description: 'Xem chi tiết phiếu xuất vải',
};

export default async function ExportFabricDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.EXPORT_FABRICS.DETAIL}>
      <div className="p-6">
        <ExportFabricDetailView exportFabricId={id} />
      </div>
    </ProtectedRoute>
  );
}
