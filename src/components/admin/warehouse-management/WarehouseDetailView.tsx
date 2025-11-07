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
import { ArrowLeft, RefreshCw, Edit, Loader } from 'lucide-react';
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
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-2">
          <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error || !warehouse) {
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
            <h1 className="text-3xl font-bold tracking-tight">Chi tiết kho</h1>
          </div>
        </div>

        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
          {error || 'Không tìm thấy kho'}
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
            <h1 className="text-3xl font-bold tracking-tight">{warehouse.name}</h1>
            <p className="text-muted-foreground mt-1">Chi tiết kho hàng</p>
          </div>
        </div>
        <Button onClick={handleEdit} className="gap-2">
          <Edit className="h-4 w-4" />
          Chỉnh sửa
        </Button>
      </div>

      {/* Main Information Card - Full Width - Compact */}
      <Card className="py-3">
        <CardHeader className="pb-3">
          <div>
            <CardTitle>Thông tin cơ bản</CardTitle>
            <CardDescription>Thông tin chính của kho hàng</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ID & Status - First Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">ID Kho</p>
              <p className="text-base font-semibold">{warehouse.id}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Trạng thái</p>
              <div className="mt-1">
                <Badge value={warehouse.status} config={WAREHOUSE_STATUS_CONFIG} />
              </div>
            </div>
          </div>

          {/* Name */}
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Tên kho</p>
            <p className="text-base font-semibold">{warehouse.name}</p>
          </div>

          {/* Address */}
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Địa chỉ</p>
            <p className="text-base break-word">{warehouse.address}</p>
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
              {new Date(warehouse.createdAt).toLocaleString('vi-VN')}
            </p>
          </div>

          {/* Updated At */}
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Ngày cập nhật lần cuối</p>
            <p className="text-base font-semibold">
              {new Date(warehouse.updatedAt).toLocaleString('vi-VN')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end pb-8">
        <Button variant="outline" onClick={handleGoBack}>
          Quay lại
        </Button>
        <Button onClick={handleEdit} className="gap-2">
          <Edit className="h-4 w-4" />
          Chỉnh sửa kho
        </Button>
      </div>
    </div>
  );
}

export default WarehouseDetailView;
