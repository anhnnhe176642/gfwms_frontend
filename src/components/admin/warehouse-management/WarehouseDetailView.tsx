'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { warehouseService } from '@/services/warehouse.service';
import { getServerErrorMessage } from '@/lib/errorHandler';
import { ArrowLeft, RefreshCw, Edit } from 'lucide-react';
import type { WarehouseListItem } from '@/types/warehouse';
import { WAREHOUSE_STATUS_CONFIG } from '@/constants/warehouse';

export interface WarehouseDetailViewProps {
  warehouseId: string | number;
  onEdit?: (warehouseId: number) => void;
}

export function WarehouseDetailView({ warehouseId, onEdit }: WarehouseDetailViewProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [warehouse, setWarehouse] = useState<WarehouseListItem | null>(null);
  const [error, setError] = useState('');

  // Fetch warehouse data
  useEffect(() => {
    const fetchWarehouse = async () => {
      try {
        setIsLoading(true);
        setError('');
        const data = await warehouseService.getWarehouseById(warehouseId);
        setWarehouse(data);
      } catch (err) {
        const message = getServerErrorMessage(err) || 'Không thể tải dữ liệu kho';
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWarehouse();
  }, [warehouseId]);

  const handleGoBack = () => {
    router.back();
  };

  const handleEdit = () => {
    if (onEdit && warehouse) {
      onEdit(warehouse.id);
    } else if (warehouse) {
      router.push(`/admin/warehouses/${warehouse.id}/edit`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          <p className="text-gray-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !warehouse) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error || 'Không tìm thấy kho'}</p>
          <Button onClick={handleGoBack} variant="outline">
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
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
          <h1 className="text-3xl font-bold tracking-tight">Chi tiết kho</h1>
          <p className="text-muted-foreground mt-1">Xem thông tin kho hàng</p>
        </div>
      </div>

      {/* Main Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cơ bản</CardTitle>
          <CardDescription>Thông tin chính của kho hàng</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* ID & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">ID Kho</p>
              <p className="text-lg font-semibold">{warehouse.id}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Trạng thái</p>
              <div>
                <Badge value={warehouse.status} config={WAREHOUSE_STATUS_CONFIG} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Name */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Tên kho</p>
            <p className="text-lg">{warehouse.name}</p>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Địa chỉ</p>
            <p className="text-lg">{warehouse.address}</p>
          </div>

          <Separator />

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Ngày tạo</p>
              <p className="text-sm">{new Date(warehouse.createdAt).toLocaleString('vi-VN')}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Ngày cập nhật</p>
              <p className="text-sm">{new Date(warehouse.updatedAt).toLocaleString('vi-VN')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        <Button
          variant="outline"
          onClick={handleGoBack}
        >
          Quay lại
        </Button>
        <Button onClick={handleEdit} className="gap-2">
          <Edit className="h-4 w-4" />
          Chỉnh sửa
        </Button>
      </div>
    </div>
  );
}

export default WarehouseDetailView;
