'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Loader2, CheckCircle2 } from 'lucide-react';
import { ShelfSelector } from './ShelfSelector';
import { importFabricService } from '@/services/importFabric.service';
import { getServerErrorMessage } from '@/lib/errorHandler';
import type { ImportFabricItem, ImportFabricItemStatus } from '@/types/importFabric';
import { ImportFabricItemStatus as ItemStatus } from '@/types/importFabric';
import type { ShelfListItem } from '@/types/warehouse';

export interface ShelfAllocation {
  shelfId: number;
  quantity: number;
  shelf?: ShelfListItem;
}

export interface ImportFabricItemCardProps {
  item: ImportFabricItem;
  itemIndex: number;
  warehouseId: number;
  onSuccess?: () => void;
}

/**
 * Card hiển thị và xử lý phân bổ kệ cho một item vải
 * Status của item được quản lý từ backend
 */
export function ImportFabricItemCard({
  item,
  itemIndex,
  warehouseId,
  onSuccess,
}: ImportFabricItemCardProps) {
  const [allocations, setAllocations] = useState<ShelfAllocation[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Kiểm tra item đã được xếp hay chưa từ status của item
  // Status có thể là: PENDING, STORED (đã xếp), CANCELLED
  const isAllocated = item.status === ItemStatus.STORED;

  // Tính tổng số lượng đã phân bổ
  const totalAllocated = allocations.reduce((sum, alloc) => sum + alloc.quantity, 0);
  const isFullyAllocated = totalAllocated === item.quantity;

  // Thêm phân bổ kệ mới
  const handleAddAllocation = () => {
    setAllocations((prev) => [...prev, { shelfId: 0, quantity: 0 }]);
  };

  // Cập nhật kệ được chọn
  const handleShelfChange = (index: number, shelfId: number, shelf?: ShelfListItem) => {
    setAllocations((prev) =>
      prev.map((alloc, i) =>
        i === index ? { ...alloc, shelfId, shelf } : alloc
      )
    );
  };

  // Cập nhật số lượng
  const handleQuantityChange = (index: number, quantity: number) => {
    setAllocations((prev) =>
      prev.map((alloc, i) =>
        i === index ? { ...alloc, quantity } : alloc
      )
    );
  };

  // Xóa phân bổ
  const handleRemoveAllocation = (index: number) => {
    setAllocations((prev) => prev.filter((_, i) => i !== index));
  };

  // Validate và submit
  const handleSubmit = async () => {
    // Kiểm tra có ít nhất 1 phân bổ
    if (allocations.length === 0) {
      toast.error(`Mục ${item.fabric.category.name} phải có ít nhất 1 phân bổ kệ`);
      return;
    }

    // Kiểm tra tất cả phân bổ có kệ được chọn
    if (allocations.some((a) => a.shelfId === 0)) {
      toast.error(`Mục ${item.fabric.category.name} có phân bổ chưa chọn kệ`);
      return;
    }

    // Kiểm tra tất cả phân bổ có số lượng > 0
    if (allocations.some((a) => a.quantity <= 0)) {
      toast.error(`Mục ${item.fabric.category.name} có phân bổ với số lượng không hợp lệ`);
      return;
    }

    // Kiểm tra tổng số lượng không vượt quá
    if (totalAllocated > item.quantity) {
      toast.error(
        `Mục ${item.fabric.category.name} đã phân bổ ${totalAllocated} nhưng chỉ có ${item.quantity}`
      );
      return;
    }

    // Kiểm tra tổng số lượng bằng số lượng cần phân bổ
    if (totalAllocated !== item.quantity) {
      toast.error(
        `Mục ${item.fabric.category.name} phải phân bổ đủ ${item.quantity}, hiện tại chỉ ${totalAllocated}`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await importFabricService.allocateToShelves(item.fabricId, {
        importFabricId: item.importFabricId,
        shelves: allocations.map((a) => ({
          shelfId: a.shelfId,
          quantity: a.quantity,
        })),
      });

      toast.success(`Xếp ${item.fabric.category.name} vào kệ thành công`);
      setAllocations([]);
      onSuccess?.();
    } catch (err) {
      const message = getServerErrorMessage(err);
      toast.error(message || 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`border rounded-lg p-4 transition-colors ${isAllocated ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'border-input dark:border-slate-700'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-foreground dark:text-slate-100">Mục {itemIndex + 1}</h3>
          {isAllocated && (
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs font-medium">Đã xếp lên kệ</span>
            </div>
          )}
        </div>
        <span className="text-sm text-muted-foreground dark:text-slate-400">
          Fabric ID: {item.fabricId}
        </span>
      </div>

      {/* Thông tin vải */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mb-4">
        <div>
          <p className="text-muted-foreground dark:text-slate-400">Loại vải</p>
          <p className="font-medium text-foreground dark:text-slate-100">{item.fabric.category.name}</p>
        </div>
        <div>
          <p className="text-muted-foreground dark:text-slate-400">Màu sắc</p>
          <div className="flex items-center gap-2">
            {item.fabric.color.hexCode && (
              <div
                className="w-4 h-4 rounded border border-input"
                style={{ backgroundColor: item.fabric.color.hexCode }}
              />
            )}
            <p className="font-medium text-foreground dark:text-slate-100">{item.fabric.color.name}</p>
          </div>
        </div>
        <div>
          <p className="text-muted-foreground dark:text-slate-400">Độ bóng</p>
          <p className="font-medium text-foreground dark:text-slate-100">{item.fabric.gloss.description}</p>
        </div>
        <div>
          <p className="text-muted-foreground dark:text-slate-400">Nhà cung cấp</p>
          <p className="font-medium text-foreground dark:text-slate-100">{item.fabric.supplier.name}</p>
        </div>
        <div>
          <p className="text-muted-foreground dark:text-slate-400">Số lượng</p>
          <p className="font-medium text-foreground dark:text-slate-100">{item.quantity}</p>
        </div>
        <div>
          <p className="text-muted-foreground dark:text-slate-400">Giá</p>
          <p className="font-medium text-foreground dark:text-slate-100">{item.price.toLocaleString('vi-VN')} ₫</p>
        </div>
      </div>

      {/* Phân bổ kệ */}
      {!isAllocated ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground dark:text-slate-100">
              Phân bổ kệ ({totalAllocated}/{item.quantity})
            </label>
            {!isFullyAllocated && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddAllocation}
                disabled={isSubmitting}
              >
                <Plus className="h-4 w-4 mr-1" />
                Thêm kệ
              </Button>
            )}
          </div>

          {allocations.length === 0 ? (
            <div className="p-3 bg-muted dark:bg-slate-900 rounded border border-dashed border-muted-foreground dark:border-slate-700 text-center">
              <p className="text-sm text-muted-foreground dark:text-slate-400">
                Chưa có phân bổ kệ nào. Nhấn "Thêm kệ" để bắt đầu.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {allocations.map((allocation, allocIndex) => (
              <div key={allocIndex} className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground dark:text-slate-400">Kệ</label>
                    <ShelfSelector
                      warehouseId={warehouseId}
                      value={allocation.shelfId}
                      onChange={(shelfId, shelf) => handleShelfChange(allocIndex, shelfId, shelf)}
                      disabled={isSubmitting}
                    />
                  </div>

                <div className="flex-1">
                  <label className="text-xs text-muted-foreground dark:text-slate-400">Số lượng</label>
                  <Input
                    type="number"
                    min="1"
                    max={item.quantity - totalAllocated + allocation.quantity}
                    value={allocation.quantity || ''}
                    onChange={(e) =>
                      handleQuantityChange(allocIndex, Number(e.target.value))
                    }
                    className="h-9 bg-background dark:bg-slate-900 border-input dark:border-slate-700 text-foreground dark:text-slate-100"
                    placeholder="0"
                    disabled={isSubmitting}
                  />
                </div>                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveAllocation(allocIndex)}
                    className="h-9 w-9 text-red-500 hover:text-red-700"
                    disabled={isSubmitting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

        {/* Thông báo trạng thái phân bổ */}
        {!isFullyAllocated && allocations.length > 0 && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Còn {item.quantity - totalAllocated} cần phân bổ
          </p>
        )}
        {isFullyAllocated && (
          <p className="text-xs text-green-600 dark:text-green-400">✓ Đã phân bổ đủ</p>
        )}          {/* Nút submit */}
        {isFullyAllocated && (
          <div className="pt-2 mt-3 border-t border-input dark:border-slate-700">
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xếp vào kệ
            </Button>
          </div>
        )}
        </div>
      ) : (
        <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-300 dark:border-green-800 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-green-800 dark:text-green-300">
            Mục vải này đã được xếp lên kệ thành công
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            Tổng {item.quantity} đã được phân bổ vào kệ
          </p>
        </div>
      )}
    </div>
  );
}
