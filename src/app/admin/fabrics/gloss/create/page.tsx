'use client';

import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { CreateFabricGlossForm } from '@/components/admin/fabric-gloss-management';
import { ROUTES } from '@/config/routes';

export default function CreateFabricGlossPage() {
  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.FABRICS.GLOSS_CREATE}>
      <div className="container mx-auto py-8 px-4">
        <CreateFabricGlossForm />
      </div>
    </ProtectedRoute>
  );
}
