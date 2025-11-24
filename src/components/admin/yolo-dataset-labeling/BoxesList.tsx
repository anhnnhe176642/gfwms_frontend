'use client';

import React, { memo, useCallback, useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BoundingBox } from '@/hooks/useBoundingBox';

export interface BoxItemProps {
  box: BoundingBox;
  index: number;
  isActive: boolean;
  classes: string[];
  onSelectBox: (box: BoundingBox) => void;
  onDeleteBox: (boxId: string) => void;
  onChangeBoxLabel: (boxId: string, newLabel: string) => void;
  getColorForClass: (className: string) => string;
}

/**
 * Memoized component cho từng box item
 * Deep comparison dựa trên box properties để tránh re-render không cần thiết
 */
const BoxItem = memo<BoxItemProps>(({
  box,
  index,
  isActive,
  classes,
  onSelectBox,
  onDeleteBox,
  onChangeBoxLabel,
  getColorForClass,
}) => {
  // Memoize box color
  const boxColor = useMemo(() => 
    box.label ? getColorForClass(box.label) : '#4ECDC4',
    [box.label, getColorForClass]
  );
  
  // Memoize handlers - chỉ update khi box.id thay đổi
  const handleSelect = useCallback(() => {
    onSelectBox(box);
  }, [box, onSelectBox]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteBox(box.id!);
  }, [box.id, onDeleteBox]);

  const handleLabelChange = useCallback((value: string) => {
    onChangeBoxLabel(box.id!, value);
  }, [box.id, onChangeBoxLabel]);

  // Memoize dimensions để tránh recalculate
  const dimensions = useMemo(() => ({
    width: Math.round(Math.abs(box.endX - box.startX)),
    height: Math.round(Math.abs(box.endY - box.startY)),
    x: Math.round(Math.min(box.startX, box.endX)),
    y: Math.round(Math.min(box.startY, box.endY)),
  }), [box.startX, box.endX, box.startY, box.endY]);

  return (
    <div
      onClick={handleSelect}
      className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
        isActive
          ? 'border-primary bg-primary/5 ring-1 ring-primary'
          : 'border-border hover:border-primary/50 hover:bg-muted/30'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: boxColor }}
          />
          <span className="text-xs font-medium">#{index + 1}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="h-5 w-5 p-0 hover:bg-destructive/10"
        >
          <span className="text-xs">✕</span>
        </Button>
      </div>

      <Select
        value={box.label || classes[0] || ''}
        onValueChange={handleLabelChange}
      >
        <SelectTrigger className="h-7 text-xs bg-background border-border/50">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {classes.map((cls) => (
            <SelectItem key={cls} value={cls}>
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getColorForClass(cls) }}
                />
                <span className="text-xs">{cls}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="mt-2 text-xs text-muted-foreground space-y-1 border-t border-border/30 pt-2">
        <div className="flex justify-between">
          <span>Size:</span>
          <span className="font-mono text-foreground">
            {dimensions.width} × {dimensions.height}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Pos:</span>
          <span className="font-mono text-foreground">
            ({dimensions.x}, {dimensions.y})
          </span>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: re-render chỉ khi có thay đổi thực tế
  return (
    prevProps.box.id === nextProps.box.id &&
    prevProps.box.startX === nextProps.box.startX &&
    prevProps.box.startY === nextProps.box.startY &&
    prevProps.box.endX === nextProps.box.endX &&
    prevProps.box.endY === nextProps.box.endY &&
    prevProps.box.label === nextProps.box.label &&
    prevProps.isActive === nextProps.isActive &&
    prevProps.index === nextProps.index
  );
});

BoxItem.displayName = 'BoxItem';

export interface BoxesListProps {
  boxes: BoundingBox[];
  activeBox: BoundingBox | null;
  classes: string[];
  onSelectBox: (box: BoundingBox) => void;
  onDeleteBox: (boxId: string) => void;
  onChangeBoxLabel: (boxId: string, newLabel: string) => void;
  getColorForClass: (className: string) => string;
}

/**
 * Optimized list renderer - renders items in chunks
 * Prevents rendering 200+ items at once by using a virtual scroll approach
 */
