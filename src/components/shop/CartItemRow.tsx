'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Trash2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CartItem } from '@/types/cart';
import type { AllocationItem } from '@/services/fabric-store.service';

interface CartItemRowProps {
  item: CartItem;
  onQuantityChange: (value: string) => void;
  onUnitChange: (unit: 'meter' | 'roll') => void;
  onRemove: () => void;
  allocations?: AllocationItem[];
  totalValue?: number;
  maxAvailable?: number;
  error?: string;
  isSelected?: boolean;
  onSelectChange?: (selected: boolean) => void;
}

export default function CartItemRow({
  item,
  onQuantityChange,
  onUnitChange,
  onRemove,
  allocations = [],
  totalValue = 0,
  maxAvailable = Infinity,
  error,
  isSelected = false,
  onSelectChange,
}: CartItemRowProps) {
  const [quantityError, setQuantityError] = useState<string>('');
  const [expandAllocations, setExpandAllocations] = useState(false);

  const { fabric, quantity, unit, storeName } = item;
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

  const handleQuantityChange = (value: string) => {
    const newQty = Math.max(1, parseInt(value) || 1);
    setQuantityError('');
    onQuantityChange(value);
  };

  const handleUnitChange = (newUnit: 'meter' | 'roll') => {
    setQuantityError('');
    onUnitChange(newUnit);
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
        {/* Checkbox - Selection */}
        <div className="col-span-1 md:col-span-1 flex items-start pt-2">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => {
              onSelectChange?.(checked as boolean);
            }}
            className="mt-2"
          />
        </div>

        {/* Product Info - Left */}
        <div className="space-y-2 col-span-1 md:col-span-2">
          <h3 className="font-semibold">{fabric.category.name}</h3>
          <p className="text-sm text-muted-foreground">
            Màu: <span className="text-foreground">{fabric.color.name}</span>
          </p>
          {storeName && (
            <p className="text-sm text-muted-foreground">
              Cửa hàng: <span className="text-foreground">{storeName}</span>
            </p>
          )}
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

        {/* Quantity & Unit - Middle */}
        <div className="col-span-1 md:col-span-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Quantity Input */}
            <div className="md:flex-1 min-w-0">
              <Label className="text-xs">Số lượng</Label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className={`mt-1 h-8 ${error ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              {quantityError && <p className="text-xs text-red-500 mt-1">{quantityError}</p>}
              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
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
          <button
            onClick={() => setExpandAllocations(!expandAllocations)}
            className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${expandAllocations ? '' : '-rotate-90'}`}
            />
            Chi tiết:
          </button>
          {expandAllocations && (
            <div className="space-y-2 mt-3">
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
          )}
        </div>
      )}
    </div>
  );
}
