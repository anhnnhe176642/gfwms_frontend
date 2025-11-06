import { Metadata } from 'next';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { ShelfDetailView } from '@/components/admin/warehouse-management';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Chi tiết kệ | GFWMS',
  description: 'Xem thông tin chi tiết kệ và các loại vải trong kệ',
};

export default async function ShelfDetailPage({
  params,
}: {
  params: Promise<{ id: string; shelfId: string }>;
}) {
  const { id: warehouseId, shelfId } = await params;

  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.SHELVES.DETAIL}>
      <ShelfDetailView shelfId={shelfId} warehouseId={warehouseId} />
    </ProtectedRoute>
  );
}
