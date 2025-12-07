'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, AlertCircle, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExportFabricListTable } from '@/components/admin/store-management/ExportFabricListTable';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { ROUTES } from '@/config/routes';
import { storeService } from '@/services/store.service';
import { getServerErrorMessage } from '@/lib/errorHandler';
import { useAuth } from '@/hooks/useAuth';
import { PERMISSIONS } from '@/constants/permissions';
import type { StoreListItem } from '@/types/store';

export default function StoreExportRequestsPage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.id as string;
  const { hasPermission } = useAuth();

  const [store, setStore] = useState<StoreListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await storeService.getStoreById(storeId);
        setStore(data);
      } catch (err) {
        const errorMessage = getServerErrorMessage(err) || 'Không thể tải thông tin cửa hàng';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [storeId]);

  const handleGoBack = () => {
    router.push(`/admin/stores/${storeId}`);
  };

  const handleCreateExportRequest = () => {
    router.push(`/admin/stores/${storeId}/export-request`);
  };

  if (loading) {
    return (
      <ProtectedRoute routeConfig={ROUTES.ADMIN.STORES.LIST}>
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <p className="text-gray-500">Đang tải...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !store) {
    return (
      <ProtectedRoute routeConfig={ROUTES.ADMIN.STORES.LIST}>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-red-500 mb-4">{error || 'Không tìm thấy cửa hàng'}</p>
            <Button onClick={handleGoBack} variant="outline">
              Quay lại
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

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
            <h1 className="text-3xl font-bold tracking-tight">Yêu cầu xuất kho</h1>
            <p className="text-muted-foreground mt-1">
              Danh sách các phiếu yêu cầu xuất vải đến cửa hàng {store.name}
            </p>
          </div>
        </div>

        {/* Export Fabric List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle>Danh sách phiếu xuất</CardTitle>
              <CardDescription>
                Các yêu cầu xuất kho cho cửa hàng này
              </CardDescription>
            </div>
            {hasPermission(PERMISSIONS.EXPORT_FABRICS.CREATE.key) && (
              <Button 
                onClick={handleCreateExportRequest}
                className="gap-2"
                variant="default"
              >
                <Plus className="h-4 w-4" />
                Tạo phiếu xuất
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <ExportFabricListTable
              initialParams={{
                page: 1,
                limit: 10,
                storeId: parseInt(storeId),
              }}
              hideWarehouseColumn={false}
              storeId={storeId}
              hideStoreColumn={true}
            />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
