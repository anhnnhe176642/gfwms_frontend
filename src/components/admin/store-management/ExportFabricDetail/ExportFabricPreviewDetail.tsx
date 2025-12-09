'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ExportFabricStatusBadge } from '@/components/admin/table/Badges';
import { exportFabricService } from '@/services/exportFabric.service';
import { warehouseService } from '@/services/warehouse.service';
import type { ExportFabricDetail } from '@/services/exportFabric.service';
import type { FabricShelvesData, FabricPickupPriority, FabricPickupData } from '@/types/warehouse';
import {
  ArrowLeft,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Package,
  Warehouse,
  FileText,
  Plus,
  Trash2,
  CheckCircle,
  Calendar,
  User,
  Wand2,
  TrendingDown,
  TrendingUp,
  Clock,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import { getServerErrorMessage } from '@/lib/errorHandler';
import { cn } from '@/lib/utils';

interface ExportFabricPreviewDetailProps {
  warehouseId: number | string;
  exportFabricId: number | string;
}

// Batch allocation for a single shelf
interface BatchAllocation {
  importId: number;
  quantity: number;
  maxQuantity: number;
  importDate: string;
  importPrice: number;
  importedBy: string;
}

// Shelf selection with batch allocations
interface ShelfSelection {
  shelfId: number;
  shelfCode: string;
  batches: BatchAllocation[];
}

// Item allocation state
interface ItemAllocationState {
  fabricId: number;
  quantityNeeded: number;
  shelvesData: FabricShelvesData | null;
  loading: boolean;
  error: string | null;
  selectedShelf: number | null;
  shelfSelections: ShelfSelection[];
  suggestPickLoading: boolean;
}

// Priority options for auto-pick
const PRIORITY_OPTIONS: { value: FabricPickupPriority; label: string; icon: React.ReactNode; description: string }[] = [
  { 
    value: 'OLDEST_FIRST', 
    label: 'FIFO (Cũ trước)', 
    icon: <Clock className="h-4 w-4" />,
    description: 'Lấy lô nhập cũ nhất trước'
  },
  { 
    value: 'NEWEST_FIRST', 
    label: 'LIFO (Mới trước)', 
    icon: <Clock className="h-4 w-4" />,
    description: 'Lấy lô nhập mới nhất trước'
  },
  { 
    value: 'LOWEST_PRICE', 
    label: 'Giá thấp nhất', 
    icon: <TrendingDown className="h-4 w-4" />,
    description: 'Ưu tiên lô có giá nhập thấp'
  },
  { 
    value: 'HIGHEST_PRICE', 
    label: 'Giá cao nhất', 
    icon: <TrendingUp className="h-4 w-4" />,
    description: 'Ưu tiên lô có giá nhập cao'
  },
  { 
    value: 'FEWEST_SHELVES', 
    label: 'Ít kệ nhất', 
    icon: <Layers className="h-4 w-4" />,
    description: 'Lấy từ ít kệ nhất có thể'
  },
];

export function ExportFabricPreviewDetail({ warehouseId, exportFabricId }: ExportFabricPreviewDetailProps) {
  const router = useRouter();
  const [exportFabric, setExportFabric] = useState<ExportFabricDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [approvalNote, setApprovalNote] = useState('');

  // Track allocations for each fabric item
  const [itemAllocations, setItemAllocations] = useState<Map<number, ItemAllocationState>>(new Map());
  
  // Global priority for auto-pick all
  const [globalPriority, setGlobalPriority] = useState<FabricPickupPriority>('OLDEST_FIRST');
  const [isSuggestingAll, setIsSuggestingAll] = useState(false);

  const fetchPreview = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await exportFabricService.getPreview(exportFabricId);
      setExportFabric(data);

      // Initialize allocations map
      const initialAllocations = new Map<number, ItemAllocationState>();
      data.exportItems.forEach((item) => {
        initialAllocations.set(item.fabricId, {
          fabricId: item.fabricId,
          quantityNeeded: item.quantity,
          shelvesData: null,
          loading: true,
          error: null,
          selectedShelf: null,
          shelfSelections: [],
          suggestPickLoading: false,
        });
      });
      setItemAllocations(initialAllocations);

      // Fetch shelves data for each fabric
      await Promise.all(
        data.exportItems.map(async (item) => {
          try {
            const shelvesData = await warehouseService.getFabricShelves(warehouseId, item.fabricId);
            setItemAllocations((prev) => {
              const newMap = new Map(prev);
              const current = newMap.get(item.fabricId);
              if (current) {
                newMap.set(item.fabricId, {
                  ...current,
                  shelvesData,
                  loading: false,
                });
              }
              return newMap;
            });
          } catch (err) {
            const errorMessage = getServerErrorMessage(err) || 'Không thể tải danh sách kệ';
            setItemAllocations((prev) => {
              const newMap = new Map(prev);
              const current = newMap.get(item.fabricId);
              if (current) {
                newMap.set(item.fabricId, {
                  ...current,
                  loading: false,
                  error: errorMessage,
                });
              }
              return newMap;
            });
          }
        })
      );
    } catch (err) {
      const errorMessage = getServerErrorMessage(err) || 'Không thể tải chi tiết phiếu xuất';
      setError(errorMessage);
      console.error('Failed to fetch export fabric preview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportFabricId, warehouseId]);

  // Add a shelf selection for a fabric
  const handleAddShelf = (fabricId: number, shelfId: string) => {
    const allocation = itemAllocations.get(fabricId);
    if (!allocation?.shelvesData) return;

    const shelf = allocation.shelvesData.shelves.find((s) => s.id === parseInt(shelfId));
    if (!shelf) return;

    // Check if shelf already selected
    if (allocation.shelfSelections.some((s) => s.shelfId === shelf.id)) {
      toast.error('Kệ này đã được chọn');
      return;
    }

    const newShelfSelection: ShelfSelection = {
      shelfId: shelf.id,
      shelfCode: shelf.code,
      batches: [],
    };

    setItemAllocations((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(fabricId);
      if (current) {
        newMap.set(fabricId, {
          ...current,
          shelfSelections: [...current.shelfSelections, newShelfSelection],
        });
      }
      return newMap;
    });
  };

  // Remove a shelf selection
  const handleRemoveShelf = (fabricId: number, shelfId: number) => {
    setItemAllocations((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(fabricId);
      if (current) {
        newMap.set(fabricId, {
          ...current,
          shelfSelections: current.shelfSelections.filter((s) => s.shelfId !== shelfId),
        });
      }
      return newMap;
    });
  };

  // Add a batch to a shelf selection
  const handleAddBatch = (fabricId: number, shelfId: number, batchImportId: string) => {
    const allocation = itemAllocations.get(fabricId);
    if (!allocation?.shelvesData) return;

    const shelf = allocation.shelvesData.shelves.find((s) => s.id === shelfId);
    if (!shelf) return;

    const batch = shelf.batches.find((b) => b.importId === parseInt(batchImportId));
    if (!batch) return;

    // Check if batch already selected
    const shelfSelection = allocation.shelfSelections.find((s) => s.shelfId === shelfId);
    if (shelfSelection?.batches.some((b) => b.importId === batch.importId)) {
      toast.error('Lô này đã được chọn');
      return;
    }

    const newBatch: BatchAllocation = {
      importId: batch.importId,
      quantity: 0,
      maxQuantity: batch.currentQuantity,
      importDate: batch.importDate,
      importPrice: batch.importPrice,
      importedBy: batch.importedBy.fullname,
    };

    setItemAllocations((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(fabricId);
      if (current) {
        const updatedSelections = current.shelfSelections.map((s) => {
          if (s.shelfId === shelfId) {
            return {
              ...s,
              batches: [...s.batches, newBatch],
            };
          }
          return s;
        });
        newMap.set(fabricId, {
          ...current,
          shelfSelections: updatedSelections,
        });
      }
      return newMap;
    });
  };

  // Remove a batch from a shelf selection
  const handleRemoveBatch = (fabricId: number, shelfId: number, importId: number) => {
    setItemAllocations((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(fabricId);
      if (current) {
        const updatedSelections = current.shelfSelections.map((s) => {
          if (s.shelfId === shelfId) {
            return {
              ...s,
              batches: s.batches.filter((b) => b.importId !== importId),
            };
          }
          return s;
        });
        newMap.set(fabricId, {
          ...current,
          shelfSelections: updatedSelections,
        });
      }
      return newMap;
    });
  };

  // Update batch quantity
  const handleBatchQuantityChange = (
    fabricId: number,
    shelfId: number,
    importId: number,
    value: string
  ) => {
    const qty = parseInt(value) || 0;

    setItemAllocations((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(fabricId);
      if (current) {
        const updatedSelections = current.shelfSelections.map((s) => {
          if (s.shelfId === shelfId) {
            return {
              ...s,
              batches: s.batches.map((b) => {
                if (b.importId === importId) {
                  return {
                    ...b,
                    quantity: Math.min(Math.max(0, qty), b.maxQuantity),
                  };
                }
                return b;
              }),
            };
          }
          return s;
        });
        newMap.set(fabricId, {
          ...current,
          shelfSelections: updatedSelections,
        });
      }
      return newMap;
    });
  };

  // Calculate total allocated for a fabric
  const getTotalAllocated = (fabricId: number): number => {
    const allocation = itemAllocations.get(fabricId);
    if (!allocation) return 0;
    return allocation.shelfSelections.reduce(
      (sum, s) => sum + s.batches.reduce((bSum, b) => bSum + b.quantity, 0),
      0
    );
  };

  // Apply pickup data to allocations
  const applyPickupData = (fabricId: number, pickupData: FabricPickupData) => {
    const allocation = itemAllocations.get(fabricId);
    if (!allocation?.shelvesData) return;

    // Convert pickup data to shelf selections
    const newShelfSelections: ShelfSelection[] = pickupData.shelves.map((pickupShelf) => {
      // Find matching shelf in shelvesData to get importedBy info
      const shelfData = allocation.shelvesData?.shelves.find((s) => s.id === pickupShelf.shelfId);
      
      return {
        shelfId: pickupShelf.shelfId,
        shelfCode: pickupShelf.shelfCode,
        batches: pickupShelf.batches.map((pickupBatch) => {
          // Find matching batch to get importedBy
          const batchData = shelfData?.batches.find((b) => b.importId === pickupBatch.importId);
          return {
            importId: pickupBatch.importId,
            quantity: pickupBatch.pickQuantity,
            maxQuantity: pickupBatch.availableQuantity,
            importDate: pickupBatch.importDate,
            importPrice: pickupBatch.importPrice,
            importedBy: batchData?.importedBy.fullname || 'N/A',
          };
        }),
      };
    });

    setItemAllocations((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(fabricId);
      if (current) {
        newMap.set(fabricId, {
          ...current,
          shelfSelections: newShelfSelections,
          suggestPickLoading: false,
        });
      }
      return newMap;
    });
  };

  // Suggest pickup for a single fabric item
  const handleSuggestPick = async (fabricId: number, priority: FabricPickupPriority) => {
    const allocation = itemAllocations.get(fabricId);
    if (!allocation) return;

    setItemAllocations((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(fabricId);
      if (current) {
        newMap.set(fabricId, { ...current, suggestPickLoading: true });
      }
      return newMap;
    });

    try {
      const pickupData = await warehouseService.getFabricPickup(
        warehouseId,
        fabricId,
        { quantity: allocation.quantityNeeded, priority }
      );
      
      applyPickupData(fabricId, pickupData);
      
      toast.success(
        `Đã gợi ý phân bổ ${pickupData.summary.totalPickQuantity} cuộn từ ${pickupData.summary.totalShelvesUsed} kệ`
      );
    } catch (err) {
      const errorMessage = getServerErrorMessage(err) || 'Không thể gợi ý phân bổ';
      toast.error(errorMessage);
      setItemAllocations((prev) => {
        const newMap = new Map(prev);
        const current = newMap.get(fabricId);
        if (current) {
          newMap.set(fabricId, { ...current, suggestPickLoading: false });
        }
        return newMap;
      });
    }
  };

  // Suggest pickup for all fabric items
  const handleSuggestPickAll = async () => {
    setIsSuggestingAll(true);
    
    const allocationsArray = Array.from(itemAllocations.values());
    let successCount = 0;
    let failCount = 0;

    for (const allocation of allocationsArray) {
      if (allocation.loading || allocation.error) continue;
      
      setItemAllocations((prev) => {
        const newMap = new Map(prev);
        const current = newMap.get(allocation.fabricId);
        if (current) {
          newMap.set(allocation.fabricId, { ...current, suggestPickLoading: true });
        }
        return newMap;
      });

      try {
        const pickupData = await warehouseService.getFabricPickup(
          warehouseId,
          allocation.fabricId,
          { quantity: allocation.quantityNeeded, priority: globalPriority }
        );
        
        applyPickupData(allocation.fabricId, pickupData);
        successCount++;
      } catch (err) {
        failCount++;
        setItemAllocations((prev) => {
          const newMap = new Map(prev);
          const current = newMap.get(allocation.fabricId);
          if (current) {
            newMap.set(allocation.fabricId, { ...current, suggestPickLoading: false });
          }
          return newMap;
        });
      }
    }

    setIsSuggestingAll(false);
    
    if (successCount > 0) {
      toast.success(`Đã gợi ý phân bổ thành công ${successCount} loại vải`);
    }
    if (failCount > 0) {
      toast.error(`Không thể gợi ý phân bổ ${failCount} loại vải`);
    }
  };

  // Check if all allocations are valid
  const isAllAllocationsValid = (): boolean => {
    for (const [, allocation] of itemAllocations) {
      const totalAllocated = getTotalAllocated(allocation.fabricId);
      if (totalAllocated !== allocation.quantityNeeded) return false;
      if (allocation.shelfSelections.length === 0) return false;
      if (allocation.shelfSelections.some((s) => s.batches.length === 0)) return false;
    }
    return true;
  };

  const handleApprove = async () => {
    if (!isAllAllocationsValid()) {
      toast.error('Vui lòng kiểm tra lại phân bổ kệ cho tất cả các mục');
      return;
    }

    try {
      setIsApproving(true);

      // Build batchPickupDetails from allocations
      const batchPickupDetails: Array<{
        fabricId: number;
        batches: Array<{
          importId: number;
          shelfId: number;
          pickQuantity: number;
        }>;
      }> = [];

      itemAllocations.forEach((allocation) => {
        const batches: Array<{
          importId: number;
          shelfId: number;
          pickQuantity: number;
        }> = [];

        allocation.shelfSelections.forEach((shelfSelection) => {
          shelfSelection.batches.forEach((batch) => {
            if (batch.quantity > 0) {
              batches.push({
                importId: batch.importId,
                shelfId: shelfSelection.shelfId,
                pickQuantity: batch.quantity,
              });
            }
          });
        });

        if (batches.length > 0) {
          batchPickupDetails.push({
            fabricId: allocation.fabricId,
            batches,
          });
        }
      });

      await exportFabricService.approveExport(exportFabricId, batchPickupDetails, approvalNote || undefined);

      toast.success('Phiếu xuất kho đã được duyệt thành công');
      router.back();
    } catch (err) {
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

  const allocationArray = Array.from(itemAllocations.values());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Xem trước phiếu xuất #{exportFabric.id}
            </h1>
            <p className="text-muted-foreground">
              Kho: <span className="font-medium">{exportFabric.warehouse.name}</span> →{' '}
              Cửa hàng: <span className="font-medium">{exportFabric.store.name}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={fetchPreview}
            disabled={loading || isApproving}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
          <Button
            onClick={handleApprove}
            disabled={!isAllAllocationsValid() || isApproving}
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

      {/* Export Info Card */}
      <Card>
        <CardHeader className="py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Thông tin phiếu xuất
            </CardTitle>
            <ExportFabricStatusBadge status={exportFabric.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">ID Phiếu:</span>
              <span className="ml-2 font-mono font-semibold">#{exportFabric.id}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Người tạo:</span>
              <span className="ml-2 font-medium">{exportFabric.createdBy.username}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Ngày tạo:</span>
              <span className="ml-2">{new Date(exportFabric.createdAt).toLocaleString('vi-VN')}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Số loại vải:</span>
              <span className="ml-2 font-medium">{exportFabric.exportItems.length}</span>
            </div>
          </div>
          {exportFabric.note && (
            <div className="mt-4">
              <span className="text-muted-foreground text-sm">Ghi chú:</span>
              <p className="text-sm bg-muted p-2 rounded mt-1">{exportFabric.note}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suggestion Controls */}
      <Card className="bg-muted/30">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Gợi ý phân bổ kệ/lô</p>
                <p className="text-xs text-muted-foreground">
                  Chọn tiêu chí ưu tiên và nhấn nút để gợi ý chọn kệ/lô cho tất cả loại vải
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Select
                value={globalPriority}
                onValueChange={(value) => setGlobalPriority(value as FabricPickupPriority)}
                disabled={isSuggestingAll || isApproving}
              >
                <SelectTrigger className="w-full sm:w-[200px] bg-background">
                  <SelectValue placeholder="Chọn tiêu chí..." />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {option.icon}
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                          <span className="text-xs text-muted-foreground">{option.description}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleSuggestPickAll}
                disabled={isSuggestingAll || isApproving || loading}
                className="gap-2 whitespace-nowrap"
              >
                {isSuggestingAll ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang gợi ý...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    Gợi ý tất cả
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fabric Allocations */}
      <div className="space-y-4">
        {allocationArray.map((allocation) => {
          const exportItem = exportFabric.exportItems.find(
            (item) => item.fabricId === allocation.fabricId
          );
          if (!exportItem) return null;

          const totalAllocated = getTotalAllocated(allocation.fabricId);
          const remaining = allocation.quantityNeeded - totalAllocated;
          const isComplete = remaining === 0;
          const isOver = remaining < 0;

          // Get available shelves (not yet selected)
          const selectedShelfIds = new Set(allocation.shelfSelections.map((s) => s.shelfId));
          const availableShelves =
            allocation.shelvesData?.shelves.filter(
              (s) => !selectedShelfIds.has(s.id) && s.totalFabricQuantity > 0
            ) || [];

          return (
            <Card
              key={allocation.fabricId}
              className={cn(
                'transition-colors',
                isComplete && 'border-green-500/50',
                isOver && 'border-red-500/50'
              )}
            >
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
                            {allocation.shelvesData?.fabric?.category?.name || `Vải #${allocation.fabricId}`}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            ID: #{allocation.fabricId}
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
                          <span
                            className={cn(
                              'text-lg font-semibold',
                              isComplete && 'text-green-600',
                              isOver && 'text-red-600',
                              !isComplete && !isOver && 'text-yellow-600'
                            )}
                          >
                            {totalAllocated} / {allocation.quantityNeeded}
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
                    {allocation.loading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-muted-foreground">Đang tải thông tin...</span>
                      </div>
                    ) : allocation.error ? (
                      <div className="text-red-500 text-sm py-4">{allocation.error}</div>
                    ) : allocation.shelvesData ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Màu sắc:</span>
                            <div className="flex items-center gap-2 ml-2">
                              {allocation.shelvesData?.fabric?.color?.hexCode && (
                                <div
                                  className="w-4 h-4 rounded border border-input"
                                  style={{ backgroundColor: allocation.shelvesData?.fabric?.color?.hexCode }}
                                />
                              )}
                              <span className="font-medium">
                                {allocation.shelvesData?.fabric?.color?.name}
                              </span>
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Độ bóng:</span>
                            <span className="ml-2 font-medium">
                              {allocation.shelvesData?.fabric?.gloss?.description}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Nhà cung cấp:</span>
                            <span className="ml-2 font-medium">
                              {allocation.shelvesData?.fabric?.supplier?.name}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Chiều dài:</span>
                            <span className="ml-2 font-medium">
                              {allocation.shelvesData?.fabric?.length}m
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Giá bán:</span>
                            <span className="ml-2 font-medium">
                              {allocation.shelvesData?.fabric?.sellingPrice.toLocaleString('vi-VN')}₫
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Tồn kho tổng:</span>
                            <span className="ml-2 font-medium">
                              {allocation.shelvesData?.totalQuantity}
                            </span>
                            {allocation.shelvesData && allocation.shelvesData.totalQuantity < allocation.quantityNeeded && (
                              <span className="ml-2 text-red-500 text-xs">⚠️ Không đủ</span>
                            )}
                          </div>
                        </div>

                        {/* Summary Stats - Calculate from current allocations */}
                        {allocation.shelfSelections.length > 0 && (
                          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                            <p className="text-sm font-semibold">Thống kê phân bổ</p>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-muted-foreground">Số kệ:</span>
                                <span className="ml-2 font-medium">{allocation.shelfSelections.length}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Số lô:</span>
                                <span className="ml-2 font-medium">
                                  {allocation.shelfSelections.reduce((sum, s) => sum + s.batches.length, 0)}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Tổng lượng:</span>
                                <span className="ml-2 font-medium">
                                  {getTotalAllocated(allocation.fabricId)}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Tổng chi phí:</span>
                                <span className="ml-2 font-medium">
                                  {allocation.shelfSelections
                                    .reduce(
                                      (sum, s) =>
                                        sum +
                                        s.batches.reduce(
                                          (bSum, b) => bSum + b.importPrice * b.quantity,
                                          0
                                        ),
                                      0
                                    )
                                    .toLocaleString('vi-VN')}
                                  ₫
                                </span>
                              </div>
                              <div className="col-span-2">
                                <span className="text-muted-foreground">Giá trung bình/cuộn:</span>
                                <span className="ml-2 font-medium">
                                  {getTotalAllocated(allocation.fabricId) > 0
                                    ? Math.round(
                                        allocation.shelfSelections.reduce(
                                          (sum, s) =>
                                            sum +
                                            s.batches.reduce(
                                              (bSum, b) => bSum + b.importPrice * b.quantity,
                                              0
                                            ),
                                          0
                                        ) / getTotalAllocated(allocation.fabricId)
                                      ).toLocaleString('vi-VN')
                                    : '0'}
                                  ₫
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>

                  {/* Right side - Shelf & Batch Selection */}
                  <div className="p-6 space-y-4 bg-muted/20">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Warehouse className="h-4 w-4" />
                        Chọn kệ và lô nhập
                      </Label>
                      {!allocation.loading && !allocation.error && allocation.shelvesData && (
                        <Select
                          value=""
                          onValueChange={(priority) => 
                            handleSuggestPick(allocation.fabricId, priority as FabricPickupPriority)
                          }
                          disabled={allocation.suggestPickLoading || isApproving}
                        >
                          <SelectTrigger className="w-[140px] h-8 text-xs bg-background">
                            {allocation.suggestPickLoading ? (
                              <div className="flex items-center gap-1">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span>Đang chọn...</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-primary">
                                <Wand2 className="h-3 w-3" />
                                <span>Gợi ý kệ</span>
                              </div>
                            )}
                          </SelectTrigger>
                          <SelectContent>
                            {PRIORITY_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center gap-2">
                                  {option.icon}
                                  <span className="text-sm">{option.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    {allocation.loading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : allocation.error ? (
                      <div className="text-red-500 text-sm">{allocation.error}</div>
                    ) : (
                      <div className="space-y-4">
                        {/* Selected shelves */}
                        {allocation.shelfSelections.map((shelfSelection) => {
                          const shelfData = allocation.shelvesData?.shelves.find(
                            (s) => s.id === shelfSelection.shelfId
                          );
                          const selectedBatchIds = new Set(
                            shelfSelection.batches.map((b) => b.importId)
                          );
                          const availableBatches =
                            shelfData?.batches.filter(
                              (b) => !selectedBatchIds.has(b.importId) && b.currentQuantity > 0
                            ) || [];

                          return (
                            <div
                              key={shelfSelection.shelfId}
                              className="p-4 bg-background rounded-lg border space-y-3"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{shelfSelection.shelfCode}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Tồn kho: {shelfData?.totalFabricQuantity || 0} cuộn
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleRemoveShelf(allocation.fabricId, shelfSelection.shelfId)
                                  }
                                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-100"
                                  disabled={isApproving}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              {/* Batches in this shelf */}
                              <div className="space-y-2 pl-2 border-l-2 border-muted">
                                {shelfSelection.batches.map((batch) => (
                                  <div
                                    key={batch.importId}
                                    className="flex items-center gap-3 p-2 bg-muted/50 rounded"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-3 w-3 text-muted-foreground" />
                                        <span>
                                          {new Date(batch.importDate).toLocaleDateString('vi-VN')}
                                        </span>
                                        <span className="text-muted-foreground">•</span>
                                        <span className="text-muted-foreground">
                                          {batch.importPrice.toLocaleString('vi-VN')}₫
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                        <User className="h-3 w-3" />
                                        <span className="truncate">{batch.importedBy}</span>
                                        <span>•</span>
                                        <span>Tối đa: {batch.maxQuantity}</span>
                                      </div>
                                    </div>
                                    <Input
                                      type="number"
                                      min={0}
                                      max={batch.maxQuantity}
                                      value={batch.quantity}
                                      onChange={(e) =>
                                        handleBatchQuantityChange(
                                          allocation.fabricId,
                                          shelfSelection.shelfId,
                                          batch.importId,
                                          e.target.value
                                        )
                                      }
                                      className={cn(
                                        'w-20 text-center',
                                        batch.quantity > batch.maxQuantity && 'border-red-500'
                                      )}
                                      disabled={isApproving}
                                    />
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        handleRemoveBatch(
                                          allocation.fabricId,
                                          shelfSelection.shelfId,
                                          batch.importId
                                        )
                                      }
                                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-100 shrink-0"
                                      disabled={isApproving}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}

                                {/* Add batch */}
                                {availableBatches.length > 0 && (
                                  <Select
                                    key={`add-batch-${shelfSelection.shelfId}-${shelfSelection.batches.length}`}
                                    value=""
                                    onValueChange={(value) =>
                                      handleAddBatch(
                                        allocation.fabricId,
                                        shelfSelection.shelfId,
                                        value
                                      )
                                    }
                                    disabled={isApproving}
                                  >
                                    <SelectTrigger className="bg-background h-9">
                                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                        <Plus className="h-3 w-3" />
                                        <span>Thêm lô nhập...</span>
                                      </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                      {availableBatches.map((batch) => (
                                        <SelectItem
                                          key={batch.importId}
                                          value={String(batch.importId)}
                                        >
                                          <div className="flex flex-col">
                                            <span>
                                              Lô #{batch.importId} -{' '}
                                              {new Date(batch.importDate).toLocaleDateString('vi-VN')}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                              Còn: {batch.currentQuantity} • Giá:{' '}
                                              {batch.importPrice.toLocaleString('vi-VN')}₫
                                            </span>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}

                                {shelfSelection.batches.length === 0 && (
                                  <p className="text-xs text-muted-foreground py-1">
                                    Chưa chọn lô nhập nào
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Add shelf */}
                        {availableShelves.length > 0 && (
                          <Select
                            key={`add-shelf-${allocation.fabricId}-${allocation.shelfSelections.length}`}
                            value=""
                            onValueChange={(value) =>
                              handleAddShelf(allocation.fabricId, value)
                            }
                            disabled={isApproving}
                          >
                            <SelectTrigger className="bg-background">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Plus className="h-4 w-4" />
                                <span>Thêm kệ...</span>
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              {availableShelves.map((shelf) => (
                                <SelectItem key={shelf.id} value={String(shelf.id)}>
                                  {shelf.code} (Tồn: {shelf.totalFabricQuantity} cuộn,{' '}
                                  {shelf.batches.length} lô)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}

                        {allocation.shelfSelections.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-2">
                            Chưa chọn kệ nào. Vui lòng thêm kệ để phân bổ.
                          </p>
                        )}
                      </div>
                    )}
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
                  {allocationArray.reduce((sum, a) => sum + a.quantityNeeded, 0)} cuộn
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Đã phân bổ:</span>
                <span
                  className={cn(
                    'ml-2 font-medium',
                    isAllAllocationsValid() ? 'text-green-600' : 'text-yellow-600'
                  )}
                >
                  {allocationArray.reduce((sum, a) => sum + getTotalAllocated(a.fabricId), 0)} cuộn
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => router.back()} disabled={isApproving}>
                Hủy
              </Button>
              <Button
                onClick={handleApprove}
                disabled={!isAllAllocationsValid() || isApproving}
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
        </CardContent>
      </Card>
    </div>
  );
}
