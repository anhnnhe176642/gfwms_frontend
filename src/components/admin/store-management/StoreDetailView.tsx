'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { storeService } from '@/services/store.service';
import { getServerErrorMessage } from '@/lib/errorHandler';
import { ArrowLeft, Edit, Loader, Truck } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';
import { useAuth } from '@/hooks/useAuth';
import { PERMISSIONS } from '@/constants/permissions';
import type { StoreListItem } from '@/types/store';
import { STORE_ACTIVE_STATUS_CONFIG } from '@/constants/store';

export interface StoreDetailViewProps {
  storeId: string | number;
  onEdit?: (storeId: number) => void;
}

export function StoreDetailView({ storeId, onEdit }: StoreDetailViewProps) {
  const router = useRouter();
  const { handleGoBack } = useNavigation();
  const { hasPermission } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [store, setStore] = useState<StoreListItem | null>(null);
  const [error, setError] = useState('');

  // Fetch store data
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

  const handleEdit = () => {
    if (onEdit && store) {
      onEdit(store.id);
    } else if (store) {
      router.push(`/admin/stores/${store.id}/edit`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-2">
          <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
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
            <h1 className="text-3xl font-bold tracking-tight">Chi tiết cửa hàng</h1>
          </div>
        </div>

        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
          {error || 'Không tìm thấy cửa hàng'}
        </div>

        <Button onClick={handleGoBack} variant="outline">
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
            <h1 className="text-3xl font-bold tracking-tight">{store.name}</h1>
            <p className="text-muted-foreground mt-1">Chi tiết cửa hàng</p>
          </div>
        </div>
        <div className="flex gap-2">
          {hasPermission(PERMISSIONS.EXPORT_FABRICS.VIEW_LIST.key) && (
            <Button 
              onClick={() => router.push(`/admin/stores/${storeId}/export-request`)} 
              variant="outline"
              className="gap-2"
            >
              <Truck className="h-4 w-4" />
              Tạo yêu cầu xuất kho
            </Button>
          )}
          <Button onClick={handleEdit} className="gap-2">
            <Edit className="h-4 w-4" />
            Chỉnh sửa
          </Button>
        </div>
      </div>

      {/* Main Information Card - Full Width - Compact */}
      <Card className="py-3">
        <CardHeader className="pb-3">
          <div>
            <CardTitle>Thông tin cơ bản</CardTitle>
            <CardDescription>Thông tin chính của cửa hàng</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ID & Status - First Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">ID Cửa hàng</p>
              <p className="text-base font-semibold">{store.id}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Trạng thái</p>
              <div className="mt-1">
                <Badge value={store.isActive ? 'true' : 'false'} config={STORE_ACTIVE_STATUS_CONFIG} />
              </div>
            </div>
          </div>

          {/* Name */}
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Tên cửa hàng</p>
            <p className="text-base font-semibold">{store.name}</p>
          </div>

          {/* Address */}
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Địa chỉ</p>
            <p className="text-base break-word">{store.address}</p>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin thời gian</CardTitle>
          <CardDescription>Ngày tạo và cập nhật</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Created At */}
          <div>
            <p className="text-sm font-medium text-muted-foreground">Ngày tạo</p>
            <p className="text-base font-semibold">
              {new Date(store.createdAt).toLocaleString('vi-VN')}
            </p>
          </div>

          {/* Updated At */}
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Ngày cập nhật lần cuối</p>
            <p className="text-base font-semibold">
              {new Date(store.updatedAt).toLocaleString('vi-VN')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end pb-8">
        <Button variant="outline" onClick={handleGoBack}>
          Quay lại
        </Button>
        {hasPermission(PERMISSIONS.EXPORT_FABRICS.VIEW_LIST.key) && (
          <Button 
            onClick={() => router.push(`/admin/stores/${storeId}/export-request`)} 
            variant="outline"
            className="gap-2"
          >
            <Truck className="h-4 w-4" />
            Tạo yêu cầu xuất kho
          </Button>
        )}
        <Button onClick={handleEdit} className="gap-2">
          <Edit className="h-4 w-4" />
          Chỉnh sửa cửa hàng
        </Button>
      </div>
    </div>
  );
}

export default StoreDetailView;
