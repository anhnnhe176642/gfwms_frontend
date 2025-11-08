'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigation } from '@/hooks/useNavigation';
import { importFabricService } from '@/services/importFabric.service';
import { getServerErrorMessage } from '@/lib/errorHandler';
import { ArrowLeft, Loader2 } from 'lucide-react';
import type { ImportFabricFullDetail } from '@/types/importFabric';

export interface ArrangeImportFabricToShelfPageProps {
  warehouseId: string | number;
  importId: string | number;
}

/**
 * Page xếp vải vào kệ
 * 
 * Template layout - chưa implement logic
 * TODO:
 * - Lấy dữ liệu phiếu nhập
 * - Hiển thị danh sách mục vải từ phiếu nhập
 * - Cho phép chọn kệ cho từng mục
 * - Gửi request để lưu
 */
export function ArrangeImportFabricToShelfPage({
  warehouseId,
  importId,
}: ArrangeImportFabricToShelfPageProps) {
  const router = useRouter();
  const { handleGoBack } = useNavigation();
  const [importFabric, setImportFabric] = useState<ImportFabricFullDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load import fabric detail
  useEffect(() => {
    const loadImportFabric = async () => {
      try {
        setLoading(true);
        const data = await importFabricService.getImportFabricDetail(Number(importId));
        setImportFabric(data.data);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Implement arrange shelf logic
      toast.success('Xếp vải vào kệ thành công');
      router.push(`/admin/warehouses/${warehouseId}/import-fabrics`);
    } catch (err) {
      const message = getServerErrorMessage(err);
      toast.error(message || 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            disabled={true}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Xếp vải vào kệ</h1>
            <p className="text-muted-foreground mt-1">Phân bổ các mục vải vào kệ trong kho</p>
          </div>
        </div>

        <Card>
          <CardContent className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Đang tải...</p>
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
          <Button
            variant="ghost"
            size="icon"
            onClick={handleGoBack}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Xếp vải vào kệ</h1>
            <p className="text-muted-foreground mt-1">Phân bổ các mục vải vào kệ trong kho</p>
          </div>
        </div>

        <Card>
          <CardContent className="flex justify-center items-center h-64">
            <div className="text-center">
              <p className="text-red-500 mb-2">{error || 'Không tìm thấy dữ liệu'}</p>
              <Button onClick={handleGoBack} variant="outline">
                Quay lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleGoBack}
          disabled={isSubmitting}
          className="h-9 w-9"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Xếp vải vào kệ</h1>
          <p className="text-muted-foreground mt-1">Phân bổ các mục vải vào kệ trong kho</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Import Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin phiếu nhập</CardTitle>
            <CardDescription>Chi tiết của phiếu nhập kho</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Mã phiếu nhập</p>
                <p className="text-lg font-medium">#{importFabric.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Kho</p>
                <p className="text-lg font-medium">{importFabric.warehouse.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ngày nhập</p>
                <p className="text-lg font-medium">
                  {new Date(importFabric.importDate).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Người nhập</p>
                <p className="text-lg font-medium">{importFabric.importUser.fullname}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng giá trị</p>
                <p className="text-lg font-medium">
                  {importFabric.totalPrice.toLocaleString('vi-VN')} ₫
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Import Items Card */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách vải</CardTitle>
            <CardDescription>Các mục vải cần xếp vào kệ ({importFabric.importItems.length} mục)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {importFabric.importItems.map((item, index) => (
                <div key={item.importFabricId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">Mục {index + 1}</h3>
                    <span className="text-sm text-muted-foreground">ID: {item.importFabricId}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Loại vải</p>
                      <p className="font-medium">{item.fabric.category.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Màu sắc</p>
                      <p className="font-medium">{item.fabric.color.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Độ bóng</p>
                      <p className="font-medium">{item.fabric.gloss.description}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Nhà cung cấp</p>
                      <p className="font-medium">{item.fabric.supplier.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Số lượng</p>
                      <p className="font-medium">{item.quantity}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Giá</p>
                      <p className="font-medium">{item.price.toLocaleString('vi-VN')} ₫</p>
                    </div>
                  </div>

                  {/* Shelf selection - TODO */}
                  <div className="mt-4 p-3 bg-muted rounded border border-dashed">
                    <p className="text-sm font-medium text-muted-foreground">
                      Chọn kệ để xếp mục này (TODO)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleGoBack}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Xếp vào kệ
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ArrangeImportFabricToShelfPage;
