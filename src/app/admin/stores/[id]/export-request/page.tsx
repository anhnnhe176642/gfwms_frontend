'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { ExportRequestFlow } from '@/components/admin/store-management/ExportRequestFlow';
import { ROUTES } from '@/config/routes';
import { storeService } from '@/services/store.service';
import { getServerErrorMessage } from '@/lib/errorHandler';
import { Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { StoreListItem } from '@/types/store';

export default function ExportRequestPage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.id as string;
  
  const [store, setStore] = useState<StoreListItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStore = async () => {
      try {
        setIsLoading(true);
        setError('');
        const data = await storeService.getStoreById(storeId);
        setStore(data);
      } catch (err) {
        const message = getServerErrorMessage(err) || 'Không thể tải dữ liệu cửa hàng';
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStore();
  }, [storeId]);

  const handleSuccess = () => {
    router.push(`/admin/stores/${storeId}`);
  };

  if (isLoading) {
    return (
      <ProtectedRoute routeConfig={ROUTES.ADMIN.STORES.DETAIL}>
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center h-96">
            <div className="flex flex-col items-center gap-2">
              <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Đang tải dữ liệu...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !store) {
    return (
      <ProtectedRoute routeConfig={ROUTES.ADMIN.STORES.DETAIL}>
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <p className="text-red-500 mb-2">{error || 'Không tìm thấy cửa hàng'}</p>
              <Button onClick={() => router.back()} variant="outline">
                Quay lại
              </Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.STORES.DETAIL}>
      <div className="container mx-auto py-8 px-4">
        <ExportRequestFlow
          storeId={store.id}
          storeName={store.name}
          onSuccess={handleSuccess}
        />
      </div>
    </ProtectedRoute>
  );
}
