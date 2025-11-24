'use client';

import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { EditStoreForm } from '@/components/admin/store-management';
import { ROUTES } from '@/config/routes';
import { useParams } from 'next/navigation';

export default function EditStoreEditPage() {
  const params = useParams();
  const storeId = params.id as string;

  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.STORES.EDIT}>
      <div className="container mx-auto py-8 px-4">
        <EditStoreForm storeId={storeId} />
      </div>
    </ProtectedRoute>
  );
}
