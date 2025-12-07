'use client';

import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StoreFabricManagementTable } from '@/components/admin/store-management/StoreFabricManagement';
import { ROUTES } from '@/config/routes';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';

export default function StoreFabricsPage() {
  const router = useRouter();
  const params = useParams();
  const storeId = params.id as string;

  const handleGoBack = () => {
    router.push(`/admin/stores/${storeId}`);
  };

  const handleViewFabricDetail = (fabricId: number) => {
    router.push(`/admin/stores/${storeId}/fabrics/${fabricId}`);
  };

  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.STORES.LIST}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleGoBack}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Danh sách vải trong cửa hàng</h1>
            <p className="text-muted-foreground mt-1">
              Quản lý các loại vải có sẵn trong cửa hàng
            </p>
          </div>
        </div>

        {/* Content Card */}
        <Card>
          <CardHeader>
            <CardTitle>Vải có sẵn</CardTitle>
            <CardDescription>
              Danh sách chi tiết các loại vải và tồn kho hiện có
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StoreFabricManagementTable 
              storeId={storeId}
              initialParams={{
                page: 1,
                limit: 10,
              }}
              onViewDetail={handleViewFabricDetail}
            />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
