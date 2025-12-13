'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle, Phone, MapPin, Package, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { createStoreFabricService } from '@/services/storeFabric.service';
import { getServerErrorMessage } from '@/lib/errorHandler';
import type { StoreFabricListItem } from '@/types/storeFabric';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { ROUTES } from '@/config/routes';

export default function StoreFabricDetailPage() {
  const router = useRouter();
  const params = useParams();
  const storeId = params.id as string;
  const fabricId = params.fabricId as string;

  const [fabric, setFabric] = useState<StoreFabricListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fabricService = createStoreFabricService(storeId);

  useEffect(() => {
    const fetchFabric = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fabricService.getById(fabricId);
        setFabric(data);
      } catch (err) {
        const errorMessage = getServerErrorMessage(err) || 'Không thể tải chi tiết vải';
        setError(errorMessage);
        console.error('Failed to fetch fabric detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFabric();
  }, [storeId, fabricId]);

  const handleGoBack = () => {
    router.push(`/admin/stores/${storeId}/fabrics`);
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

  if (error || !fabric) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-red-500 mb-4">{error || 'Không tìm thấy vải'}</p>
          <Button onClick={handleGoBack} variant="outline">
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  const { fabricInfo, inventory, storeInfo } = fabric;

  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.STORES.LIST}>
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
            <h1 className="text-3xl font-bold tracking-tight">{fabricInfo.category}</h1>
            <p className="text-muted-foreground mt-1">
              Chi tiết vải trong cửa hàng {storeInfo.name}
            </p>
          </div>
        </div>

        {/* Basic Fabric Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Thông tin vải
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Properties */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <span className="text-muted-foreground text-sm">Loại vải</span>
                <p className="text-lg font-medium">{fabricInfo.category}</p>
                {fabricInfo.categoryDescription && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {fabricInfo.categoryDescription}
                  </p>
                )}
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Màu sắc</span>
                <div className="flex items-center gap-2 mt-1">
                  {fabricInfo.colorHexCode && (
                    <div
                      className="w-6 h-6 rounded border border-input"
                      style={{ backgroundColor: fabricInfo.colorHexCode }}
                    />
                  )}
                  <span className="font-medium">{fabricInfo.color}</span>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Độ bóng</span>
                <p className="text-lg font-medium">{fabricInfo.gloss}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Chiều dài (m)</span>
                <p className="text-lg font-medium">{fabricInfo.length}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Chiều rộng (m)</span>
                <p className="text-lg font-medium">{fabricInfo.width}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Trọng lượng (kg)</span>
                <p className="text-lg font-medium">{fabricInfo.weight}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Độ dày (mm)</span>
                <p className="text-lg font-medium">{fabricInfo.thickness}</p>
              </div>
            </div>

            <Separator />

            {/* Pricing Information */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Thông tin giá bán
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground text-sm">Giá bán/cuộn</span>
                  <p className="text-2xl font-bold mt-2">
                    {(fabricInfo.sellingPrice ?? fabricInfo.sellingPricePerRoll).toLocaleString('vi-VN')} ₫
                  </p>
                  {!fabricInfo.sellingPrice && (
                    <p className="text-xs text-amber-600 mt-1">(dùng giá bán/roll)</p>
                  )}
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground text-sm">Giá bán/mét</span>
                  <p className="text-2xl font-bold mt-2">
                    {fabricInfo.sellingPricePerMeter.toLocaleString('vi-VN')} ₫
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Information */}
        <Card>
          <CardHeader>
            <CardTitle>Tồn kho trong cửa hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 border rounded-lg">
                <span className="text-muted-foreground text-sm">Cuộn(nguyên)</span>
                <p className="text-3xl font-bold mt-2">{inventory.uncutRolls}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Cuộn(nguyên)
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <span className="text-muted-foreground text-sm">Tổng mét vải</span>
                <p className="text-3xl font-bold mt-2">
                  {inventory.totalMeters.toLocaleString('vi-VN', {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2,
                  })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">tổng số mét của các cuộn</p>
              </div>
              <div className="p-4 border rounded-lg">
                <span className="text-muted-foreground text-sm">Mét lẻ (đã cắt)</span>
                <p className="text-3xl font-bold mt-2">
                  {inventory.cuttingRollMeters.toLocaleString('vi-VN', {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2,
                  })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">mét</p>
              </div>
              <div className="p-4 border rounded-lg lg:col-span-2">
                <span className="text-muted-foreground text-sm">Giá trị tồn kho</span>
                <p className="text-3xl font-bold mt-2">
                  {inventory.totalValue.toLocaleString('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">tổng giá nhập × số cuộn</p>
              </div>
              <div className="p-4 border rounded-lg">
                <span className="text-muted-foreground text-sm">Giá nhập TB/mét</span>
                <p className="text-2xl font-bold mt-2">
                  {Math.round(inventory.averagePricePerMeter).toLocaleString('vi-VN')} ₫
                </p>
                <p className="text-xs text-muted-foreground mt-1">giá nhập trung bình</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Supplier Information */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin nhà cung cấp</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-muted-foreground text-sm">Tên nhà cung cấp</span>
              <p className="text-lg font-medium">{fabricInfo.supplier}</p>
            </div>
            <Separator />
            {fabricInfo.supplierPhone && (
              <>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-muted-foreground text-sm">Số điện thoại</span>
                    <p className="font-medium">{fabricInfo.supplierPhone}</p>
                  </div>
                </div>
                <Separator />
              </>
            )}
            {fabricInfo.supplierAddress && (
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <span className="text-muted-foreground text-sm">Địa chỉ</span>
                  <p className="font-medium">{fabricInfo.supplierAddress}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Store Information */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cửa hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-muted-foreground text-sm">Tên cửa hàng</span>
              <p className="text-lg font-medium">{storeInfo.name}</p>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
              <div>
                <span className="text-muted-foreground text-sm">Địa chỉ</span>
                <p className="font-medium">{storeInfo.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin khác</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground">Ngày tạo:</span>
                <p className="font-medium">{new Date(fabric.createdAt).toLocaleString('vi-VN')}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Cập nhật lần cuối:</span>
                <p className="font-medium">{new Date(fabric.updatedAt).toLocaleString('vi-VN')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGoBack}>
            Quay lại
          </Button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
