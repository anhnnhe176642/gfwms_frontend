'use client';

import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { CreateStoreForm } from '@/components/admin/store-management';
import { ROUTES } from '@/config/routes';

export default function CreateStorePage() {
  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.STORES.CREATE}>
      <div className="container mx-auto py-8 px-4">
        <CreateStoreForm />
      </div>
    </ProtectedRoute>
  );
}
