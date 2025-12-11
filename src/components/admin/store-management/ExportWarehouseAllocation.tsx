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
import { AlertTriangle } from 'lucide-react';
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
  const [strategy, setStrategy] = useState<'MIN_WAREHOUSES' | 'MIN_DISTANCE'>('MIN_WAREHOUSES');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);

  const {
    storeId,
    storeName,
    storeLatitude,
    storeLongitude,
    selectedItems,
    note,
    allocations,
    allocationSummary,
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

  // Initialize location fields with store location if available
  useEffect(() => {
    if (storeLatitude && storeLongitude) {
      setLatitude(storeLatitude.toString());
      setLongitude(storeLongitude.toString());
    }
  }, [storeLatitude, storeLongitude]);

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

        const requestData: any = {
          fabricItems,
          priority: strategy,
        };

        // Add destination location for MIN_DISTANCE strategy
        if (strategy === 'MIN_DISTANCE' && latitude && longitude) {
          requestData.destinationLocation = {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
          };
        }

        const response = await exportFabricService.suggestAllocation(requestData);
        setAllocations(response.fabrics, response.allocationSummary);
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
  }, [strategy, latitude, longitude]);

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

      {/* Warehouse Summary with Strategy Selection */}
      <Card className="bg-muted/30">
        <CardHeader className="py-4">
          <div className="flex items-center justify-between w-full">
            <CardTitle className="text-lg flex items-center gap-2">
              <Warehouse className="h-5 w-5" />
              Tổng hợp đơn xuất kho
            </CardTitle>
            <Select value={strategy} onValueChange={(value: any) => setStrategy(value)}>
              <SelectTrigger className="min-w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MIN_WAREHOUSES">
                  <div className="flex flex-col">
                    <span>Ít kho nhất (Greedy Set Cover)</span>
                    <span className="text-xs text-muted-foreground">Ưu tiên chọn ít kho nhất, kho có tồn kho nhiều</span>
                  </div>
                </SelectItem>
                <SelectItem value="MIN_DISTANCE">
                  <div className="flex flex-col">
                    <span>Gần nhất (By Distance)</span>
                    <span className="text-xs text-muted-foreground">Ưu tiên kho gần điểm đến nhất (cần tọa độ)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <CardDescription>
            Sẽ tạo {warehouseSummary.length} phiếu xuất kho từ các kho sau
          {allocationSummary && strategy === 'MIN_DISTANCE' && allocationSummary.totalDistance !== undefined && allocationSummary.totalDistance !== null && (
            <> 
             <p className="text-xs text-muted-foreground mb-2">Với Tổng khoảng cách là <span className=' text-blue-600'
                 >{allocationSummary.totalDistance.toFixed(2)} km</span></p>
            </>
          )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Strategy Selection */}

          {/* Warehouse Summary Grid */}
          {warehouseSummary.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Chưa có phân bổ nào
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {warehouseSummary.map((warehouse) => {
                const warehouseDetail = allocationSummary?.warehouseDetails?.find(
                  (d) => d.warehouseId === warehouse.warehouseId
                );
                return (
                  <div
                    key={warehouse.warehouseId}
                    className="flex items-center justify-between p-3 bg-background rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">{warehouse.warehouseName}</p>
                      <p className="text-xs text-muted-foreground">
                        {warehouse.fabricCount} loại vải
                      </p>
                      {strategy === 'MIN_DISTANCE' && warehouseDetail?.distance !== undefined && warehouseDetail?.distance !== null && (
                        <p className="text-xs text-blue-600 mt-1">
                           {warehouseDetail.distance.toFixed(2)} km
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-primary">
                        {warehouse.totalQuantity}
                      </p>
                      <p className="text-xs text-muted-foreground">cuộn</p>
                    </div>
                  </div>
                );
              })}
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
                        <span className="text-muted-foreground ">Màu sắc:</span>
                        <span className="inline-flex items-center gap-2 ml-2">
                          {fabricAllocation.fabric.color.hexCode && (
                            <span
                              className="w-4 h-4 rounded border border-input inline-block"
                              style={{ backgroundColor: fabricAllocation.fabric.color.hexCode }}
                            />
                          )}
                          <span className="font-medium">{fabricAllocation.fabric.color.name}</span>
                        </span>
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
                          <span className="ml-2 text-red-500 text-xs inline-flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Không đủ
                          </span>
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
                      {fabricAllocation.allocations.map((allocation, index) => {
                        const warehouseStock = fabricAllocation.availableStocks.find(
                          (s) => s.warehouseId === allocation.warehouseId
                        );
                        return (
                          <div
                            key={`${allocation.warehouseId}-${index}`}
                            className="flex items-center gap-3 p-3 bg-background rounded-lg border"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium truncate">{allocation.warehouseName}</p>
                                {strategy === 'MIN_DISTANCE' && warehouseStock?.distance !== undefined && warehouseStock?.distance !== null && (
                                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded whitespace-nowrap">
                                     {warehouseStock.distance.toFixed(2)} km
                                  </span>
                                )}
                              </div>
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
                        );
                      })}

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
                                <div className="flex items-center gap-3">
                                  <span>{warehouse.warehouseName} (Tồn: {warehouse.currentStock})</span>
                                  {strategy === 'MIN_DISTANCE' && warehouse.distance !== undefined && warehouse.distance !== null && (
                                    <span className="text-xs text-blue-600"> {warehouse.distance.toFixed(2)} km</span>
                                  )}
                                </div>
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
