'use client';

import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { WarehouseManagementTable } from '@/components/admin/warehouse-management';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';
import { useRouteAccess } from '@/hooks/useRouteAccess';
import { Plus } from 'lucide-react';

export default function WarehousesPage() {
  const router = useRouter();
  const { canAccess } = useRouteAccess();

  const handleCreateWarehouse = () => {
    router.push('/admin/warehouses/create');
  };

  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.WAREHOUSES.LIST}>
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle>Quản lý kho</CardTitle>
              <CardDescription>
                Quản lý thông tin kho hàng trong hệ thống
              </CardDescription>
            </div>
            {canAccess(ROUTES.ADMIN.WAREHOUSES.CREATE) && (
              <Button onClick={handleCreateWarehouse} className="gap-2">
                <Plus className="h-4 w-4" />
                Tạo kho mới
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <WarehouseManagementTable initialParams={{
              page: 1,
              limit: 10,
            }} />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
