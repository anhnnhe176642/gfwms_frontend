'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { warehouseService } from '@/services/warehouse.service';
import { getServerErrorMessage } from '@/lib/errorHandler';
import { ArrowLeft, RefreshCw, Edit } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';
import type { ShelfDetail, WarehouseListItem } from '@/types/warehouse';
import { FabricShelfCard } from '@/components/admin/warehouse-management/FabricShelfCard';
import { EditShelfForm } from '@/components/admin/warehouse-management/EditShelfForm';

export interface ShelfDetailViewProps {
  shelfId: string | number;
  warehouseId?: string | number;
  onEdit?: (shelfId: number) => void;
}

export function ShelfDetailView({ shelfId, warehouseId, onEdit }: ShelfDetailViewProps) {
  const router = useRouter();
  const { handleGoBack } = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [shelf, setShelf] = useState<ShelfDetail | null>(null);
  const [warehouse, setWarehouse] = useState<WarehouseListItem | null>(null);
  const [error, setError] = useState('');
  const [editShelfOpen, setEditShelfOpen] = useState(false);

  // Fetch shelf data
  useEffect(() => {
    const fetchShelf = async () => {
      try {
        setIsLoading(true);
        setError('');
        const data = await warehouseService.getShelfById(shelfId);
        setShelf(data);
        
        // Fetch warehouse info
        if (data.warehouseId) {
          try {
            const warehouseData = await warehouseService.getWarehouseById(data.warehouseId);
            setWarehouse(warehouseData);
          } catch (err) {
            console.error('Failed to fetch warehouse:', err);
          }
        }
      } catch (err) {
        const message = getServerErrorMessage(err) || 'Không thể tải dữ liệu kệ';
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShelf();
  }, [shelfId]);

  const handleEdit = () => {
    if (onEdit && shelf) {
      onEdit(shelf.id);
    } else if (shelf) {
      setEditShelfOpen(true);
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

  if (error || !shelf) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error || 'Không tìm thấy kệ'}</p>
          <Button onClick={handleGoBack} variant="outline">
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  // Calculate capacity percentage
  const capacityPercentage = (shelf.currentQuantity / shelf.maxQuantity) * 100;

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
          <h1 className="text-3xl font-bold tracking-tight">Chi tiết kệ</h1>
          <p className="text-muted-foreground mt-1">Xem thông tin kệ và các loại vải</p>
        </div>
      </div>

      {/* Main Information Card */}
      <Card className="py-3">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Thông tin cơ bản</CardTitle>
              <CardDescription className="text-xs">Thông tin chính của kệ hàng</CardDescription>
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
        <CardContent className="space-y-4">
          {/* ID & Warehouse ID - First Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            <div>
              <p className="text-xs font-medium text-muted-foreground">Mã kệ</p>
              <p className="text-sm font-semibold">{shelf.code}</p>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground">Tên kho</p>
              <p className="text-sm">{warehouse?.name || 'Đang tải...'}</p>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground">Ngày tạo</p>
              <p className="text-xs">{new Date(shelf.createdAt).toLocaleString('vi-VN')}</p>
            </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Ngày cập nhật</p>
            <p className="text-xs">{new Date(shelf.updatedAt).toLocaleString('vi-VN')}</p>
          </div>
          </div>

          {/* Capacity Information */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Công suất sử dụng</p>
              <span className="text-sm font-semibold">
                {shelf.currentQuantity} / {shelf.maxQuantity} ({capacityPercentage.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
              <div 
                className="bg-primary h-full transition-all"
                style={{ width: `${capacityPercentage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fabrics in Shelf Section */}
      <Card className="py-3">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">
            Các loại vải trong kệ ({shelf.fabricShelf.length})
          </CardTitle>
          <CardDescription className="text-xs">
            Danh sách các loại vải đang được lưu trữ trong kệ này
          </CardDescription>
        </CardHeader>
        <CardContent>
          {shelf.fabricShelf.length === 0 ? (
            <div className="flex justify-center items-center h-40">
              <div className="text-center">
                <p className="text-muted-foreground">Kệ này không có vải nào</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shelf.fabricShelf.map((fabricItem) => (
                <FabricShelfCard
                  key={fabricItem.fabricId}
                  fabricItem={fabricItem}
                  shelfCapacity={shelf.maxQuantity}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Shelf Form Dialog */}
      {shelf && warehouseId && (
        <EditShelfForm
          shelf={shelf}
          warehouseId={Number(warehouseId)}
          open={editShelfOpen}
          onOpenChange={setEditShelfOpen}
          onSuccess={() => {
            setEditShelfOpen(false);
            // Reload shelf data without full page reload
            const fetchShelf = async () => {
              try {
                const data = await warehouseService.getShelfById(shelfId);
                setShelf(data);
              } catch (err) {
                const message = getServerErrorMessage(err) || 'Không thể tải lại dữ liệu kệ';
                toast.error(message);
              }
            };
            fetchShelf();
          }}
        />
      )}
    </div>
  );
}

export default ShelfDetailView;
