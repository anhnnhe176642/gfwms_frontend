'use client';

import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { StoreDetailView } from '@/components/admin/store-management';
import { ROUTES } from '@/config/routes';
import { useParams } from 'next/navigation';

export default function StoreDetailPage() {
  const params = useParams();
  const storeId = params.id as string;

  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.STORES.DETAIL}>
      <div className="container mx-auto py-8 px-4">
        <StoreDetailView storeId={storeId} />
      </div>
    </ProtectedRoute>
  );
}
