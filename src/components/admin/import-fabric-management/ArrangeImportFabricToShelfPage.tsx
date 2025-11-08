'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigation } from '@/hooks/useNavigation';
import { importFabricService } from '@/services/importFabric.service';
import { getServerErrorMessage } from '@/lib/errorHandler';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { ImportFabricItemCard } from './ImportFabricItemCard';
import type { ImportFabricFullDetail, ImportFabricStatus } from '@/types/importFabric';

export interface ArrangeImportFabricToShelfPageProps {
  warehouseId: string | number;
  importId: string | number;
}

/**
 * Page xếp vải vào kệ
 * 
 * Cho phép phân bổ các mục vải từ phiếu nhập vào các kệ trong kho
 * - Chỉ cho phép xếp khi trạng thái là PENDING
 * - Mỗi item vải được xử lý độc lập với fabricId làm unique key
 */
export function ArrangeImportFabricToShelfPage({
  warehouseId,
  importId,
}: ArrangeImportFabricToShelfPageProps) {
  const { handleGoBack } = useNavigation();
  const [importFabric, setImportFabric] = useState<ImportFabricFullDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load import fabric detail
  useEffect(() => {
    const loadImportFabric = async () => {
      try {
        setLoading(true);
        setError('');

        const importData = await importFabricService.getImportFabricDetail(Number(importId));
        setImportFabric(importData.data);
      } catch (err) {
        const message = getServerErrorMessage(err);
        setError(message || 'Có lỗi khi tải dữ liệu');
        toast.error(message || 'Có lỗi khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    loadImportFabric();
  }, [importId]);

  // Kiểm tra khi phiếu nhập được load lần đầu hoặc thay đổi
  useEffect(() => {
    if (!importFabric || importFabric.status !== 'PENDING') {
      return;
    }

    // Kiểm tra xem tất cả items đã được phân bổ hay chưa
    const allItemsAllocated = importFabric.importItems.every((item) => item.status === 'STORED');

    if (allItemsAllocated) {
      // Tất cả items đã được phân bổ, tự động cập nhật status phiếu nhập
      const updateStatus = async () => {
        try {
          await importFabricService.updateImportFabricStatus(Number(importId), {
            status: 'COMPLETED',
          });

          toast.success('Tất cả vải đã được xếp lên kệ. Phiếu nhập đã hoàn thành!');

          // Reload lại data để hiển thị status mới
          const updatedData = await importFabricService.getImportFabricDetail(Number(importId));
          setImportFabric(updatedData.data);
        } catch (err) {
          console.error('Error updating import fabric status:', err);
        }
      };

      updateStatus();
    }
  }, [importFabric, importId]);

  // Kiểm tra xem có thể xếp vải hay không (chỉ khi trạng thái là PENDING)
  const canAllocate = (status: ImportFabricStatus) => {
    return status === 'PENDING';
  };

  // Callback khi xếp một item thành công
  const handleItemSuccess = () => {
    // Reload data để cập nhật trạng thái
    const loadImportFabric = async () => {
      try {
        const importData = await importFabricService.getImportFabricDetail(Number(importId));
        setImportFabric(importData.data);

        // Kiểm tra xem tất cả items đã được phân bổ hay chưa
        const allItemsAllocated = importData.data.importItems.every(
          (item) => item.status === 'STORED'
        );

        if (allItemsAllocated) {
          // Tất cả items đã được phân bổ, tự động cập nhật status phiếu nhập
          await importFabricService.updateImportFabricStatus(Number(importId), {
            status: 'COMPLETED',
          });

          toast.success('Tất cả vải đã được xếp lên kệ. Phiếu nhập đã hoàn thành!');

          // Reload lại data để hiển thị status mới
          const updatedData = await importFabricService.getImportFabricDetail(Number(importId));
          setImportFabric(updatedData.data);
        }
      } catch (err) {
        console.error('Error reloading import fabric:', err);
      }
    };
    loadImportFabric();
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" disabled className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground dark:text-slate-100">Xếp vải vào kệ</h1>
            <p className="text-muted-foreground dark:text-slate-400 mt-1">Phân bổ các mục vải vào kệ trong kho</p>
          </div>
        </div>

        <Card>
          <CardContent className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground dark:text-slate-400">Đang tải...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !importFabric) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleGoBack} className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground dark:text-slate-100">Xếp vải vào kệ</h1>
            <p className="text-muted-foreground dark:text-slate-400 mt-1">Phân bổ các mục vải vào kệ trong kho</p>
          </div>
        </div>

        <Card>
          <CardContent className="flex justify-center items-center h-64">
            <div className="text-center">
              <p className="text-red-500 dark:text-red-400 mb-2">{error || 'Không tìm thấy dữ liệu'}</p>
              <Button onClick={handleGoBack} variant="outline">
                Quay lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isNotPending = !canAllocate(importFabric.status);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleGoBack} className="h-9 w-9">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground dark:text-slate-100">Xếp vải vào kệ</h1>
          <p className="text-muted-foreground dark:text-slate-400 mt-1">Phân bổ các mục vải vào kệ trong kho</p>
        </div>
      </div>

      {/* Status warning */}
      {isNotPending && (
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
          <CardContent className="pt-6">
            <p className="text-sm text-green-800 dark:text-green-300">
               Phiếu nhập này đã được xếp lên kệ!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      <div className="space-y-6">
        {/* Import Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin phiếu nhập</CardTitle>
            <CardDescription>Chi tiết của phiếu nhập kho</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground dark:text-slate-400">Mã phiếu nhập</p>
                <p className="text-lg font-medium text-foreground dark:text-slate-100">#{importFabric.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground dark:text-slate-400">Kho</p>
                <p className="text-lg font-medium text-foreground dark:text-slate-100">{importFabric.warehouse.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground dark:text-slate-400">Ngày nhập</p>
                <p className="text-lg font-medium text-foreground dark:text-slate-100">
                  {new Date(importFabric.importDate).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground dark:text-slate-400">Người nhập</p>
                <p className="text-lg font-medium text-foreground dark:text-slate-100">{importFabric.importUser.fullname}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground dark:text-slate-400">Tổng giá trị</p>
                <p className="text-lg font-medium text-foreground dark:text-slate-100">
                  {importFabric.totalPrice.toLocaleString('vi-VN')} ₫
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground dark:text-slate-400">Trạng thái</p>
                <p className="text-lg font-medium text-foreground dark:text-slate-100">
                  {importFabric.status === 'PENDING'
                    ? 'Chờ xử lý'
                    : importFabric.status === 'COMPLETED'
                      ? 'Hoàn thành'
                      : 'Đã hủy'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Import Items Card */}
        {!isNotPending && (
          <Card>
            <CardHeader>
              <CardTitle>Danh sách vải</CardTitle>
              <CardDescription>
                Các mục vải cần xếp vào kệ ({importFabric.importItems.length} mục)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-6">
                {importFabric.importItems.map((item, itemIndex) => (
                  <ImportFabricItemCard
                    key={item.fabricId}
                    item={item}
                    itemIndex={itemIndex}
                    warehouseId={Number(warehouseId)}
                    onSuccess={handleItemSuccess}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline" onClick={handleGoBack}>
            Quay lại
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ArrangeImportFabricToShelfPage;
