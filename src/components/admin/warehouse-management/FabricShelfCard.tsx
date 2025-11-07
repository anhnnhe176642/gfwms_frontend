'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { FabricShelfItem } from '@/types/warehouse';

export interface FabricShelfCardProps {
  fabricItem: FabricShelfItem;
  shelfCapacity: number;
}

export function FabricShelfCard({ fabricItem, shelfCapacity }: FabricShelfCardProps) {
  const fabric = fabricItem.fabric;
  const percentageOfShelf = (fabricItem.quantity / shelfCapacity) * 100;

  return (
    <Card className="bg-card hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base line-clamp-1">
              ID Vải: {fabric.id}
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Mã sản phẩm
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Fabric Details - Grid Layout */}
        <div className="grid grid-cols-2 gap-2">
          {/* Color */}
          {fabric.color && (
            <div className="flex flex-col">
              <p className="text-xs font-medium text-muted-foreground">Màu sắc</p>
              <p className="text-xs font-medium truncate">
                {fabric.color.name}
              </p>
            </div>
          )}

          {/* Category */}
          {fabric.category && (
            <div className="flex flex-col">
              <p className="text-xs font-medium text-muted-foreground">loại vải</p>
              <p className="text-xs font-medium truncate">
                {fabric.category.name}
              </p>
            </div>
          )}

          {/* Thickness */}
          <div className="flex flex-col">
            <p className="text-xs font-medium text-muted-foreground">Độ dày</p>
            <p className="text-xs font-medium">{fabric.thickness} mm</p>
          </div>

          {/* Weight */}
          <div className="flex flex-col">
            <p className="text-xs font-medium text-muted-foreground">Trọng lượng</p>
            <p className="text-xs font-medium">{fabric.weight} kg</p>
          </div>

          {/* Length */}
          <div className="flex flex-col">
            <p className="text-xs font-medium text-muted-foreground">Chiều dài</p>
            <p className="text-xs font-medium">{fabric.length} m</p>
          </div>

          {/* Width */}
          <div className="flex flex-col">
            <p className="text-xs font-medium text-muted-foreground">Chiều rộng</p>
            <p className="text-xs font-medium">{fabric.width} m</p>
          </div>

          {/* Gloss */}
          {fabric.gloss && (
            <div className="flex flex-col col-span-2">
              <p className="text-xs font-medium text-muted-foreground">Độ bóng</p>
              <p className="text-xs font-medium truncate">
                {fabric.gloss.description}
              </p>
            </div>
          )}

          {/* Supplier */}
          {fabric.supplier && (
            <div className="flex flex-col col-span-2">
              <p className="text-xs font-medium text-muted-foreground">Nhà cung cấp</p>
              <p className="text-xs font-medium truncate">
                {fabric.supplier.name}
              </p>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="border-t border-border" />

        {/* Quantity Information */}
        <div className="space-y-2">
          {/* Quantity Badge */}
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Số lượng</p>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground">
              {fabricItem.quantity}
            </span>
          </div>

          {/* Percentage of Shelf */}
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">% trong kệ</p>
            <span className="text-xs font-semibold text-primary">
              {percentageOfShelf.toFixed(1)}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-primary h-full transition-all"
              style={{ width: `${percentageOfShelf}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default FabricShelfCard;
