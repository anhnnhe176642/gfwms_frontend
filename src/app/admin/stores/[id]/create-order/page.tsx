'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreateOrderFlow } from '@/components/admin/store-management';
import { ROUTES } from '@/config/routes';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { storeService } from '@/services/store.service';

export default function CreateOrderPage() {
  const router = useRouter();
  const params = useParams();
  const storeId = parseInt(params.id as string);
  const [storeName, setStoreName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const store = await storeService.getStoreById(storeId);
        setStoreName(store.name);
      } catch (error) {
        console.error('Failed to fetch store:', error);
        router.push(`/admin/stores/${storeId}/fabrics`);
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [storeId, router]);

  const handleGoBack = () => {
    router.push(`/admin/stores/${storeId}/fabrics`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
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
            <h1 className="text-3xl font-bold tracking-tight">Tạo đơn hàng mới</h1>
            <p className="text-muted-foreground mt-1">
              Tạo đơn hàng tại cửa hàng {storeName}
            </p>
          </div>
        </div>

        {/* Content Card */}
        <Card>
          <CardHeader>
            <CardTitle>Bước 1: Chọn vải</CardTitle>
            <CardDescription>
              Chọn các loại vải và nhập số lượng muốn bán
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateOrderFlow
              storeId={storeId}
              storeName={storeName}
              initialParams={{
                page: 1,
                limit: 10,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
