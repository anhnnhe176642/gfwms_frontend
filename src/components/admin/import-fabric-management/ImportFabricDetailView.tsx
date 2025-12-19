'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { importFabricService } from '@/services/importFabric.service';
import { getServerErrorMessage } from '@/lib/errorHandler';
import { exportInvoiceToPDF } from '@/lib/pdf';
import { useNavigation } from '@/hooks/useNavigation';
import type { ImportFabricFullDetail } from '@/types/importFabric';
import { ArrowLeft, Loader, FileText, Printer } from 'lucide-react';
import { IsLoading } from '@/components/common/IsLoading';

interface ImportFabricDetailViewProps {
  warehouseId: string | number;
  importId: string | number;
}

export function ImportFabricDetailView({ warehouseId, importId }: ImportFabricDetailViewProps) {
  const router = useRouter();
  const { handleGoBack } = useNavigation();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [importFabric, setImportFabric] = useState<ImportFabricFullDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    const fetchImportFabricDetail = async () => {
      try {
        setLoading(true);
        const response = await importFabricService.getImportFabricDetail(Number(importId));
        setImportFabric(response.data);
      } catch (err) {
        console.error('Failed to fetch import fabric detail:', err);
        const errorMessage = getServerErrorMessage(err) || 'Không thể tải chi tiết phiếu nhập';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchImportFabricDetail();
  }, [importId]);


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
      await exportInvoiceToPDF(invoiceRef.current, 'Phiếu_Nhập', importFabric?.id || '');
      toast.success('Xuất PDF thành công');
    } catch (err) {
      console.error('Failed to export PDF:', err);
      const errorMsg = err instanceof Error ? err.message : 'Xuất PDF thất bại';
      toast.error(errorMsg);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <IsLoading message="Đang tải chi tiết phiếu nhập..." />;
  }

  if (error || !importFabric) {
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
            <h1 className="text-3xl font-bold tracking-tight">Chi tiết phiếu nhập</h1>
          </div>
        </div>

        <Card className="bg-card">
          <CardContent className="flex justify-center items-center h-64">
            <div className="text-center">
              <p className="text-red-500 mb-2">{error || 'Không tìm thấy phiếu nhập'}</p>
              <Button onClick={handleGoBack} variant="outline">
                Quay lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalItems = importFabric.importItems.reduce((sum, item) => sum + item.quantity, 0);

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
            <h1 className="text-3xl font-bold tracking-tight">Chi tiết phiếu nhập</h1>
            <p className="text-muted-foreground mt-1">Phiếu nhập #{importFabric.id}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 print:hidden">
          <Button
            variant="outline"
            onClick={handleExportPDF}
            disabled={exporting}
            className="gap-2"
          >
            {exporting ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
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
        </div>
      </div>

      {/* Invoice Card */}
      <Card className="bg-white dark:bg-slate-950 print:shadow-none print:border-0" ref={invoiceRef}>
        <CardContent className="p-0">
          {/* Header Section */}
          <div className="border-b p-8 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">PHIẾU NHẬP HÀNG</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Mã phiếu: <span className="font-semibold text-foreground">#{importFabric.id}</span>
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-sm text-muted-foreground">
                  Ngày nhập: <span className="font-semibold text-foreground">
                    {new Date(importFabric.importDate).toLocaleString('vi-VN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Ngày tạo: <span className="font-semibold text-foreground">
                    {new Date(importFabric.createdAt).toLocaleString('vi-VN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                    })}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Warehouse and User Information */}
          <div className="border-b p-8">
            <div className="grid grid-cols-2 gap-8">
              {/* Warehouse Info */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Kho nhập
                </h3>
                <p className="font-medium text-foreground">{importFabric.warehouse.name}</p>
                <p className="text-sm text-muted-foreground">{importFabric.warehouse.address}</p>
              </div>

              {/* Importer Info */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Người nhập
                </h3>
                <p className="font-medium text-foreground">{importFabric.importUser.fullname}</p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Email: {importFabric.importUser.email}</p>
                  <p>Điện thoại: {importFabric.importUser.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="border-b p-8 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2">
                  <th className="text-left py-3 px-2 font-semibold text-foreground">STT</th>
                  <th className="text-left py-3 px-2 font-semibold text-foreground">Loại vải</th>
                  <th className="text-left py-3 px-2 font-semibold text-foreground">Màu sắc</th>
                  <th className="text-left py-3 px-2 font-semibold text-foreground">Nhà cung cấp</th>
                  <th className="text-center py-3 px-2 font-semibold text-foreground">Chiều dài (m)</th>
                  <th className="text-right py-3 px-2 font-semibold text-foreground">Số lượng</th>
                  <th className="text-right py-3 px-2 font-semibold text-foreground">Đơn giá</th>
                  <th className="text-right py-3 px-2 font-semibold text-foreground">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {importFabric.importItems.map((item, index) => (
                  <tr key={item.fabricId} className="border-b hover:bg-muted/50">
                    <td className="py-4 px-2 text-center font-medium">{index + 1}</td>
                    <td className="py-4 px-2">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">{item.fabric.category.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.fabric.gloss.description}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-2 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {item.fabric.color.hexCode && (
                          <div
                            className="w-4 h-4 rounded border border-input"
                            style={{ backgroundColor: item.fabric.color.hexCode }}
                          />
                        )}
                        <span>{item.fabric.color.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-sm text-muted-foreground whitespace-nowrap">{item.fabric.supplier.name}</td>
                    <td className="py-4 px-2 text-center whitespace-nowrap">{item.fabric.length.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}</td>
                    <td className="py-4 px-2 text-right font-medium whitespace-nowrap">{item.quantity.toLocaleString('vi-VN')}</td>
                    <td className="py-4 px-2 text-right font-medium whitespace-nowrap">
                      {item.price.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="py-4 px-2 text-right font-medium text-foreground whitespace-nowrap">
                      {(item.quantity * item.price).toLocaleString('vi-VN')} ₫
                    </td>
                  </tr>
                ))}
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
                  <span className="font-medium text-foreground">{importFabric.importItems.length} loại</span>
                </div>
                <div className="border-t-2 border-b-2 py-3 flex justify-between font-bold text-base">
                  <span>Tổng cộng:</span>
                  <span className="text-lg text-green-600 dark:text-green-500">
                    {importFabric.totalPrice.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t bg-muted/30 p-8 text-xs text-muted-foreground space-y-2 print:bg-white print:border-0">
            <p>Ngày tạo: {new Date(importFabric.createdAt).toLocaleString('vi-VN')}</p>
            <p>Lần cập nhật cuối: {new Date(importFabric.updatedAt).toLocaleString('vi-VN')}</p>
          </div>

          {/* Signature Image Section */}
          {importFabric.signatureImageUrl && (
            <div className="border-t p-8">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">
                Ảnh chữ ký hoá đơn
              </h3>
              <div className="flex justify-center">
                <img
                  src={importFabric.signatureImageUrl}
                  alt="Signature"
                  className="max-h-64 max-w-md border rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setLightboxOpen(true)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lightbox */}
      {importFabric?.signatureImageUrl && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={[
            {
              src: importFabric.signatureImageUrl,
              alt: 'Signature',
            },
          ]}
          plugins={[Zoom]}
        />
      )}

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
    </div>
  );
}

export default ImportFabricDetailView;
