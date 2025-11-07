'use client';

import { use } from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { FabricCategoryDetailView } from '@/components/admin/fabric-category-management/FabricCategoryDetailView';
import { ROUTES } from '@/config/routes';

export default function FabricCategoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.FABRICS.CATEGORIES_DETAIL}>
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <FabricCategoryDetailView categoryId={id} />
      </div>
    </ProtectedRoute>
  );
}
