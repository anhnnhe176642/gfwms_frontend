'use client';

import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { FabricCategoryManagementTable } from '@/components/admin/fabric-category-management';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';
import { useRouteAccess } from '@/hooks/useRouteAccess';
import { Plus } from 'lucide-react';

export default function FabricCategoriesPage() {
  const router = useRouter();
  const { canAccess } = useRouteAccess();

  const handleCreateCategory = () => {
    router.push('/admin/fabrics/categories/create');
  };

  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.FABRICS.CATEGORIES}>
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle>Quản lý danh mục vải</CardTitle>
              <CardDescription>
                Quản lý danh mục và thông tin giá bán vải
              </CardDescription>
            </div>
            {canAccess(ROUTES.ADMIN.FABRICS.CATEGORIES_CREATE) && (
              <Button onClick={handleCreateCategory} className="gap-2">
                <Plus className="h-4 w-4" />
                Tạo danh mục mới
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <FabricCategoryManagementTable initialParams={{
              page: 1,
              limit: 10,
            }} />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
