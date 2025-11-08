import { Metadata } from 'next';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { CreateImportFabricForm } from '@/components/admin/import-fabric-management/CreateImportFabricForm';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Tạo đơn nhập kho | GFWMS',
  description: 'Tạo một đơn nhập kho mới',
};

export default async function CreateImportFabricPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.WAREHOUSES.IMPORT_FABRICS_CREATE}>
      <CreateImportFabricForm warehouseId={id} />
    </ProtectedRoute>
  );
}
