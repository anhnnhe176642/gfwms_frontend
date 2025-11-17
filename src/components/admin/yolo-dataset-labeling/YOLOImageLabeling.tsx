'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Undo2, Redo2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useBoundingBox, BoundingBox } from '@/hooks/useBoundingBox';
import { 
  boundingBoxToYOLO,
  isValidBoundingBox,
  normalizeBoundingBox,
} from '@/lib/canvasHelpers';

interface YOLOImageLabelingProps {
  imageSrc: string;
  classes: string[];
  existingLabels?: Array<{
    classId: number;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  onSave: (labels: Array<{
    classId: number;
    className: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>) => void;
  onCancel: () => void;
}

export const YOLOImageLabeling: React.FC<YOLOImageLabelingProps> = ({
  imageSrc,
  classes,
  existingLabels = [],
  onSave,
  onCancel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>(classes[0] || '');
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Màu sắc cho từng class
  const classColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
  ];

  const getColorForClass = (className: string) => {
    const index = classes.indexOf(className);
    return index >= 0 ? classColors[index % classColors.length] : '#4ECDC4';
  };

  // Sử dụng hook useBoundingBox
  const {
    boxes,
    activeBox,
    handleMouseDown: hookMouseDown,
    handleMouseMove: hookMouseMove,
    handleMouseUp: hookMouseUp,
    removeBox,
    clearBoxes,
    setActiveBox,
    updateBox,
    undo,
    redo,
    canUndo,
    canRedo,
    deleteActiveBox,
  } = useBoundingBox({
    canvasRef,
    enabled: imageLoaded,
    multipleBoxes: true,
  });

  const handleMouseDown = hookMouseDown;
  const handleMouseMove = hookMouseMove;
  const handleMouseUp = hookMouseUp;

  // Vẽ canvas
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !originalImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const maxDisplayWidth = containerSize.width > 0 ? containerSize.width : 700;
    const maxDisplayHeight = containerSize.height > 0 ? containerSize.height : 700;

    const widthRatio = maxDisplayWidth / originalImage.width;
    const heightRatio = maxDisplayHeight / originalImage.height;
    const baseScale = Math.min(widthRatio, heightRatio, 1);

    const displayWidth = originalImage.width * baseScale;
    const displayHeight = originalImage.height * baseScale;

    canvas.width = displayWidth;
    canvas.height = displayHeight;
    setScale(baseScale);

    // Vẽ ảnh
    ctx.drawImage(originalImage, 0, 0, displayWidth, displayHeight);

    // Vẽ boxes
    const allBoxes = activeBox ? [...boxes, activeBox] : boxes;
    
    allBoxes.forEach((box) => {
      const isActive = box.id === activeBox?.id;
      const color = box.label ? getColorForClass(box.label) : '#4ECDC4';
      const fillColor = `${color}33`;
      
      const x1 = Math.min(box.startX, box.endX);
      const y1 = Math.min(box.startY, box.endY);
      const width = Math.abs(box.endX - box.startX);
      const height = Math.abs(box.endY - box.startY);

      ctx.fillStyle = fillColor;
      ctx.fillRect(x1, y1, width, height);

      ctx.strokeStyle = color;
      ctx.lineWidth = isActive ? 3 : 2;
      ctx.strokeRect(x1, y1, width, height);

      if (box.label) {
        ctx.fillStyle = color;
        ctx.font = 'bold 14px Arial';
        const labelMetrics = ctx.measureText(box.label);
        const labelPadding = 6;
        const labelHeight = 20;

        ctx.fillRect(
          x1,
          y1 - labelHeight - labelPadding,
          labelMetrics.width + labelPadding * 2,
          labelHeight + labelPadding
        );

        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(box.label, x1 + labelPadding, y1 - labelPadding - 2);
      }

      if (isActive) {
        const handleSize = 8;
        const corners = [
          { x: x1, y: y1 },
          { x: x1 + width, y: y1 },
          { x: x1, y: y1 + height },
          { x: x1 + width, y: y1 + height },
        ];

        corners.forEach((corner) => {
          ctx.fillStyle = color;
          ctx.fillRect(
            corner.x - handleSize / 2,
            corner.y - handleSize / 2,
            handleSize,
            handleSize
          );
        });

        const edgeSize = 6;
        const edges = [
          { x: x1 + width / 2, y: y1 },
          { x: x1 + width / 2, y: y1 + height },
          { x: x1, y: y1 + height / 2 },
          { x: x1 + width, y: y1 + height / 2 },
        ];

        edges.forEach((edge) => {
          ctx.fillStyle = color;
          ctx.fillRect(
            edge.x - edgeSize / 2,
            edge.y - edgeSize / 2,
            edgeSize,
            edgeSize
          );
        });
      }
    });
  };

  useEffect(() => {
    const updateSize = () => {
      if (canvasContainerRef.current) {
        setContainerSize({
          width: canvasContainerRef.current.clientWidth,
          height: canvasContainerRef.current.clientHeight,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    const resizeObserver = new ResizeObserver(updateSize);
    if (canvasContainerRef.current) {
      resizeObserver.observe(canvasContainerRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateSize);
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setOriginalImage(img);
      setImageLoaded(true);
    };
    img.onerror = () => {
      toast.error('Không thể tải ảnh');
    };
    img.src = imageSrc;
  }, [imageSrc]);

  useEffect(() => {
    if (imageLoaded) {
      drawCanvas();
    }
  }, [imageLoaded, boxes, activeBox, originalImage, containerSize]);

  useEffect(() => {
    if (activeBox && !activeBox.label && selectedClass) {
      const updatedBox = { ...activeBox, label: selectedClass };
      setActiveBox(updatedBox);
    }
  }, [activeBox, selectedClass]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && activeBox) {
        e.preventDefault();
        deleteActiveBox();
        toast.success('Đã xóa box');
      }

      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) {
          undo();
          toast.info('Undo');
        }
      }

      if ((e.ctrlKey && e.shiftKey && e.key === 'z') || (e.ctrlKey && e.key === 'y')) {
        e.preventDefault();
        if (canRedo) {
          redo();
          toast.info('Redo');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeBox, deleteActiveBox, undo, redo, canUndo, canRedo]);

  const handleSave = () => {
    if (!originalImage) return;

    const validBoxes = boxes.filter((box) => isValidBoundingBox(box, 10));

    if (validBoxes.length === 0) {
      toast.error('Vui lòng vẽ ít nhất một bounding box');
      return;
    }

    const yoloLabels = validBoxes.map((box) => {
      const normalized = normalizeBoundingBox(box);
      const yolo = boundingBoxToYOLO(
        normalized,
        originalImage.width,
        originalImage.height
      );

      const classId = classes.indexOf(box.label || '');

      return {
        classId,
        className: box.label || '',
        x: yolo.x,
        y: yolo.y,
        width: yolo.width,
        height: yolo.height,
      };
    });

    onSave(yoloLabels);
    toast.success(`Đã lưu ${yoloLabels.length} labels`);
  };

  const handleDeleteBox = (boxId: string) => {
    removeBox(boxId);
    toast.success('Đã xóa box');
  };

  const handleChangeBoxLabel = (boxId: string, newLabel: string) => {
    updateBox(boxId, { label: newLabel });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gán nhãn YOLO</CardTitle>
            <CardDescription>
              Vẽ bounding boxes xung quanh các đối tượng trong ảnh và gán class label.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={undo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={redo}
              disabled={!canRedo}
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Label htmlFor="class-select" className="min-w-fit">
            Class hiện tại:
          </Label>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger id="class-select" className="w-full max-w-xs">
              <SelectValue placeholder="Chọn class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls} value={cls}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: getColorForClass(cls) }}
                    />
                    {cls}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            Boxes mới sẽ được gán class này
          </span>
        </div>

        <div className="bg-muted/50 p-3 rounded-md">
          <Label className="text-sm font-semibold mb-2 block">Màu sắc classes:</Label>
          <div className="flex flex-wrap gap-3">
            {classes.map((cls) => (
              <div key={cls} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: getColorForClass(cls), borderColor: getColorForClass(cls) }}
                />
                <span className="text-sm">{cls}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 h-screen max-h-screen">
          <div style={{ width: '75%' }} className="flex flex-col">
            <div
              ref={canvasContainerRef}
              className="flex-1 flex flex-col justify-center items-center bg-muted/20 rounded-t-md overflow-hidden"
            >
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className="max-w-full max-h-full border-2 border-dashed border-primary rounded-md cursor-crosshair"
              />
            </div>

            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md mt-4">
              💡 <strong>Hướng dẫn:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Chọn class label trước khi vẽ box</li>
                <li>Kéo chuột để vẽ bounding box xung quanh đối tượng</li>
                <li>Click vào box để chọn, kéo cạnh/góc để resize, kéo bên trong để di chuyển</li>
                <li>Nhấn Delete để xóa, Ctrl+Z để undo</li>
              </ul>
            </div>
          </div>

          <div style={{ width: '25%' }} className="flex flex-col bg-muted/20 rounded-md p-4 overflow-hidden">
            <div className="mb-3">
              <Label className="text-sm font-semibold">Danh sách boxes ({boxes.length}):</Label>
            </div>

            {boxes.length > 0 ? (
              <div className="flex-1 overflow-y-auto space-y-2">
                {boxes.map((box, index) => {
                  const boxColor = box.label ? getColorForClass(box.label) : '#4ECDC4';
                  const isActive = activeBox?.id === box.id;
                  return (
                    <div
                      key={box.id}
                      onClick={() => setActiveBox(box)}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBox(box.id!);
                          }}
                          className="h-5 w-5 p-0 hover:bg-destructive/10"
                        >
                          <span className="text-xs">✕</span>
                        </Button>
                      </div>

                      <Select
                        value={box.label || selectedClass}
                        onValueChange={(value) => handleChangeBoxLabel(box.id!, value)}
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
                            {Math.round(Math.abs(box.endX - box.startX) / scale)} × {Math.round(Math.abs(box.endY - box.startY) / scale)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pos:</span>
                          <span className="font-mono text-foreground">
                            ({Math.round(Math.min(box.startX, box.endX) / scale)}, {Math.round(Math.min(box.startY, box.endY) / scale)})
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-muted-foreground text-xs">Chưa có boxes</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          {boxes.length > 0 && (
            <Button variant="outline" onClick={clearBoxes}>
              Xóa tất cả
            </Button>
          )}
          <Button onClick={handleSave} disabled={boxes.length === 0}>
            💾 Lưu labels ({boxes.length})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