const VirtualizedBoxesList = memo<BoxesListProps>(({
  boxes,
  activeBox,
  classes,
  onSelectBox,
  onDeleteBox,
  onChangeBoxLabel,
  getColorForClass,
}) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const ITEM_HEIGHT = 145; // Approximate height of each box item

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    
    const start = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - 2); // Buffer 2 items
    const end = Math.min(boxes.length, Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + 2);
    
    setVisibleRange({ start, end });
  }, [boxes.length]);

  // Memoize visible boxes
  const visibleBoxes = useMemo(
    () => boxes.slice(visibleRange.start, visibleRange.end),
    [boxes, visibleRange]
  );

  // Memoize offset styles
  const offsetStyle = useMemo(() => ({
    paddingTop: visibleRange.start * ITEM_HEIGHT,
  }), [visibleRange.start]);

  return (
    <div className="flex flex-col bg-muted/20 rounded-md p-4 overflow-hidden h-full">
      <div className="mb-3">
        <Label className="text-sm font-semibold">Danh sách boxes ({boxes.length}):</Label>
      </div>

      {boxes.length > 0 ? (
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto"
          onScroll={handleScroll}
        >
          <div className="space-y-2" style={offsetStyle}>
            {visibleBoxes.map((box, index) => (
              <BoxItem
                key={box.id}
                box={box}
                index={visibleRange.start + index}
                isActive={activeBox?.id === box.id}
                classes={classes}
                onSelectBox={onSelectBox}
                onDeleteBox={onDeleteBox}
                onChangeBoxLabel={onChangeBoxLabel}
                getColorForClass={getColorForClass}
              />
            ))}
          </div>
          {/* Spacer to maintain scroll height */}
          <div style={{ height: Math.max(0, (boxes.length - visibleRange.end) * ITEM_HEIGHT) }} />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-muted-foreground text-xs">Chưa có boxes</div>
          </div>
        </div>
      )}
    </div>
  );
});

VirtualizedBoxesList.displayName = 'VirtualizedBoxesList';

/**
 * Memoized component để render danh sách boxes
 * Tách từng box thành component riêng để tránh re-render toàn bộ khi activeBox thay đổi
 */
export const BoxesList = memo<BoxesListProps>(({
  boxes,
  activeBox,
  classes,
  onSelectBox,
  onDeleteBox,
  onChangeBoxLabel,
  getColorForClass,
}) => {
  // Use virtualized list cho > 50 items, regular list cho <= 50 items
  if (boxes.length > 50) {
    return (
      <VirtualizedBoxesList
        boxes={boxes}
        activeBox={activeBox}
        classes={classes}
        onSelectBox={onSelectBox}
        onDeleteBox={onDeleteBox}
        onChangeBoxLabel={onChangeBoxLabel}
        getColorForClass={getColorForClass}
      />
    );
  }

  return (
    <div className="flex flex-col bg-muted/20 rounded-md p-4 overflow-hidden h-full">
      <div className="mb-3">
        <Label className="text-sm font-semibold">Danh sách boxes ({boxes.length}):</Label>
      </div>

      {boxes.length > 0 ? (
        <div className="flex-1 overflow-y-auto space-y-2">
          {boxes.map((box, index) => (
            <BoxItem
              key={box.id}
              box={box}
              index={index}
              isActive={activeBox?.id === box.id}
              classes={classes}
              onSelectBox={onSelectBox}
              onDeleteBox={onDeleteBox}
              onChangeBoxLabel={onChangeBoxLabel}
              getColorForClass={getColorForClass}
            />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-muted-foreground text-xs">Chưa có boxes</div>
          </div>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if boxes structure or activeBox changes significantly
  // This prevents unnecessary re-renders when only activeBox changes
  if (prevProps.boxes.length !== nextProps.boxes.length) return false;
  if (prevProps.activeBox?.id !== nextProps.activeBox?.id) return false;
  
  // Check if any box data changed
  for (let i = 0; i < prevProps.boxes.length; i++) {
    const prev = prevProps.boxes[i];
    const next = nextProps.boxes[i];
    if (
      prev.id !== next.id ||
      prev.label !== next.label ||
      prev.startX !== next.startX ||
      prev.startY !== next.startY ||
      prev.endX !== next.endX ||
      prev.endY !== next.endY
    ) {
      return false;
    }
  }
  
  return true;
});

BoxesList.displayName = 'BoxesList';
