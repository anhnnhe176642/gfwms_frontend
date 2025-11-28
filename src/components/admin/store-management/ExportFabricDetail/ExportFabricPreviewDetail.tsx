'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExportFabricStatusBadge } from '@/components/admin/table/Badges';
import { exportFabricService } from '@/services/exportFabric.service';
import { MultiShelfSelector, type ShelfAllocation } from './MultiShelfSelector';
import type { ExportFabricDetail } from '@/services/exportFabric.service';
import { ArrowLeft, RefreshCw, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { getServerErrorMessage } from '@/lib/errorHandler';

interface ExportFabricPreviewDetailProps {
  warehouseId: number | string;
  exportFabricId: number | string;
}

export function ExportFabricPreviewDetail({ warehouseId, exportFabricId }: ExportFabricPreviewDetailProps) {
  const router = useRouter();
  const [exportFabric, setExportFabric] = useState<ExportFabricDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  // Track shelf allocations for each fabric item
  const [itemAllocations, setItemAllocations] = useState<Record<number, ShelfAllocation[]>>({});

  const fetchPreview = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await exportFabricService.getPreview(exportFabricId);
      setExportFabric(data);

      // Initialize allocations with first shelf suggestion if available
      const initialAllocations: Record<number, ShelfAllocation[]> = {};
      data.exportItems.forEach((item) => {
        const firstShelfId = item.shelfSuggestions?.[0]?.shelfId ?? null;
        initialAllocations[item.fabricId] = [
          {
            id: `${item.fabricId}-0`,
            shelfId: firstShelfId,
            quantityToTake: item.quantity,
          },
        ];
      });
      setItemAllocations(initialAllocations);
    } catch (err: any) {
      const errorMessage = getServerErrorMessage(err) || 'Không thể tải chi tiết phiếu xuất';
      setError(errorMessage);
      console.error('Failed to fetch export fabric preview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreview();
  }, [exportFabricId]);

  const handleAllocationsChange = (fabricId: number, allocations: ShelfAllocation[]) => {
    setItemAllocations((prev) => ({
      ...prev,
      [fabricId]: allocations,
    }));
  };

  const handleApprove = async () => {
    // Validate all items have valid allocations
    const invalidItems = Object.entries(itemAllocations).filter(([, allocations]) => {
      const totalQuantity = allocations.reduce((sum, a) => sum + a.quantityToTake, 0);
      const hasShelfSelected = allocations.every((a) => a.shelfId !== null);
      return !hasShelfSelected || totalQuantity === 0;
    });

    if (invalidItems.length > 0) {
      toast.error('Vui lòng kiểm tra lại phân bổ kệ cho tất cả các mục');
      return;
    }

    try {
      setIsApproving(true);

      // Build itemShelfSelections from allocations
      const itemShelfSelections: Array<{
        fabricId: number;
        shelfId: number;
        quantityToTake: number;
      }> = [];

      Object.entries(itemAllocations).forEach(([fabricIdStr, allocations]) => {
        const fabricId = Number(fabricIdStr);
        allocations.forEach((allocation) => {
          if (allocation.shelfId !== null) {
            itemShelfSelections.push({
              fabricId,
              shelfId: allocation.shelfId,
              quantityToTake: allocation.quantityToTake,
            });
          }
        });
      });

      await exportFabricService.approveExport(exportFabricId, itemShelfSelections);

      toast.success('Phiếu xuất kho đã được duyệt thành công');
      router.back();
    } catch (err: any) {
      const errorMessage = getServerErrorMessage(err) || 'Không thể duyệt phiếu xuất kho';
      toast.error(errorMessage);
      console.error('Failed to approve export fabric:', err);
    } finally {
      setIsApproving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <p className="text-gray-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchPreview} variant="outline">
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  if (!exportFabric) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Không tìm thấy phiếu xuất</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold">Xem trước phiếu xuất #{exportFabric.id}</h1>
        </div>
        <Button
          onClick={fetchPreview}
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={loading || isApproving}
        >
          <RefreshCw className="h-4 w-4" />
          Làm mới
        </Button>
      </div>

      {/* Main Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Thông tin phiếu xuất</CardTitle>
            <ExportFabricStatusBadge status={exportFabric.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Row 1: ID, Kho, Cửa hàng */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">ID Phiếu</p>
              <p className="font-mono font-semibold">#{exportFabric.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Kho xuất</p>
              <p className="font-medium">{exportFabric.warehouse.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Cửa hàng nhận</p>
              <p className="font-medium">{exportFabric.store.name}</p>
            </div>
          </div>

          {/* Row 2: Người tạo, Ngày tạo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Người tạo</p>
              <div>
                <p className="font-medium">{exportFabric.createdBy.username}</p>
                <p className="text-sm text-gray-500">{exportFabric.createdBy.email}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Ngày tạo</p>
              <p className="text-sm">{new Date(exportFabric.createdAt).toLocaleString('vi-VN')}</p>
            </div>
          </div>

          {/* Ghi chú */}
          {exportFabric.note && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Ghi chú</p>
              <p className="text-sm bg-gray-50 p-2 rounded">{exportFabric.note}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Items with Multi-Shelf Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết xuất hàng - Phân bổ kệ ({exportFabric.exportItems.length} mục)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {exportFabric.exportItems.map((item) => {
              const allocations = itemAllocations[item.fabricId] || [];

              return (
                <div key={item.fabricId} className="border-b pb-6 last:border-b-0">
                  {/* Item Header */}
                  <div className="grid grid-cols-4 gap-4 mb-4 pb-4 border-b">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">ID Vải</p>
                      <p className="font-mono font-semibold">#{item.fabric.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Danh mục</p>
                      <p className="font-medium">{item.fabric.categoryId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Màu sắc</p>
                      <p className="font-medium">{item.fabric.colorId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Giá bán</p>
                      <p className="font-medium">
                        {((item.price || item.fabric.sellingPrice) / 100000).toLocaleString('vi-VN', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}{' '}
                        đ
                      </p>
                    </div>
                  </div>

                  {/* Shelf Suggestions */}
                  {item.shelfSuggestions && item.shelfSuggestions.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-2 font-medium">Gợi ý kệ có sẵn:</p>
                      <div className="space-y-1 pl-4">
                        {item.shelfSuggestions.map((sugg) => (
                          <p key={sugg.shelfId} className="text-sm">
                            • {sugg.shelfCode}: {sugg.availableQuantity} sản phẩm
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Multi-Shelf Selector */}
                  <MultiShelfSelector
                    fabricId={item.fabricId}
                    warehouseId={warehouseId}
                    totalQuantityNeeded={item.quantity}
                    allocations={allocations}
                    onAllocationsChange={(alloc) => handleAllocationsChange(item.fabricId, alloc)}
                    disabled={isApproving}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={isApproving}
        >
          Hủy
        </Button>
        <Button
          onClick={handleApprove}
          disabled={isApproving}
          className="gap-2 bg-green-600 hover:bg-green-700"
        >
          {isApproving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang duyệt...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Duyệt phiếu xuất
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
