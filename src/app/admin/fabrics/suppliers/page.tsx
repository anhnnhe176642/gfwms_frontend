'use client';

import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { SupplierManagementTable } from '@/components/admin/supplier-management';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';
import { useRouteAccess } from '@/hooks/useRouteAccess';
import { Plus } from 'lucide-react';

export default function SuppliersPage() {
  const router = useRouter();
  const { canAccess } = useRouteAccess();

  const handleCreateSupplier = () => {
    router.push('/admin/fabrics/suppliers/create');
  };

  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.FABRICS.SUPPLIERS}>
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle>Quản lý nhà cung cấp</CardTitle>
              <CardDescription>
                Quản lý danh sách nhà cung cấp vải trong hệ thống
              </CardDescription>
            </div>
            {canAccess(ROUTES.ADMIN.FABRICS.SUPPLIERS) && (
              <Button onClick={handleCreateSupplier} className="gap-2">
                <Plus className="h-4 w-4" />
                Tạo nhà cung cấp mới
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <SupplierManagementTable initialParams={{
              page: 1,
              limit: 10,
            }} />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
