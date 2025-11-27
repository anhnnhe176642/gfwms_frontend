'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { InfiniteScrollSelect } from '@/components/admin/import-fabric-management/InfiniteScrollSelect';
import * as React from 'react';
import { Loader, Plus, Trash2 } from 'lucide-react';
import { exportFabricService } from '@/services/exportFabric.service';
import { warehouseService } from '@/services/warehouse.service';
import { fabricService } from '@/services/fabric.service';
import { getServerErrorMessage, extractFieldErrors } from '@/lib/errorHandler';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

export interface CreateExportFabricDialogProps {
  storeId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type ExportItem = {
  fabricId: number | null;
  quantity: string;
  error?: string;
};

export function CreateExportFabricDialog({
  storeId,
  open,
  onOpenChange,
  onSuccess,
}: CreateExportFabricDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [note, setNote] = useState('');
  const [exportItems, setExportItems] = useState<ExportItem[]>([{ fabricId: null, quantity: '' }]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Infinite scroll for warehouses
  const {
    data: warehouses,
    loading: warehousesLoading,
    hasMore: warehousesHasMore,
    loadMore: loadMoreWarehouses,
    handleSearch: handleWarehouseSearch,
  } = useInfiniteScroll({
    fetchData: warehouseService.getWarehousesForInfiniteScroll,
    pageSize: 10,
  });

  // Infinite scroll for fabrics
  const {
    data: fabrics,
    loading: fabricsLoading,
    hasMore: fabricsHasMore,
    loadMore: loadMoreFabrics,
    handleSearch: handleFabricSearch,
  } = useInfiniteScroll({
    fetchData: fabricService.getFabrics,
    pageSize: 10,
  });


  const handleAddItem = () => {
    setExportItems([...exportItems, { fabricId: null, quantity: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    if (exportItems.length > 1) {
      setExportItems(exportItems.filter((_, i) => i !== index));
    }
  };

  const handleFabricSelect = (index: number, fabricId: number) => {
    const newItems = [...exportItems];
    newItems[index] = { ...newItems[index], fabricId };
    setExportItems(newItems);
  };

  const handleQuantityChange = (index: number, quantity: string) => {
    const newItems = [...exportItems];
    newItems[index] = { ...newItems[index], quantity };
    setExportItems(newItems);
  };

  const getSelectedFabricDisplay = (fabricId: number | null) => {
    if (!fabricId) return 'Chọn vải';
    const fabric = fabrics.find((f) => f.id === fabricId);
    return fabric
      ? `#${fabric.id} - ${fabric.category.name} - ${fabric.color.name}`
      : `#${fabricId}`;
  };

  const getSelectedWarehouseDisplay = () => {
    if (!selectedWarehouse) return 'Chọn kho';
    const warehouse = warehouses.find((w) => w.id.toString() === selectedWarehouse);
    return warehouse ? warehouse.name : `#${selectedWarehouse}`;
  };


  const handleSubmit = async () => {
    // Clear previous errors
    setFieldErrors({});

    // Validation
    if (!selectedWarehouse) {
      toast.error('Vui lòng chọn kho');
      return;
    }

    const validItems = exportItems.filter(
      (item) => item.fabricId && item.quantity.trim()
    );

    if (validItems.length === 0) {
      toast.error('Vui lòng thêm ít nhất một mặt hàng');
      return;
    }

    setIsLoading(true);
    try {
      await exportFabricService.createExportFabric({
        warehouseId: parseInt(selectedWarehouse),
        storeId,
        note: note || undefined,
        exportItems: validItems.map((item) => ({
          fabricId: item.fabricId!,
          quantity: parseInt(item.quantity),
        })),
      });

      toast.success('Tạo phiếu xuất kho thành công');
      onOpenChange(false);

      // Reset form
      setSelectedWarehouse('');
      setNote('');
      setExportItems([{ fabricId: null, quantity: '' }]);
      setFieldErrors({});

      onSuccess?.();
    } catch (err) {
      const fieldErrs = extractFieldErrors(err);
      setFieldErrors(fieldErrs);

      const message = getServerErrorMessage(err) || 'Không thể tạo phiếu xuất kho';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" style={{ pointerEvents: 'auto' }}>
        <DialogHeader>
          <DialogTitle>Tạo phiếu xuất kho</DialogTitle>
          <DialogDescription>
            Tạo phiếu xuất kho để chuyển vải từ kho đến cửa hàng
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warehouse Selection with Infinite Scroll */}
          <div className="space-y-2">
            <Label>
              Chọn kho <span className="text-destructive">*</span>
            </Label>
            <InfiniteScrollSelect
              value={selectedWarehouse}
              onChange={(val) => setSelectedWarehouse(val)}
              error={fieldErrors.warehouseId}
              fetchData={warehouseService.getWarehousesForInfiniteScroll}
              getLabel={(w: any) => w.name}
              getValue={(w: any) => w.id.toString()}
              placeholder={getSelectedWarehouseDisplay()}
              disabled={isLoading}
              disablePortal
            />
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note">Ghi chú (tùy chọn)</Label>
            <Input
              id="note"
              placeholder="Nhập ghi chú..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Export Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Mặt hàng xuất kho</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm mặt hàng
              </Button>
            </div>

            <div className="space-y-3 max-h-48 overflow-y-auto border rounded-lg p-3 bg-muted/30">
              {exportItems.map((item, index) => (
                <div key={index} className="flex gap-2 items-start border rounded-lg p-3">
                  <div className="flex-1 space-y-2">
                    <Label className="text-xs">Chọn vải</Label>
                    <InfiniteScrollSelect
                      value={item.fabricId ? item.fabricId.toString() : ''}
                      onChange={(val) => handleFabricSelect(index, parseInt(val))}
                      error={fieldErrors[`exportItems.${index}.fabricId`]}
                      fetchData={fabricService.getFabrics}
                      getLabel={(f: any) => `#${f.id} - ${f.category.name} - ${f.color.name}`}
                      getValue={(f: any) => f.id.toString()}
                      placeholder={getSelectedFabricDisplay(item.fabricId)}
                      disabled={isLoading}
                      disablePortal
                    />
                  </div>
                  <div className="w-28 space-y-2">
                    <Label className="text-xs">Số lượng</Label>
                    <div>
                      <Input
                        type="number"
                        placeholder="SL"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                        disabled={isLoading}
                        className={`text-sm ${fieldErrors[`exportItems.${index}.quantity`] ? 'border-destructive' : ''}`}
                        min="1"
                      />
                      {fieldErrors[`exportItems.${index}.quantity`] && (
                        <p className="text-xs text-destructive mt-1">{fieldErrors[`exportItems.${index}.quantity`]}</p>
                      )}
                    </div>
                  </div>
                  {exportItems.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(index)}
                      disabled={isLoading}
                      className="h-9 w-9 mt-7"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Đang tạo...' : 'Tạo phiếu xuất kho'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateExportFabricDialog;
