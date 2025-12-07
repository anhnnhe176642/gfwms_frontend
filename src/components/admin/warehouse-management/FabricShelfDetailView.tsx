'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { warehouseService } from '@/services/warehouse.service';
import { fabricService } from '@/services/fabric.service';
import { getServerErrorMessage } from '@/lib/errorHandler';
import { cn } from '@/lib/utils';
import { ArrowLeft, RefreshCw, Package, User, Calendar, DollarSign, FileText, Layers } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';
import type { FabricShelfDetailData, FabricShelfImportItem } from '@/types/warehouse';
import type { FabricListItem } from '@/types/fabric';

export interface FabricShelfDetailViewProps {
  shelfId: string | number;
  fabricId: string | number;
  warehouseId?: string | number;
}

export function FabricShelfDetailView({ shelfId, fabricId, warehouseId }: FabricShelfDetailViewProps) {
  const router = useRouter();
  const { handleGoBack } = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<FabricShelfDetailData | null>(null);
  const [fabric, setFabric] = useState<FabricListItem | null>(null);
  const [error, setError] = useState('');

  // Fetch fabric shelf detail
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError('');
        const result = await warehouseService.getFabricShelfDetail(shelfId, fabricId);
        setData(result);
        
        // Fetch fabric details
        try {
          const fabricData = await fabricService.getFabricById(fabricId);
          setFabric(fabricData);
        } catch (err) {
          console.error('Failed to fetch fabric details:', err);
        }
      } catch (err) {
        const message = getServerErrorMessage(err) || 'Không thể tải dữ liệu chi tiết vải trong kệ';
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [shelfId, fabricId]);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      COMPLETED: {
        label: 'Hoàn thành',
        className: 'bg-green-100 text-green-800',
      },
      PENDING: {
        label: 'Đang chờ',
        className: 'bg-yellow-100 text-yellow-800',
      },
      CANCELLED: {
        label: 'Đã hủy',
        className: 'bg-red-100 text-red-800',
      },
    };
    
    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={cn('px-2 py-1 rounded-full text-xs font-medium', config.className)}>
        {config.label}
      </span>
    );
  };

  // Navigate to import detail
  const handleViewImportDetail = (importId: number) => {
    router.push(`/admin/warehouses/${warehouseId}/import-fabrics/${importId}`);
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

  if (error || !data) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error || 'Không tìm thấy dữ liệu'}</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Chi tiết vải trong kệ</h1>
          <p className="text-muted-foreground mt-1">
            Thông tin vải #{data.fabricId} trong kệ {data.shelf.code}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Shelf Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Mã kệ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.shelf.code}</p>
          </CardContent>
        </Card>

        {/* Fabric Category */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Loại vải
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{fabric?.category.name || '—'}</p>
          </CardContent>
        </Card>

        {/* Fabric Color */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Màu sắc
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              {fabric?.color.hexCode && (
                <div
                  className="w-8 h-8 rounded-lg border-2 border-input"
                  style={{ backgroundColor: fabric.color.hexCode }}
                />
              )}
              <p className="text-2xl font-bold">{fabric?.color.name || '—'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Total Quantity */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Tổng số lượng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{data.totalCurrentQuantity}</p>
          </CardContent>
        </Card>
      </div>

      {/* Fabric Details */}
      {fabric && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Thông tin chi tiết vải</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">ID Vải</p>
                <p className="text-lg font-semibold">#{fabric.id}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Nhà cung cấp</p>
                <p className="text-lg font-semibold">{fabric.supplier.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Độ bóng</p>
                <p className="text-lg font-semibold">{fabric.gloss.description}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Giá bán</p>
                <p className="text-lg font-semibold">{fabric.sellingPrice.toLocaleString('vi-VN')} ₫</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Độ dày (mm)</p>
                <p className="text-lg font-semibold">{fabric.thickness.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Chiều dài (m)</p>
                <p className="text-lg font-semibold">{fabric.length.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Chiều rộng (m)</p>
                <p className="text-lg font-semibold">{fabric.width.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Trọng lượng (kg)</p>
                <p className="text-lg font-semibold">{fabric.weight.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Imports Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Lịch sử nhập hàng</CardTitle>
          <CardDescription>
            Danh sách các lần nhập vải này vào kệ
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.imports.length === 0 ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-muted-foreground">Không có dữ liệu nhập hàng</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Mã phiếu</TableHead>
                    <TableHead>Người nhập</TableHead>
                    <TableHead>Ngày nhập</TableHead>
                    <TableHead className="text-right">Số lượng hiện tại</TableHead>
                    <TableHead className="text-right">Giá nhập</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="w-[100px]">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.imports.map((importItem: FabricShelfImportItem) => (
                    <TableRow key={importItem.importId}>
                      <TableCell className="font-medium">
                        #{importItem.importId}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{importItem.importer.fullname}</p>
                            <p className="text-xs text-muted-foreground">@{importItem.importer.username}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(importItem.importDate)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="px-2 py-1 rounded-full text-xs font-medium font-mono bg-gray-100 text-gray-800">
                          {importItem.currentQuantity}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {formatCurrency(importItem.importPrice)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(importItem.importStatus)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewImportDetail(importItem.importId)}
                        >
                          Xem phiếu
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={handleGoBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
      </div>
    </div>
  );
}

export default FabricShelfDetailView;
