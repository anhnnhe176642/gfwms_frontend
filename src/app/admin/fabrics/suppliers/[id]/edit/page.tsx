import { Metadata } from 'next';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { EditSupplierForm } from '@/components/admin/supplier-management';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Chỉnh sửa nhà cung cấp | GFWMS',
  description: 'Cập nhật thông tin nhà cung cấp',
};

export default async function EditSupplierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.FABRICS.SUPPLIERS}>
      <div className="container mx-auto py-8 px-4">
        <EditSupplierForm supplierId={id} />
      </div>
    </ProtectedRoute>
  );
}
