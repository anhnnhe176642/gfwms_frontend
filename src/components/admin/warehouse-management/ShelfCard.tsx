'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Package, Layers, Palette, Sparkles, Building2 } from 'lucide-react';
import type { ShelfListItem, FabricShelfItem, FabricGroup, ShelfGroupByField } from '@/types/warehouse';
import { cn } from '@/lib/utils';

export interface ShelfCardProps {
  shelf: ShelfListItem & {
    fabricShelf?: FabricShelfItem[];
    fabricGroups?: FabricGroup[];
  };
  groupBy?: ShelfGroupByField[];
  onView?: (shelfId: number) => void;
  onEdit?: (shelfId: number) => void;
  onDelete?: (shelfId: number) => void;
}

/**
 * Get the capacity status color based on percentage
 */
function getCapacityColor(percentage: number): string {
  if (percentage >= 90) return 'bg-red-500';
  if (percentage >= 70) return 'bg-yellow-500';
  if (percentage >= 50) return 'bg-blue-500';
  return 'bg-green-500';
}

/**
 * Get the capacity status label and style
 */
function getCapacityStatus(percentage: number): { label: string; className: string } {
  if (percentage >= 100) return { label: 'Đầy', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
  if (percentage >= 90) return { label: 'Gần đầy', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' };
  if (percentage >= 70) return { label: 'Cao', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' };
  if (percentage >= 50) return { label: 'Trung bình', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
  return { label: 'Thấp', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
}

/**
 * Get icon for group type
 */
function getGroupIcon(group: FabricGroup) {
  if (group.category) return <Layers className="h-3 w-3" />;
  if (group.color) return <Palette className="h-3 w-3" />;
  if (group.gloss) return <Sparkles className="h-3 w-3" />;
  if (group.supplier) return <Building2 className="h-3 w-3" />;
  return <Package className="h-3 w-3" />;
}

/**
 * Format group label based on groupBy fields
 */
function formatGroupLabel(group: FabricGroup): string {
  const parts: string[] = [];
  
  if (group.category) parts.push(group.category.name);
  if (group.color) parts.push(group.color.name);
  if (group.gloss) parts.push(group.gloss.description);
  if (group.supplier) parts.push(group.supplier.name);
  
  return parts.join(' • ') || 'Không xác định';
}

export function ShelfCard({ shelf, groupBy, onView, onEdit, onDelete }: ShelfCardProps) {
  const capacityPercentage = shelf.maxQuantity > 0 
    ? (shelf.currentQuantity / shelf.maxQuantity) * 100 
    : 0;
  const capacityStatus = getCapacityStatus(capacityPercentage);
  const hasGroupBy = groupBy && groupBy.length > 0;
  const hasFabricGroups = shelf.fabricGroups && shelf.fabricGroups.length > 0;
  const hasFabricShelf = shelf.fabricShelf && shelf.fabricShelf.length > 0;

  return (
    <Card className="bg-card hover:shadow-lg transition-all duration-200 border-border/50 overflow-hidden">
      {/* Header */}
      <CardHeader className="pb-3 space-y-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold truncate">
              {shelf.code}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              ID: {shelf.id}
            </p>
          </div>
          <span className={cn(
            "px-2 py-1 rounded-full text-xs font-medium shrink-0",
            capacityStatus.className
          )}>
            {capacityStatus.label}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Capacity Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Số lượng(cuộn)</span>
            <span className="font-semibold">
              {shelf.currentQuantity.toLocaleString('vi-VN')} / {shelf.maxQuantity.toLocaleString('vi-VN')}
            </span>
          </div>
          <div className="relative w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-300 rounded-full',
                getCapacityColor(capacityPercentage)
              )}
              style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-right">
            {capacityPercentage.toFixed(1)}% đã sử dụng
          </p>
        </div>

        {/* Fabric Groups (when groupBy is active) */}
        {hasGroupBy && hasFabricGroups && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>Vải theo nhóm ({shelf.fabricGroups!.length})</span>
            </div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {shelf.fabricGroups!.map((group, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-2 p-2 bg-muted/50 rounded-md text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {getGroupIcon(group)}
                    <span className="truncate text-xs">
                      {formatGroupLabel(group)}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground shrink-0">
                    {group.totalQuantity.toLocaleString('vi-VN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fabric List (when no groupBy) */}
        {!hasGroupBy && hasFabricShelf && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>Danh sách vải ({shelf.fabricShelf!.length})</span>
            </div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {shelf.fabricShelf!.map((item) => (
                <div
                  key={item.fabricId}
                  className="flex items-center justify-between gap-2 p-2 bg-muted/50 rounded-md text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">
                      {item.fabric.category?.name || `Vải #${item.fabricId}`}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {[
                        item.fabric.color?.name,
                        item.fabric.supplier?.name,
                      ].filter(Boolean).join(' • ')}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground shrink-0">
                    {item.quantity.toLocaleString('vi-VN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!hasFabricGroups && !hasFabricShelf && (
          <div className="flex items-center justify-center h-16 text-sm text-muted-foreground">
            <Package className="h-4 w-4 mr-2" />
            Kệ trống
          </div>
        )}

        {/* Timestamps */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
          <div>
            <p className="text-xs text-muted-foreground">Ngày tạo</p>
            <p className="text-xs font-medium">
              {new Date(shelf.createdAt).toLocaleDateString('vi-VN')}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Cập nhật</p>
            <p className="text-xs font-medium">
              {new Date(shelf.updatedAt).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
          {onView && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5"
              onClick={() => onView(shelf.id)}
            >
              <Eye className="h-3.5 w-3.5" />
              Xem
            </Button>
          )}
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5"
              onClick={() => onEdit(shelf.id)}
            >
              <Edit className="h-3.5 w-3.5" />
              Sửa
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(shelf.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ShelfCard;
