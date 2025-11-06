'use client';

import { use } from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { EditFabricCategoryForm } from '@/components/admin/fabric-category-management/EditFabricCategoryForm';
import { ROUTES } from '@/config/routes';

export default function EditFabricCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.FABRICS.CATEGORIES_EDIT}>
      <div className="container mx-auto py-8 px-4">
        <EditFabricCategoryForm categoryId={id} />
      </div>
    </ProtectedRoute>
  );
}
