'use client';

import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { StoreManagementTable } from '@/components/admin/store-management';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';
import { useRouteAccess } from '@/hooks/useRouteAccess';
import { Plus } from 'lucide-react';

export default function StoresPage() {
  const router = useRouter();
  const { canAccess } = useRouteAccess();

  const handleCreateStore = () => {
    router.push('/admin/stores/create');
  };

  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.STORES.LIST}>
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle>Quản lý cửa hàng</CardTitle>
              <CardDescription>
                Quản lý thông tin cửa hàng trong hệ thống
              </CardDescription>
            </div>
            {canAccess(ROUTES.ADMIN.STORES.CREATE) && (
              <Button onClick={handleCreateStore} className="gap-2">
                <Plus className="h-4 w-4" />
                Tạo cửa hàng mới
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <StoreManagementTable initialParams={{
              page: 1,
              limit: 10,
            }} />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
