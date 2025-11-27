'use client';

import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { ExportFabricListTable } from '@/components/admin/store-management/ExportFabricListTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';
import { useRouteAccess } from '@/hooks/useRouteAccess';
import { Plus } from 'lucide-react';

export default function ExportFabricsPage() {
  const router = useRouter();
  const { canAccess } = useRouteAccess();

  const handleCreateExportFabric = () => {
    router.push('/admin/warehouses');
  };

  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.EXPORT_FABRICS.LIST}>
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle>Quản lí yêu cầu xuất kho</CardTitle>
              <CardDescription>
                Danh sách các phiếu yêu cầu xuất vải từ kho đến cửa hàng
              </CardDescription>
            </div>
            {canAccess(ROUTES.ADMIN.EXPORT_FABRICS.LIST) && (
              <Button 
                onClick={handleCreateExportFabric} 
                className="gap-2"
                variant="default"
              >
                <Plus className="h-4 w-4" />
                Tạo phiếu xuất
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <ExportFabricListTable initialParams={{
              page: 1,
              limit: 10,
            }} />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
