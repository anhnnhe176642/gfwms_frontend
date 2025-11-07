import { Metadata } from 'next';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { SupplierDetailView } from '@/components/admin/supplier-management';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Chi tiết nhà cung cấp | GFWMS',
  description: 'Xem thông tin chi tiết nhà cung cấp',
};

export default async function SupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.FABRICS.SUPPLIERS}>
      <div className="container mx-auto py-8 px-4  max-w-5xl">
        <SupplierDetailView supplierId={id} />
      </div>
    </ProtectedRoute>
  );
}
