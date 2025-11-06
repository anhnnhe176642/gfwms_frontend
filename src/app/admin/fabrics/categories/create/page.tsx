'use client';

import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { CreateFabricCategoryForm } from '@/components/admin/fabric-category-management/CreateFabricCategoryForm';
import { ROUTES } from '@/config/routes';

export default function CreateFabricCategoryPage() {
  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.FABRICS.CATEGORIES_CREATE}>
      <div className="container mx-auto py-8 px-4">
        <CreateFabricCategoryForm />
      </div>
    </ProtectedRoute>
  );
}
