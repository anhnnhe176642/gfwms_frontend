'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ExportFabricStatusBadge } from '@/components/admin/table/Badges';
import { exportFabricService } from '@/services/exportFabric.service';
import type { ExportFabricDetail } from '@/types/exportFabric';
import { getServerErrorMessage } from '@/lib/errorHandler';
import { exportInvoiceToPDF } from '@/lib/pdf';
import { useNavigation } from '@/hooks/useNavigation';
import { useAuth } from '@/hooks/useAuth';
import { IsLoading } from '@/components/common/IsLoading';
import { 
  ArrowLeft, 
  Loader2, 
  FileText, 
  Printer, 
  Package,
  CheckCircle2,
  RefreshCw,
  Check,
  X,
} from 'lucide-react';

interface ExportFabricDetailViewProps {
  warehouseId: string | number;
  exportFabricId: string | number;
}

export function ExportFabricDetailView({ warehouseId, exportFabricId }: ExportFabricDetailViewProps) {
  const router = useRouter();
  const { handleGoBack } = useNavigation();
  const { hasPermission } = useAuth();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [exportFabric, setExportFabric] = useState<ExportFabricDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await exportFabricService.getDetail(exportFabricId);
      setExportFabric(data);
    } catch (err) {
      const errorMessage = getServerErrorMessage(err) || 'Không thể tải chi tiết phiếu xuất';
      setError(errorMessage);
      console.error('Failed to fetch export fabric detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportFabricId]);

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    if (!invoiceRef.current) {
      toast.error('Không thể xuất PDF');
      return;
    }

    try {
      setExporting(true);
      await exportInvoiceToPDF(invoiceRef.current, 'Phiếu_Xuất', exportFabric?.id || '');
      toast.success('Xuất PDF thành công');
    } catch (err) {
      console.error('Failed to export PDF:', err);
      const errorMsg = err instanceof Error ? err.message : 'Xuất PDF thất bại';
      toast.error(errorMsg);
    } finally {
      setExporting(false);
    }
  };

  const handleProcessExport = () => {
    router.push(`/admin/warehouses/${warehouseId}/export-fabrics/${exportFabricId}/preview`);
  };

  const handleCompleteExport = async () => {
    try {
      setCompleting(true);
      const updatedFabric = await exportFabricService.completeExport(exportFabricId);
      setExportFabric(updatedFabric);
      toast.success('Xác nhận nhận hàng thành công');
    } catch (err) {
      const errorMessage = getServerErrorMessage(err) || 'Không thể xác nhận nhận hàng';
      toast.error(errorMessage);
      console.error('Failed to complete export:', err);
    } finally {
      setCompleting(false);
    }
  };

  const handleRejectExport = async () => {
    if (!rejectReason.trim()) {
      toast.error('Vui lòng nhập lí do từ chối');
      return;
    }

    try {
      setRejecting(true);
      const updatedFabric = await exportFabricService.rejectExport(exportFabricId, rejectReason);
      setExportFabric(updatedFabric);
      setShowRejectDialog(false);
      setRejectReason('');
      toast.success('Từ chối phiếu xuất thành công');
    } catch (err) {
      const errorMessage = getServerErrorMessage(err) || 'Không thể từ chối phiếu xuất';
      toast.error(errorMessage);
      console.error('Failed to reject export:', err);
    } finally {
      setRejecting(false);
    }
  };

  if (loading) {
    return <IsLoading message="Đang tải chi tiết phiếu xuất..." />;
  }

  if (error || !exportFabric) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
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
            <h1 className="text-3xl font-bold tracking-tight">Chi tiết phiếu xuất</h1>
          </div>
        </div>

        <Card className="bg-card">
          <CardContent className="flex justify-center items-center h-64">
            <div className="text-center">
              <p className="text-red-500 mb-2">{error || 'Không tìm thấy phiếu xuất'}</p>
              <Button onClick={handleGoBack} variant="outline">
                Quay lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalItems = exportFabric.exportItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = exportFabric.exportItems.reduce(
    (sum, item) => sum + (item.price || item.fabric.sellingPrice) * item.quantity,
    0
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Navigation */}
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
            <h1 className="text-3xl font-bold tracking-tight">Chi tiết phiếu xuất</h1>
            <p className="text-muted-foreground mt-1">Phiếu xuất #{exportFabric.id}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 print:hidden">
          <Button
            variant="outline"
            onClick={fetchDetail}
            disabled={loading}
            size="icon"
            title="Làm mới"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={handleExportPDF}
            disabled={exporting}
            className="gap-2"
          >
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang xuất...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Xuất PDF
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handlePrintInvoice}
            disabled={exporting}
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            In
          </Button>
          {/* Action buttons based on permissions */}
          {exportFabric.status === 'PENDING' && hasPermission('exportFabric:change_status') && (
            <Button
              onClick={handleProcessExport}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="h-4 w-4" />
              Xử lý xuất kho
            </Button>
          )}
          {exportFabric.status === 'APPROVED' && hasPermission('exportFabric:receive') && (
            <Button
              onClick={handleCompleteExport}
              disabled={completing}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {completing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang xác nhận...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Xác nhận nhận hàng
                </>
              )}
            </Button>
          )}
          {exportFabric.status === 'PENDING' && hasPermission('exportFabric:change_status') && (
            <Button
              onClick={() => setShowRejectDialog(true)}
              disabled={rejecting}
              variant="destructive"
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Từ chối
            </Button>
          )}
        </div>
      </div>

      {/* Invoice Card */}
      <Card className="bg-white dark:bg-slate-950 print:shadow-none print:border-0" ref={invoiceRef}>
        <CardContent className="p-0">
          {/* Header Section */}
          <div className="border-b p-8 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">PHIẾU XUẤT HÀNG</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Mã phiếu: <span className="font-semibold text-foreground">#{exportFabric.id}</span>
                </p>
              </div>
              <div className="text-right space-y-2">
                <ExportFabricStatusBadge status={exportFabric.status} />
                <p className="text-sm text-muted-foreground">
                  Ngày tạo: <span className="font-semibold text-foreground">
                    {new Date(exportFabric.createdAt).toLocaleString('vi-VN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Warehouse and Store Information */}
          <div className="border-b p-8">
            <div className="grid grid-cols-2 gap-8">
              {/* Warehouse Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Kho xuất
                  </h3>
                  <p className="font-medium text-foreground mt-1">{exportFabric.warehouse.name}</p>
                  <p className="text-sm text-muted-foreground mt-2">{exportFabric.warehouse.address}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      {exportFabric.warehouse.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Store Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Cửa hàng nhận
                  </h3>
                  <p className="font-medium text-foreground mt-1">{exportFabric.store.name}</p>
                  <p className="text-sm text-muted-foreground mt-2">{exportFabric.store.address}</p>
                </div>
              </div>
            </div>

            {/* Creator and Receiver Info */}
            <div className="grid grid-cols-2 gap-8 mt-8">
              {/* Creator Info */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Người tạo
                </h3>
                <p className="font-medium text-foreground">{exportFabric.createdBy.fullname || exportFabric.createdBy.username}</p>
                <p className="text-sm text-muted-foreground">{exportFabric.createdBy.email}</p>
              </div>

              {/* Receiver Info */}
              {exportFabric.receivedBy ? (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Người nhận
                  </h3>
                  <p className="font-medium text-foreground">{exportFabric.receivedBy.fullname || exportFabric.receivedBy.username}</p>
                  <p className="text-sm text-muted-foreground">{exportFabric.receivedBy.email}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Người nhận
                  </h3>
                  <p className="text-sm italic text-muted-foreground">Chưa xác nhận</p>
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="border-b p-8 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2">
                  <th className="text-left py-3 px-2 font-semibold text-foreground">STT</th>
                  <th className="text-left py-3 px-2 font-semibold text-foreground">Mã vải</th>
                  <th className="text-left py-3 px-2 font-semibold text-foreground">Loại vải</th>
                  <th className="text-left py-3 px-2 font-semibold text-foreground">Màu sắc</th>
                  <th className="text-left py-3 px-2 font-semibold text-foreground">Kích thước</th>
                  <th className="text-left py-3 px-2 font-semibold text-foreground">Độ bóng</th>
                  <th className="text-right py-3 px-2 font-semibold text-foreground">Số lượng</th>
                  <th className="text-right py-3 px-2 font-semibold text-foreground">Đơn giá</th>
                  <th className="text-right py-3 px-2 font-semibold text-foreground">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {exportFabric.exportItems.map((item, index) => {
                  const unitPrice = item.price || item.fabric.sellingPrice;
                  return (
                    <tr key={`${item.fabricId}-${index}`} className="border-b hover:bg-muted/50">
                      <td className="py-4 px-2 text-center font-medium">{index + 1}</td>
                      <td className="py-4 px-2">
                        <span className="font-mono text-sm">#{item.fabricId}</span>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span>{item.fabric.category.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-2 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded border"
                            style={{
                              backgroundColor: item.fabric.color.hexCode || '#ccc',
                            }}
                            title={item.fabric.color.name}
                          />
                          <span className="text-xs">{item.fabric.color.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-xs text-muted-foreground">
                        <div className="space-y-0.5">
                          <p>D: {item.fabric.length}m × R: {item.fabric.width}m</p>
                          <p>T: {item.fabric.thickness}mm, K: {item.fabric.weight}kg</p>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-xs">{item.fabric.gloss.description}</td>
                      <td className="py-4 px-2 text-right font-medium whitespace-nowrap">
                        {item.quantity.toLocaleString('vi-VN')}
                      </td>
                      <td className="py-4 px-2 text-right font-medium whitespace-nowrap">
                        {unitPrice.toLocaleString('vi-VN')} ₫
                      </td>
                      <td className="py-4 px-2 text-right font-medium text-foreground whitespace-nowrap">
                        {(item.quantity * unitPrice).toLocaleString('vi-VN')} ₫
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary Section */}
          <div className="p-8">
            <div className="flex justify-end">
              <div className="w-full max-w-xs space-y-3">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Tổng số lượng:</span>
                  <span className="font-medium text-foreground">{totalItems.toLocaleString('vi-VN')} cuộn</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Số mặt hàng:</span>
                  <span className="font-medium text-foreground">{exportFabric.exportItems.length} loại</span>
                </div>
                <div className="border-t-2 border-b-2 py-3 flex justify-between font-bold text-base">
                  <span>Tổng cộng:</span>
                  <span className="text-lg text-blue-600 dark:text-blue-500">
                    {totalPrice.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Note Section */}
          {exportFabric.note && (
            <div className="border-t p-8">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                Ghi chú
              </h3>
              <p className="text-sm text-foreground bg-muted/50 p-4 rounded-lg">{exportFabric.note}</p>
            </div>
          )}

          {/* Footer */}
          <div className="border-t bg-muted/30 p-8 text-xs text-muted-foreground space-y-2 print:bg-white print:border-0">
            <p>Ngày tạo: {new Date(exportFabric.createdAt).toLocaleString('vi-VN')}</p>
            <p>Lần cập nhật cuối: {new Date(exportFabric.updatedAt).toLocaleString('vi-VN')}</p>
          </div>
        </CardContent>
      </Card>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border-0 {
            border: none !important;
          }
          .print\\:bg-white {
            background-color: white !important;
          }
        }
      `}</style>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Từ chối phiếu xuất</DialogTitle>
            <DialogDescription>
              Vui lòng nhập lí do từ chối phiếu xuất #{exportFabric?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Nhập lí do từ chối..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              disabled={rejecting}
              className="min-h-[120px]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectReason('');
              }}
              disabled={rejecting}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectExport}
              disabled={rejecting || !rejectReason.trim()}
              className="gap-2"
            >
              {rejecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang từ chối...
                </>
              ) : (
                <>
                  <X className="h-4 w-4" />
                  Xác nhận từ chối
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ExportFabricDetailView;
