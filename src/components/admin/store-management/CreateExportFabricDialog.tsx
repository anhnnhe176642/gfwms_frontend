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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import * as React from 'react';
import { Loader, Plus, Trash2, Search, X } from 'lucide-react';
import InfiniteScroll from '@/components/ui/infinite-scroll';
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

  // State for popover controls
  const [warehouseSearchInput, setWarehouseSearchInput] = useState('');
  const [fabricSearchInputs, setFabricSearchInputs] = useState<string[]>(['']);
  const [openFabricPopovers, setOpenFabricPopovers] = useState<boolean[]>([false]);
  const [openWarehousePopover, setOpenWarehousePopover] = useState(false);

  const handleAddItem = () => {
    setExportItems([...exportItems, { fabricId: null, quantity: '' }]);
    setOpenFabricPopovers([...openFabricPopovers, false]);
    setFabricSearchInputs([...fabricSearchInputs, '']);
  };

  const handleRemoveItem = (index: number) => {
    if (exportItems.length > 1) {
      setExportItems(exportItems.filter((_, i) => i !== index));
      setOpenFabricPopovers(openFabricPopovers.filter((_, i) => i !== index));
      setFabricSearchInputs(fabricSearchInputs.filter((_, i) => i !== index));
    }
  };

  const handleFabricSelect = (index: number, fabricId: number) => {
    const newItems = [...exportItems];
    newItems[index] = { ...newItems[index], fabricId };
    setExportItems(newItems);
    const newPopovers = [...openFabricPopovers];
    newPopovers[index] = false;
    setOpenFabricPopovers(newPopovers);
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

  const handleWarehouseSearchChange = (value: string) => {
    setWarehouseSearchInput(value);
    handleWarehouseSearch(value);
  };

  const handleFabricSearchChange = (index: number, value: string) => {
    const newSearch = [...fabricSearchInputs];
    newSearch[index] = value;
    setFabricSearchInputs(newSearch);
    handleFabricSearch(value);
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
      setOpenFabricPopovers([false]);
      setFabricSearchInputs(['']);
      setWarehouseSearchInput('');
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
            <Popover open={openWarehousePopover} onOpenChange={setOpenWarehousePopover}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                  disabled={isLoading}
                >
                  <span className="truncate">{getSelectedWarehouseDisplay()}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 z-60" align="start">
                <div className="flex flex-col max-h-80">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 pb-2 border-b">
                    <h4 className="font-medium text-sm">Chọn kho</h4>
                  </div>

                  {/* Search input */}
                  <div className="relative p-4 pt-2 border-b">
                    <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Tìm kiếm kho..."
                      value={warehouseSearchInput}
                      onChange={(e) => handleWarehouseSearchChange(e.target.value)}
                      className="pl-8 pr-8 text-sm"
                    />
                    {warehouseSearchInput && (
                      <button
                        onClick={() => handleWarehouseSearchChange('')}
                        className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Warehouses list with infinite scroll */}
                  <div className="flex-1 overflow-y-auto px-4 pt-2 min-h-40">
                    <div className="flex flex-col gap-2 h-full">
                      {warehouses.length === 0 && !warehousesLoading ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-sm text-gray-500">Không có dữ liệu</div>
                        </div>
                      ) : (
                        <>
                          {warehouses.map((warehouse) => (
                            <div
                              key={warehouse.id}
                              onClick={() => {
                                setSelectedWarehouse(warehouse.id.toString());
                                setOpenWarehousePopover(false);
                              }}
                              className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted"
                            >
                              <Checkbox
                                checked={selectedWarehouse === warehouse.id.toString()}
                                className="cursor-pointer"
                                onCheckedChange={() => {
                                  setSelectedWarehouse(warehouse.id.toString());
                                  setOpenWarehousePopover(false);
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm">{warehouse.name}</div>
                                <div className="text-xs text-muted-foreground truncate">{warehouse.address}</div>
                              </div>
                            </div>
                          ))}
                        </>
                      )}

                      {/* Infinite Scroll Trigger */}
                      <InfiniteScroll
                        hasMore={warehousesHasMore}
                        isLoading={warehousesLoading}
                        next={loadMoreWarehouses}
                        threshold={0.5}
                      >
                        {warehousesHasMore && (
                          <div className="flex items-center justify-center h-12">
                            <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
                          </div>
                        )}
                      </InfiniteScroll>

                      {/* End of list */}
                      {!warehousesHasMore && warehouses.length > 0 && (
                        <div className="flex items-center justify-center h-12">
                          <p className="text-xs text-gray-400 font-medium">✓ Hết dữ liệu</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
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
                    <Popover
                      open={openFabricPopovers[index]}
                      onOpenChange={(newOpen) => {
                        const newPopovers = [...openFabricPopovers];
                        newPopovers[index] = newOpen;
                        setOpenFabricPopovers(newPopovers);
                      }}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left"
                          disabled={isLoading}
                        >
                          <span className="truncate">
                            {getSelectedFabricDisplay(item.fabricId)}
                          </span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0 z-60" align="start">
                        <div className="flex flex-col max-h-80">
                          {/* Header */}
                          <div className="flex items-center justify-between p-4 pb-2 border-b">
                            <h4 className="font-medium text-sm">Chọn vải</h4>
                          </div>

                          {/* Search input */}
                          <div className="relative p-4 pt-2 border-b">
                            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              placeholder="Tìm kiếm vải..."
                              value={fabricSearchInputs[index] || ''}
                              onChange={(e) => handleFabricSearchChange(index, e.target.value)}
                              className="pl-8 pr-8 text-sm"
                            />
                            {fabricSearchInputs[index] && (
                              <button
                                onClick={() => handleFabricSearchChange(index, '')}
                                className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          {/* Items list with infinite scroll */}
                          <div className="flex-1 overflow-y-auto px-4 pt-2 min-h-40">
                            <div className="flex flex-col gap-2 h-full">
                              {fabrics.length === 0 && !fabricsLoading ? (
                                <div className="flex items-center justify-center h-full">
                                  <div className="text-sm text-gray-500">Không có dữ liệu</div>
                                </div>
                              ) : (
                                <>
                                  {fabrics.map((fabric) => (
                                    <div
                                      key={fabric.id}
                                      onClick={() => handleFabricSelect(index, fabric.id)}
                                      className="flex items-start gap-2 p-2 rounded cursor-pointer hover:bg-muted"
                                    >
                                      <Checkbox
                                        checked={item.fabricId === fabric.id}
                                        className="mt-1"
                                        onCheckedChange={() => handleFabricSelect(index, fabric.id)}
                                      />
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm">
                                          #{fabric.id} - {fabric.category.name}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          Màu: {fabric.color.name} | Giá: {fabric.sellingPrice.toLocaleString()} đ
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </>
                              )}

                              {/* Infinite Scroll Trigger */}
                              <InfiniteScroll
                                hasMore={fabricsHasMore}
                                isLoading={fabricsLoading}
                                next={loadMoreFabrics}
                                threshold={0.5}
                              >
                                {fabricsHasMore && (
                                  <div className="flex items-center justify-center h-12">
                                    <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
                                  </div>
                                )}
                              </InfiniteScroll>

                              {/* End of list */}
                              {!fabricsHasMore && fabrics.length > 0 && (
                                <div className="flex items-center justify-center h-12">
                                  <p className="text-xs text-gray-400 font-medium">✓ Hết dữ liệu</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
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
