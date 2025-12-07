'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useExportRequestStore } from '@/store/useExportRequestStore';
import { exportFabricService } from '@/services/exportFabric.service';
import { getServerErrorMessage } from '@/lib/errorHandler';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Plus,
  Trash2,
  RefreshCw,
  Send,
  CheckCircle,
  AlertCircle,
  Package,
  Warehouse,
  FileText,
} from 'lucide-react';

export function ExportWarehouseAllocation() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    storeId,
    storeName,
    selectedItems,
    note,
    allocations,
    isLoadingSuggestions,
    goToStep1,
    setAllocations,
    setIsLoadingSuggestions,
    updateFabricAllocation,
    addWarehouseAllocation,
    removeWarehouseAllocation,
    getTotalAllocated,
    isAllocationValid,
    getBatchExportData,
    getWarehouseSummary,
    setBatchResult,
  } = useExportRequestStore();

  // Fetch suggestions on mount - always call API when entering step 2
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (selectedItems.size === 0) {
        goToStep1();
        return;
      }

      setIsLoadingSuggestions(true);
      try {
        const fabricItems = Array.from(selectedItems.values()).map((item) => ({
          fabricId: item.fabricId,
          quantity: item.quantity,
        }));

        const suggestions = await exportFabricService.suggestAllocation({ fabricItems });
        setAllocations(suggestions);
      } catch (err) {
        const message = getServerErrorMessage(err) || 'Không thể tải gợi ý phân bổ';
        toast.error(message);
        goToStep1();
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    fetchSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle quantity change
  const handleQuantityChange = (
    fabricId: number,
    allocationIndex: number,
    value: string
  ) => {
    const qty = parseInt(value) || 0;
    updateFabricAllocation(fabricId, allocationIndex, { quantity: qty });
  };

  // Handle add warehouse
  const handleAddWarehouse = (fabricId: number, warehouseId: string) => {
    const fabricAllocation = allocations.get(fabricId);
    if (!fabricAllocation) return;

    const warehouse = fabricAllocation.availableStocks.find(
      (s) => s.warehouseId === parseInt(warehouseId)
    );
    if (warehouse) {
      addWarehouseAllocation(fabricId, warehouse);
    }
  };

  // Handle remove warehouse
  const handleRemoveWarehouse = (fabricId: number, allocationIndex: number) => {
    removeWarehouseAllocation(fabricId, allocationIndex);
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!isAllocationValid()) {
      toast.error('Vui lòng phân bổ đủ số lượng cho tất cả các mặt hàng');
      return;
    }

    const batchData = getBatchExportData();
    if (!batchData) {
      toast.error('Dữ liệu không hợp lệ');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await exportFabricService.createBatchExport({
        storeId: batchData.storeId,
        note: batchData.note,
        warehouseAllocations: batchData.warehouseAllocations.map((w) => ({
          warehouseId: w.warehouseId,
          items: w.items,
        })),
      });

      toast.success(`Tạo thành công ${result.exports.length} phiếu xuất kho`);
      
      // Save result and navigate to result page
      setBatchResult(result);
      router.push(`/admin/stores/${storeId}/export-request/result?batchId=${result.batchId}`);
    } catch (err) {
      const message = getServerErrorMessage(err) || 'Không thể tạo yêu cầu xuất kho';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoadingSuggestions) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          <p className="text-gray-500">Đang tải gợi ý phân bổ kho...</p>
        </div>
      </div>
    );
  }

  // No data - redirect to step 1
  if (allocations.size === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Không có dữ liệu phân bổ</p>
          <Button onClick={goToStep1} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại chọn vải
          </Button>
        </div>
      </div>
    );
  }

  const allocationArray = Array.from(allocations.values());
  const warehouseSummary = getWarehouseSummary();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToStep1}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Chọn kho xuất</h1>
            <p className="text-muted-foreground">
              Cửa hàng: <span className="font-medium">{storeName}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={goToStep1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isAllocationValid() || isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Gửi yêu cầu ({warehouseSummary.length} phiếu)
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Note display */}
      {note && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Ghi chú
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <p className="text-sm text-muted-foreground">{note}</p>
          </CardContent>
        </Card>
      )}

      {/* Warehouse Summary */}
      <Card className="bg-muted/30">
        <CardHeader className="py-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Warehouse className="h-5 w-5" />
            Tổng hợp đơn xuất kho
          </CardTitle>
          <CardDescription>
            Sẽ tạo {warehouseSummary.length} phiếu xuất kho từ các kho sau
          </CardDescription>
        </CardHeader>
        <CardContent>
          {warehouseSummary.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Chưa có phân bổ nào
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {warehouseSummary.map((warehouse) => (
                <div
                  key={warehouse.warehouseId}
                  className="flex items-center justify-between p-3 bg-background rounded-lg border"
                >
                  <div>
                    <p className="font-medium">{warehouse.warehouseName}</p>
                    <p className="text-xs text-muted-foreground">
                      {warehouse.fabricCount} loại vải
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-primary">
                      {warehouse.totalQuantity}
                    </p>
                    <p className="text-xs text-muted-foreground">cuộn</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fabric allocations */}
      <div className="space-y-4">
        {allocationArray.map((fabricAllocation) => {
          const totalAllocated = getTotalAllocated(fabricAllocation.fabricId);
          const remaining = fabricAllocation.requestedQuantity - totalAllocated;
          const isComplete = remaining === 0;
          const isOver = remaining < 0;

          // Get available warehouses (not yet selected)
          const selectedWarehouseIds = new Set(
            fabricAllocation.allocations.map((a) => a.warehouseId)
          );
          const availableWarehouses = fabricAllocation.availableStocks.filter(
            (s) => !selectedWarehouseIds.has(s.warehouseId) && s.currentStock > 0
          );

          return (
            <Card key={fabricAllocation.fabricId} className={cn(
              'transition-colors',
              isComplete && 'border-green-500/50',
              isOver && 'border-red-500/50'
            )}>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x">
                  {/* Left side - Fabric Info */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          <Package className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">
                            {fabricAllocation.fabric.category.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            ID: #{fabricAllocation.fabricId}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          {isComplete ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : isOver ? (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-yellow-500" />
                          )}
                          <span className={cn(
                            'text-lg font-semibold',
                            isComplete && 'text-green-600',
                            isOver && 'text-red-600',
                            !isComplete && !isOver && 'text-yellow-600'
                          )}>
                            {totalAllocated} / {fabricAllocation.requestedQuantity}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {isComplete
                            ? 'Đã phân bổ đủ'
                            : isOver
                            ? `Vượt ${Math.abs(remaining)} cuộn`
                            : `Còn thiếu ${remaining} cuộn`}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Fabric details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Màu sắc:</span>
                        <div className="flex items-center gap-2 ml-2">
                          {fabricAllocation.fabric.color.hexCode && (
                            <div
                              className="w-4 h-4 rounded border border-input"
                              style={{ backgroundColor: fabricAllocation.fabric.color.hexCode }}
                            />
                          )}
                          <span className="font-medium">{fabricAllocation.fabric.color.name}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Độ bóng:</span>
                        <span className="ml-2 font-medium">{fabricAllocation.fabric.gloss.description}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Nhà cung cấp:</span>
                        <span className="ml-2 font-medium">{fabricAllocation.fabric.supplier.name}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Chiều dài:</span>
                        <span className="ml-2 font-medium">{fabricAllocation.fabric.length}m</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Giá bán:</span>
                        <span className="ml-2 font-medium">{fabricAllocation.fabric.sellingPrice.toLocaleString('vi-VN')}₫</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tồn kho tổng:</span>
                        <span className="ml-2 font-medium">{fabricAllocation.totalAvailable}</span>
                        {!fabricAllocation.isSufficient && (
                          <span className="ml-2 text-red-500 text-xs">⚠️ Không đủ</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right side - Warehouse Allocations */}
                  <div className="p-6 space-y-4 bg-muted/20">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Warehouse className="h-4 w-4" />
                      Phân bổ từ kho
                    </Label>
                    
                    <div className="space-y-3">
                      {fabricAllocation.allocations.map((allocation, index) => (
                        <div
                          key={`${allocation.warehouseId}-${index}`}
                          className="flex items-center gap-3 p-3 bg-background rounded-lg border"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{allocation.warehouseName}</p>
                            <p className="text-xs text-muted-foreground">
                              Tồn kho: {allocation.maxStock} cuộn
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min={0}
                              max={allocation.maxStock}
                              value={allocation.quantity}
                              onChange={(e) =>
                                handleQuantityChange(
                                  fabricAllocation.fabricId,
                                  index,
                                  e.target.value
                                )
                              }
                              className={cn(
                                'w-20 text-center',
                                allocation.quantity > allocation.maxStock && 'border-red-500'
                              )}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleRemoveWarehouse(fabricAllocation.fabricId, index)
                              }
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-100 shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      {/* Add warehouse */}
                      {availableWarehouses.length > 0 && (
                        <Select
                          key={`select-${fabricAllocation.fabricId}-${fabricAllocation.allocations.length}`}
                          value=""
                          onValueChange={(value) =>
                            handleAddWarehouse(fabricAllocation.fabricId, value)
                          }
                        >
                          <SelectTrigger className="bg-background">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Plus className="h-4 w-4" />
                              <span>Thêm kho...</span>
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {availableWarehouses.map((warehouse) => (
                              <SelectItem
                                key={warehouse.warehouseId}
                                value={String(warehouse.warehouseId)}
                              >
                                {warehouse.warehouseName} (Tồn: {warehouse.currentStock})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      {fabricAllocation.allocations.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          Chưa chọn kho nào. Vui lòng thêm kho để phân bổ.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bottom Summary */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="grid grid-cols-3 gap-6 text-sm">
              <div>
                <span className="text-muted-foreground">Số loại vải:</span>
                <span className="ml-2 font-medium">{allocationArray.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Tổng số lượng:</span>
                <span className="ml-2 font-medium">
                  {allocationArray.reduce((sum, a) => sum + a.requestedQuantity, 0)} cuộn
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Số phiếu xuất:</span>
                <span className={cn(
                  'ml-2 font-medium',
                  warehouseSummary.length > 0 ? 'text-primary' : 'text-muted-foreground'
                )}>
                  {warehouseSummary.length} phiếu
                </span>
              </div>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!isAllocationValid() || isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Gửi yêu cầu
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ExportWarehouseAllocation;
