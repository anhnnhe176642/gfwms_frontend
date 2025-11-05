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
import { ShelfManagementTable } from './ShelfManagementTable';

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
          <h1 className="text-3xl font-bold tracking-tight">Chi tiết kho</h1>
          <p className="text-muted-foreground mt-1">Xem thông tin kho hàng</p>
        </div>
      </div>

      {/* Main Information Card - Full Width - Compact */}
      <Card className="py-3">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Thông tin cơ bản</CardTitle>
              <CardDescription className="text-xs">Thông tin chính của kho hàng</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleGoBack}
                size="sm"
              >
                Quay lại
              </Button>
              <Button onClick={handleEdit} className="gap-2" size="sm">
                <Edit className="h-4 w-4" />
                Chỉnh sửa
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* ID & Status - First Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">ID Kho</p>
              <p className="text-sm font-semibold">{warehouse.id}</p>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground">Trạng thái</p>
              <div className="mt-1">
                <Badge value={warehouse.status} config={WAREHOUSE_STATUS_CONFIG} />
              </div>
            </div>

            <div className="md:col-span-2">
              <p className="text-xs font-medium text-muted-foreground">Ngày tạo</p>
              <p className="text-xs">{new Date(warehouse.createdAt).toLocaleString('vi-VN')}</p>
            </div>
          </div>

          {/* Name - Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Tên kho</p>
              <p className="text-sm">{warehouse.name}</p>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground">Ngày cập nhật</p>
              <p className="text-xs">{new Date(warehouse.updatedAt).toLocaleString('vi-VN')}</p>
            </div>
          </div>

          {/* Address - Third Row */}
          <div>
            <p className="text-xs font-medium text-muted-foreground">Địa chỉ</p>
            <p className="text-sm break-words">{warehouse.address}</p>
          </div>
        </CardContent>
      </Card>

      {/* Shelf Table - Below information card */}
      <ShelfManagementTable warehouseId={Number(warehouse.id)} />
    </div>
  );
}

export default WarehouseDetailView;
