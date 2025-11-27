'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExportFabricStatusBadge } from '@/components/admin/table/Badges';
import { exportFabricService } from '@/services/exportFabric.service';
import type { ExportFabricDetail } from '@/services/exportFabric.service';
import { ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';

interface ExportFabricDetailViewProps {
  exportFabricId: number | string;
}

export function ExportFabricDetailView({ exportFabricId }: ExportFabricDetailViewProps) {
  const router = useRouter();
  const [exportFabric, setExportFabric] = useState<ExportFabricDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await exportFabricService.getDetail(exportFabricId);
      setExportFabric(data);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải chi tiết phiếu xuất');
      console.error('Failed to fetch export fabric detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [exportFabricId]);

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
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchDetail} variant="outline">
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
          <h1 className="text-2xl font-bold">Chi tiết phiếu xuất #{exportFabric.id}</h1>
        </div>
        <Button
          onClick={fetchDetail}
          variant="outline"
          size="sm"
          className="gap-2"
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

          {/* Row 2: Người tạo, Người nhận, Ghi chú */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Người tạo</p>
              <div>
                <p className="font-medium">{exportFabric.createdBy.username}</p>
                <p className="text-sm text-gray-500">{exportFabric.createdBy.email}</p>
              </div>
            </div>
            {exportFabric.receivedBy ? (
              <div>
                <p className="text-sm text-gray-500 mb-1">Người nhận</p>
                <div>
                  <p className="font-medium">{exportFabric.receivedBy.username}</p>
                  <p className="text-sm text-gray-500">{exportFabric.receivedBy.email}</p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-500 mb-1">Người nhận</p>
                <p className="text-sm italic text-gray-400">Chưa xác nhận</p>
              </div>
            )}
          </div>

          {/* Row 3: Ngày tạo, Ngày cập nhật */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Ngày tạo</p>
              <p className="text-sm">{new Date(exportFabric.createdAt).toLocaleString('vi-VN')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Ngày cập nhật</p>
              <p className="text-sm">{new Date(exportFabric.updatedAt).toLocaleString('vi-VN')}</p>
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

      {/* Export Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết xuất hàng ({exportFabric.exportItems.length} mục)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">ID Vải</th>
                  <th className="text-left p-2 font-semibold">Danh mục</th>
                  <th className="text-left p-2 font-semibold">Màu sắc</th>
                  <th className="text-right p-2 font-semibold">Số lượng</th>
                  <th className="text-right p-2 font-semibold">Giá bán</th>
                  <th className="text-right p-2 font-semibold">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {exportFabric.exportItems.map((item) => {
                  const lineTotal = (item.quantity * (item.price || item.fabric.sellingPrice)) / 100000;
                  return (
                    <tr key={item.fabricId} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-mono">#{item.fabric.id}</td>
                      <td className="p-2">{item.fabric.categoryId}</td>
                      <td className="p-2">{item.fabric.colorId}</td>
                      <td className="text-right p-2">{item.quantity}</td>
                      <td className="text-right p-2">
                        {((item.price || item.fabric.sellingPrice) / 100000).toLocaleString('vi-VN', { 
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0 
                        })} đ
                      </td>
                      <td className="text-right p-2 font-semibold">
                        {lineTotal.toLocaleString('vi-VN', { 
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0 
                        })} đ
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 font-semibold">
                  <td colSpan={4} className="p-2 text-right">Tổng cộng:</td>
                  <td colSpan={2} className="p-2 text-right">
                    {(
                      exportFabric.exportItems.reduce(
                        (sum, item) => sum + (item.quantity * (item.price || item.fabric.sellingPrice)) / 100000,
                        0
                      )
                    ).toLocaleString('vi-VN', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    })} đ
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
