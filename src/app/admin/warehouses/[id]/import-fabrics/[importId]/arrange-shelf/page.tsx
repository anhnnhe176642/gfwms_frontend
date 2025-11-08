import { Metadata } from 'next';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { ArrangeImportFabricToShelfPage } from '@/components/admin/import-fabric-management/ArrangeImportFabricToShelfPage';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Xếp vải vào kệ | GFWMS',
  description: 'Xếp các mục vải từ phiếu nhập vào các kệ trong kho',
};

export default async function ArrangeShelfPage({
  params,
}: {
  params: Promise<{ id: string; importId: string }>;
}) {
  const { id, importId } = await params;

  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.WAREHOUSES.DETAIL}>
      <ArrangeImportFabricToShelfPage warehouseId={id} importId={importId} />
    </ProtectedRoute>
  );
}
