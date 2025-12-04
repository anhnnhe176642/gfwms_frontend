'use client';

import { useEffect, useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  ArrowLeft,
  Package,
  Warehouse,
  Store,
  Calendar,
  User,
  FileText,
  ExternalLink,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useExportRequestStore } from '@/store/useExportRequestStore';
import type { ExportFabricDetail } from '@/services/exportFabric.service';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function ExportBatchResultPage({ params }: PageProps) {
  const { id: storeId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const batchId = searchParams.get('batchId');

  const { batchResult, storeName, reset } = useExportRequestStore();
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Check if we have batch result data
    if (!batchResult) {
      // No data - redirect back to export request
      router.replace(`/admin/stores/${storeId}/export-request`);
      return;
    }
    setIsLoading(false);
    // Expand all cards by default
    setExpandedCards(new Set(batchResult.exports.map((e) => e.id)));
  }, [batchResult, storeId, router]);

  const handleBackToStore = () => {
    reset();
    router.push(`/admin/stores/${storeId}`);
  };

  const handleCreateAnother = () => {
    reset();
    router.push(`/admin/stores/${storeId}/export-request`);
  };

  const toggleCard = (id: number) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (isLoading || !batchResult) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const { exports } = batchResult;
  const totalFabrics = exports.reduce((sum, exp) => sum + exp.exportItems.length, 0);
  const totalQuantity = exports.reduce(
    (sum, exp) => sum + exp.exportItems.reduce((s, item) => s + item.quantity, 0),
    0
  );
  const totalValue = exports.reduce(
    (sum, exp) =>
      sum +
      exp.exportItems.reduce((s, item) => s + item.quantity * (item.fabric?.sellingPrice || 0), 0),
    0
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Success Header */}
      <Card className="border-green-500/50 bg-green-50/50 dark:bg-green-950/20">
        <CardContent className="py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-green-700 dark:text-green-400">
                Tạo yêu cầu xuất kho thành công!
              </h1>
              <p className="text-muted-foreground mt-1">
                Đã tạo {exports.length} phiếu xuất kho cho cửa hàng{' '}
                <span className="font-medium">{storeName || exports[0]?.store?.name}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mã batch</p>
                <p className="text-xl font-semibold">#{batchResult.batchId}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Warehouse className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Số phiếu xuất</p>
                <p className="text-xl font-semibold">{exports.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Package className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Số loại vải</p>
                <p className="text-xl font-semibold">{totalFabrics}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Package className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng số lượng</p>
                <p className="text-xl font-semibold">{totalQuantity} cuộn</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <FileText className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng giá trị</p>
                <p className="text-lg font-semibold text-green-600">
                  {totalValue.toLocaleString('vi-VN')}₫
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Details */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Chi tiết các phiếu xuất kho</h2>
        {exports.map((exportItem) => (
          <ExportDetailCard
            key={exportItem.id}
            exportItem={exportItem}
            storeId={storeId}
            isExpanded={expandedCards.has(exportItem.id)}
            onToggle={() => toggleCard(exportItem.id)}
          />
        ))}
      </div>

      {/* Actions */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Các phiếu xuất đang chờ kho xác nhận. Bạn có thể theo dõi trạng thái trong danh sách
              phiếu xuất.
            </p>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleBackToStore}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại cửa hàng
              </Button>
              <Button onClick={handleCreateAnother}>Tạo yêu cầu khác</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Export Detail Card Component - styled like Import Detail
function ExportDetailCard({
  exportItem,
  storeId,
  isExpanded,
  onToggle,
}: {
  exportItem: ExportFabricDetail;
  storeId: string;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    PENDING: {
      label: 'Chờ duyệt',
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    },
    APPROVED: {
      label: 'Đã duyệt',
      className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    },
    REJECTED: {
      label: 'Từ chối',
      className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    },
  };

  const status = statusConfig[exportItem.status] || statusConfig.PENDING;
  const totalQuantity = exportItem.exportItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = exportItem.exportItems.reduce(
    (sum, item) => sum + item.quantity * (item.fabric?.sellingPrice || 0),
    0
  );

  return (
    <Card className="bg-white dark:bg-slate-950 overflow-hidden">
      {/* Card Header - Always visible */}
      <div
        className="p-6 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-muted rounded-lg">
              <Warehouse className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold">Phiếu xuất #{exportItem.id}</h3>
                <span className={cn('px-2 py-0.5 text-xs rounded-full', status.className)}>
                  {status.label}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Warehouse className="h-3 w-3" />
                  {exportItem.warehouse.name}
                </span>
                <span className="flex items-center gap-1">
                  <Store className="h-3 w-3" />
                  {exportItem.store.name}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(exportItem.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Tổng giá trị</p>
              <p className="text-lg font-semibold text-green-600">
                {totalValue.toLocaleString('vi-VN')}₫
              </p>
            </div>
            <Button variant="ghost" size="icon" className="shrink-0">
              {isExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <>
          <Separator />

          {/* Warehouse and User Information */}
          <div className="border-b p-6">
            <div className="grid grid-cols-3 gap-6">
              {/* Warehouse Info */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Kho xuất
                </h4>
                <p className="font-medium text-foreground">{exportItem.warehouse.name}</p>
              </div>

              {/* Store Info */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Cửa hàng nhận
                </h4>
                <p className="font-medium text-foreground">{exportItem.store.name}</p>
              </div>

              {/* Creator Info */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Người tạo
                </h4>
                <p className="font-medium text-foreground">{exportItem.createdBy.username}</p>
                <p className="text-sm text-muted-foreground">{exportItem.createdBy.email}</p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="border-b p-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2">
                  <th className="text-left py-3 px-2 font-semibold text-foreground">STT</th>
                  <th className="text-left py-3 px-2 font-semibold text-foreground">Mã vải</th>
                  <th className="text-left py-3 px-2 font-semibold text-foreground">Loại vải</th>
                  <th className="text-left py-3 px-2 font-semibold text-foreground">Màu sắc</th>
                  <th className="text-right py-3 px-2 font-semibold text-foreground">Số lượng</th>
                  <th className="text-right py-3 px-2 font-semibold text-foreground">Đơn giá</th>
                  <th className="text-right py-3 px-2 font-semibold text-foreground">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {exportItem.exportItems.map((item, index) => (
                  <tr key={`${item.fabricId}-${index}`} className="border-b hover:bg-muted/50">
                    <td className="py-4 px-2 text-center font-medium">{index + 1}</td>
                    <td className="py-4 px-2">
                      <span className="font-mono text-muted-foreground">#{item.fabricId}</span>
                    </td>
                    <td className="py-4 px-2">
                      <p className="font-medium text-foreground">
                        Danh mục #{item.fabric.categoryId}
                      </p>
                    </td>
                    <td className="py-4 px-2 whitespace-nowrap">{item.fabric.colorId}</td>
                    <td className="py-4 px-2 text-right font-medium whitespace-nowrap">
                      {item.quantity.toLocaleString('vi-VN')}
                    </td>
                    <td className="py-4 px-2 text-right font-medium whitespace-nowrap">
                      {item.fabric.sellingPrice.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="py-4 px-2 text-right font-medium text-foreground whitespace-nowrap">
                      {(item.quantity * item.fabric.sellingPrice).toLocaleString('vi-VN')} ₫
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Section */}
          <div className="p-6">
            <div className="flex justify-between items-start">
              {/* Note */}
              {exportItem.note && (
                <div className="flex-1 max-w-md">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                    Ghi chú
                  </h4>
                  <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                    {exportItem.note}
                  </p>
                </div>
              )}

              {/* Totals */}
              <div className="w-full max-w-xs space-y-3">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Tổng số lượng:</span>
                  <span className="font-medium text-foreground">
                    {totalQuantity.toLocaleString('vi-VN')} cuộn
                  </span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Số mặt hàng:</span>
                  <span className="font-medium text-foreground">
                    {exportItem.exportItems.length} loại
                  </span>
                </div>
                <div className="border-t-2 border-b-2 py-3 flex justify-between font-bold text-base">
                  <span>Tổng cộng:</span>
                  <span className="text-lg text-green-600 dark:text-green-500">
                    {totalValue.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t bg-muted/30 px-6 py-4 flex items-center justify-between">
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Ngày tạo: {new Date(exportItem.createdAt).toLocaleString('vi-VN')}</p>
              <p>Lần cập nhật cuối: {new Date(exportItem.updatedAt).toLocaleString('vi-VN')}</p>
            </div>
            <Link href={`/admin/export-fabrics/${exportItem.id}`}>
              <Button variant="outline" size="sm" className="gap-1">
                Xem chi tiết
                <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </>
      )}
    </Card>
  );
}
