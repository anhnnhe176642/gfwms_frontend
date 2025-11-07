'use client';

import { use } from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { FabricGlossDetailView } from '@/components/admin/fabric-gloss-management';
import { ROUTES } from '@/config/routes';

export default function FabricGlossDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.FABRICS.GLOSS_DETAIL}>
      <div className="container mx-auto py-8 px-4 max-w-3xl">
        <FabricGlossDetailView glossId={id} />
      </div>
    </ProtectedRoute>
  );
}
