'use client';

import React, { memo, useCallback } from 'react';
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
 * Chỉ re-render khi props của chính nó thay đổi, không bị ảnh hưởng từ activeBox change
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
  const boxColor = box.label ? getColorForClass(box.label) : '#4ECDC4';
  
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
        value={box.label || classes[0]}
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
            {Math.round(Math.abs(box.endX - box.startX))} × {Math.round(Math.abs(box.endY - box.startY))}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Pos:</span>
          <span className="font-mono text-foreground">
            ({Math.round(Math.min(box.startX, box.endX))}, {Math.round(Math.min(box.startY, box.endY))})
          </span>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: chỉ re-render nếu box data hoặc isActive thay đổi
  // Bỏ qua callback changes vì chúng là identity stable
  return (
    prevProps.box.id === nextProps.box.id &&
    prevProps.box.label === nextProps.box.label &&
    prevProps.box.startX === nextProps.box.startX &&
    prevProps.box.startY === nextProps.box.startY &&
    prevProps.box.endX === nextProps.box.endX &&
    prevProps.box.endY === nextProps.box.endY &&
    prevProps.isActive === nextProps.isActive
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
  // Chỉ re-render BoxesList nếu boxes array thay đổi
  // Bỏ qua activeBox để từng BoxItem handle riêng
  return (
    prevProps.boxes.length === nextProps.boxes.length &&
    prevProps.boxes.every((box, i) => box.id === nextProps.boxes[i]?.id)
  );
});

BoxesList.displayName = 'BoxesList';
