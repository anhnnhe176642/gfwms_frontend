'use client';

import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { FabricManagementTable } from '@/components/admin/fabric-management';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';
import { useRouteAccess } from '@/hooks/useRouteAccess';
import { Plus } from 'lucide-react';

export default function FabricListPage() {
  const router = useRouter();
  const { canAccess } = useRouteAccess();

  const handleCreateFabric = () => {
    router.push('/admin/fabrics/create');
  };

  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.FABRICS.LIST}>
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle>Quản lý vải</CardTitle>
              <CardDescription>
                Quản lý danh sách sản phẩm vải trong kho
              </CardDescription>
            </div>
            {canAccess(ROUTES.ADMIN.FABRICS.CREATE) && (
              <Button onClick={handleCreateFabric} className="gap-2">
                <Plus className="h-4 w-4" />
                Tạo vải mới
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <FabricManagementTable />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
