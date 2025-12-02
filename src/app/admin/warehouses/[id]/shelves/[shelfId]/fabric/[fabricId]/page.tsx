import { Metadata } from 'next';
import FabricShelfDetailView from '@/components/admin/warehouse-management/FabricShelfDetailView';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Chi tiết vải trong kệ | GFWMS',
  description: 'Xem thông tin chi tiết vải trong kệ',
};

interface FabricShelfDetailPageProps {
  params: Promise<{
    id: string;
    shelfId: string;
    fabricId: string;
  }>;
}

export default async function FabricShelfDetailPage({ params }: FabricShelfDetailPageProps) {
  const { id: warehouseId, shelfId, fabricId } = await params;
  
  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.SHELVES.DETAIL}>
      <FabricShelfDetailView
        warehouseId={warehouseId}
        shelfId={shelfId}
        fabricId={fabricId}
      />
    </ProtectedRoute>
  );
}
