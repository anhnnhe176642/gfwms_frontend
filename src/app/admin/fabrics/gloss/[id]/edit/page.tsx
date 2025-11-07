'use client';

import { use } from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { EditFabricGlossForm } from '@/components/admin/fabric-gloss-management';
import { ROUTES } from '@/config/routes';

export default function EditFabricGlossPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.FABRICS.GLOSS_EDIT}>
      <div className="container mx-auto py-8 px-4">
        <EditFabricGlossForm glossId={id} />
      </div>
    </ProtectedRoute>
  );
}
