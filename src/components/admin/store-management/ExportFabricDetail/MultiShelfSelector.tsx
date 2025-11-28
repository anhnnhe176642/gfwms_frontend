'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShelfSelector } from './ShelfSelector';
import { X, Plus } from 'lucide-react';

export interface ShelfAllocation {
  id: string; // unique identifier for this allocation
  shelfId: number | null;
  quantityToTake: number;
}

interface MultiShelfSelectorProps {
  fabricId: number;
  warehouseId: number | string;
  totalQuantityNeeded: number;
  allocations: ShelfAllocation[];
  onAllocationsChange: (allocations: ShelfAllocation[]) => void;
  disabled?: boolean;
}

export function MultiShelfSelector({
  fabricId,
  warehouseId,
  totalQuantityNeeded,
  allocations,
  onAllocationsChange,
  disabled = false,
}: MultiShelfSelectorProps) {
  const totalAllocated = allocations.reduce((sum, a) => sum + a.quantityToTake, 0);
  const remainingQuantity = totalQuantityNeeded - totalAllocated;
  const isValid = remainingQuantity === 0 && allocations.every((a) => a.shelfId !== null);

  const handleAddShelf = () => {
    onAllocationsChange([
      ...allocations,
      {
        id: `${Date.now()}-${Math.random()}`,
        shelfId: null,
        quantityToTake: Math.min(1, remainingQuantity),
      },
    ]);
  };

  const handleRemoveShelf = (allocationId: string) => {
    onAllocationsChange(allocations.filter((a) => a.id !== allocationId));
  };

  const handleShelfChange = (allocationId: string, shelfId: number) => {
    onAllocationsChange(
      allocations.map((a) =>
        a.id === allocationId ? { ...a, shelfId } : a
      )
    );
  };

  const handleQuantityChange = (allocationId: string, quantity: number) => {
    onAllocationsChange(
      allocations.map((a) =>
        a.id === allocationId
          ? { ...a, quantityToTake: Math.max(1, Math.min(quantity, remainingQuantity + a.quantityToTake)) }
          : a
      )
    );
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-blue-50 p-3 rounded border border-blue-200">
        <p className="text-sm">
          <span className="font-medium">Tổng cần xuất:</span> {totalQuantityNeeded} |
          <span className="font-medium ml-2">Đã phân bổ:</span> {totalAllocated} |
          <span className={`font-medium ml-2 ${remainingQuantity === 0 ? 'text-green-600' : 'text-orange-600'}`}>
            Còn lại: {remainingQuantity}
          </span>
        </p>
      </div>

      {/* Allocations */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {allocations.map((allocation, index) => (
          <div key={allocation.id} className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-600 block mb-1">
                Kệ #{index + 1}
                {!allocation.shelfId && <span className="text-red-500 ml-1">*</span>}
              </label>
              <ShelfSelector
                warehouseId={warehouseId}
                fabricId={fabricId}
                value={allocation.shelfId ?? undefined}
                onChange={(shelfId) => handleShelfChange(allocation.id, shelfId)}
                placeholder="Chọn kệ..."
                disabled={disabled}
              />
            </div>
            <div className="w-24">
              <label className="text-xs font-medium text-gray-600 block mb-1">
                Số lượng
              </label>
              <Input
                type="number"
                min="1"
                max={remainingQuantity + allocation.quantityToTake}
                value={allocation.quantityToTake}
                onChange={(e) => handleQuantityChange(allocation.id, Number(e.target.value))}
                disabled={disabled}
                className="text-center"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveShelf(allocation.id)}
              disabled={disabled || allocations.length === 1}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Add More Shelf Button */}
      {remainingQuantity > 0 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddShelf}
          disabled={disabled}
          className="w-full gap-2"
        >
          <Plus className="h-4 w-4" />
          Thêm kệ khác (+{remainingQuantity})
        </Button>
      )}

      {/* Status */}
      {!isValid && (
        <div className="text-sm text-red-600">
          {remainingQuantity > 0
            ? `⚠️ Cần phân bổ thêm ${remainingQuantity} sản phẩm`
            : '⚠️ Tất cả các kệ phải được chọn'}
        </div>
      )}
      {isValid && (
        <div className="text-sm text-green-600">✓ Phân bổ hợp lệ</div>
      )}
    </div>
  );
}
