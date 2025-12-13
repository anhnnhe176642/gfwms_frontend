'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import fabricCustomerService from '@/services/fabricCustomer.service';
import fabricStoreService from '@/services/fabric-store.service';
import type { CartItem } from '@/types/cart';
import type { StoreFilterOption } from '@/services/fabricCustomer.service';
import type { Allocation } from '@/services/fabric-store.service';

interface CartItemRowProps {
  item: CartItem;
  onQuantityChange: (value: string) => void;
  onUnitChange: (unit: 'meter' | 'roll') => void;
  onStoreChange: (storeId: number, storeName?: string) => void;
  onRemove: () => void;
  onAllocationUpdate?: (allocations: Allocation[], totalValue: number) => void;
}

export default function CartItemRow({
  item,
  onQuantityChange,
  onUnitChange,
  onStoreChange,
  onRemove,
  onAllocationUpdate,
}: CartItemRowProps) {
  const [stores, setStores] = useState<StoreFilterOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [quantityError, setQuantityError] = useState<string>('');
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [totalValue, setTotalValue] = useState<number>(0);

  const { fabric, quantity, unit, storeId, storeName } = item;
  const {
    categoryId,
    categoryName,
    glossId,
    glossDescription,
    thickness,
    thicknessLabel,
    width,
    widthLabel,
    length,
    lengthLabel,
  } = item;

  // Fetch stores based on filters
  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        const data = await fabricCustomerService.getFilterOptions({
          colorId: fabric.color?.id,
          categoryId,
          glossId,
          thickness,
          width,
          length,
        });
        setStores(data.stores);
      } catch (error) {
        console.error('Failed to fetch stores:', error);
        setStores([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [fabric.color?.id, categoryId, glossId, thickness, width, length]);

  // Fetch allocation data when storeId, quantity, or unit changes
  useEffect(() => {
    if (!storeId || quantity <= 0) {
      setAllocations([]);
      setTotalValue(0);
      return;
    }

    const fetchAllocation = async () => {
      try {
        const response = await fabricStoreService.allocate({
          categoryId,
          quantity,
          unit: unit === 'meter' ? 'METER' : 'ROLL',
          storeId,
          colorId: fabric.color?.id,
          glossId,
          thickness,
          width,
          length,
        });

        setAllocations(response.allocations);
        setTotalValue(response.totalValue);
        onAllocationUpdate?.(response.allocations, response.totalValue);
      } catch (error) {
        console.error('Failed to fetch allocation data:', error);
        setAllocations([]);
        setTotalValue(0);
      }
    };

    fetchAllocation();
  }, [storeId, quantity, unit, categoryId, glossId, thickness, width, length, fabric.color?.id]);

  // Validate quantity against store availability
  const validateQuantity = useCallback(
    (qty: number) => {
      if (!storeId) {
        setQuantityError('');
        return true;
      }

      const store = stores.find((s) => s.id === storeId);
      if (!store) {
        setQuantityError('');
        return true;
      }

      const availableQty = unit === 'meter' ? store.totalMeters : store.totalUncutRolls;
      if (qty > availableQty) {
        setQuantityError(
          `Số lượng không được vượt quá ${Math.round(availableQty).toLocaleString('vi-VN')} ${
            unit === 'meter' ? 'mét' : 'cuộn'
          }`
        );
        return false;
      }

      setQuantityError('');
      return true;
    },
    [storeId, unit, stores]
  );

  const handleQuantityChange = (value: string) => {
    const newQty = Math.max(1, parseInt(value) || 1);
    onQuantityChange(value);
    validateQuantity(newQty);
  };

  const handleUnitChange = (newUnit: 'meter' | 'roll') => {
    onUnitChange(newUnit);
    setTimeout(() => validateQuantity(quantity), 0);
  };

  const handleStoreChange = (newStoreId: number) => {
    const selectedStore = stores.find((s) => s.id === newStoreId);
    onStoreChange(newStoreId, selectedStore?.name);
    validateQuantity(quantity);
  };

  const totalPrice = totalValue || 0;

  // Build attributes summary
  const attributesSummary = [];
  if (categoryName) {
    attributesSummary.push(categoryName);
  }
  if (glossDescription) {
    attributesSummary.push(glossDescription);
  }
  if (thicknessLabel) {
    attributesSummary.push(thicknessLabel);
  }
  if (widthLabel) {
    attributesSummary.push(widthLabel);
  }
  if (lengthLabel) {
    attributesSummary.push(lengthLabel);
  }

  return (
    <div className="border rounded-lg p-4 hover:bg-muted/50 transition">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Product Info - Left */}
        <div className="space-y-2 col-span-1 md:col-span-3">
          <h3 className="font-semibold">{fabric.category.name}</h3>
          <p className="text-sm text-muted-foreground">
            Màu: <span className="text-foreground">{fabric.color.name}</span>
          </p>
          <div className="mt-2 pt-2 border-t space-y-1">
            {categoryName && (
              <p className="text-xs">
                <span className="text-muted-foreground">Loại vải:</span> {categoryName}
              </p>
            )}
            {glossDescription && (
              <p className="text-xs">
                <span className="text-muted-foreground">Độ bóng:</span> {glossDescription}
              </p>
            )}
            {thicknessLabel && (
              <p className="text-xs">
                <span className="text-muted-foreground">Độ dày:</span> {thicknessLabel}
              </p>
            )}
            {widthLabel && (
              <p className="text-xs">
                <span className="text-muted-foreground">Chiều rộng:</span> {widthLabel}
              </p>
            )}
            {lengthLabel && (
              <p className="text-xs">
                <span className="text-muted-foreground">Chiều dài:</span> {lengthLabel}
              </p>
            )}
          </div>
        </div>

        {/* Quantity, Unit, Store - Middle */}
        <div className="col-span-1 md:col-span-7">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Quantity Input */}
            <div className="md:flex-1 min-w-0">
              <Label className="text-xs">Số lượng</Label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className={`mt-1 h-8 ${quantityError ? 'border-red-500' : ''}`}
              />
              {quantityError && <p className="text-xs text-red-500 mt-1">{quantityError}</p>}
            </div>

            {/* Unit Select */}
            <div className="md:flex-1 min-w-0">
              <Label className="text-xs">Đơn vị</Label>
              <Select value={unit} onValueChange={handleUnitChange}>
                <SelectTrigger className="mt-1 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meter">Mét</SelectItem>
                  <SelectItem value="roll">Cuộn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Store Select */}
            <div className="md:flex-[2.5] min-w-0">
              <Label className="text-xs">Cửa hàng</Label>
              <Select
                value={storeId?.toString() || ''}
                onValueChange={(v) => handleStoreChange(parseInt(v))}
                disabled={loading}
              >
                <SelectTrigger className="mt-1 h-8">
                  <SelectValue placeholder="Chọn cửa hàng" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((store) => {
                    const availableQty = unit === 'meter' ? store.totalMeters : store.totalUncutRolls;
                    return (
                      <SelectItem key={store.id} value={store.id.toString()}>
                        {store.name} ({Math.round(availableQty).toLocaleString('vi-VN')})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Price & Remove - Right */}
        <div className="space-y-3 flex flex-col justify-between col-span-1 md:col-span-2">
          <div className="text-right">
            <p className="font-bold text-lg text-primary">
              {totalPrice.toLocaleString('vi-VN')} ₫
            </p>
          </div>

          {/* Remove Button */}
          <div className="flex justify-end">
            <Button variant="ghost" size="icon" onClick={onRemove} className="h-8 w-8">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </div>

      {/* Allocation Details */}
      {allocations.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Chi tiết:</p>
          <div className="space-y-2">
            {allocations.map((allocation) => (
              <div key={allocation.fabricId} className="bg-muted/30 rounded p-2">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">
                      {allocation.fabricInfo.category} - {allocation.fabricInfo.color}
                    </p>
                    <div className="text-xs text-muted-foreground space-y-1 mt-1">
                      {allocation.fabricInfo.gloss && (
                        <p>Độ bóng: {allocation.fabricInfo.gloss}</p>
                      )}
                      {allocation.fabricInfo.thickness && (
                        <p>Độ dày: {allocation.fabricInfo.thickness}</p>
                      )}
                      {allocation.fabricInfo.width && (
                        <p>Chiều rộng: {allocation.fabricInfo.width}</p>
                      )}
                      {allocation.fabricInfo.length && (
                        <p>Chiều dài: {allocation.fabricInfo.length}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold">
                      {allocation.quantity} {allocation.unit === 'ROLL' ? 'cuộn' : 'mét'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {allocation.unit === 'ROLL'
                        ? allocation.pricing.sellingPricePerRoll.toLocaleString('vi-VN')
                        : allocation.pricing.sellingPricePerMeter.toLocaleString('vi-VN')}{' '}
                      ₫/{allocation.unit === 'ROLL' ? 'cuộn' : 'mét'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
