'use client';

import React, { useRef, useState } from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';
import Konva from 'konva';
import { Button } from '@/components/ui/button';
import { Save, CheckCircle2, FileText, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
  id: string;
  label: string;
};

interface YOLOImageLabelingKonvaProps {
  imageSrc: string;
  classes: string[];
  existingLabels?: Array<{
    classId: number;
    className: string;
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
  }>, status?: 'draft' | 'completed') => void;
  onCancel: () => void;
  disabled?: boolean;
}

export const YOLOImageLabelingKonva: React.FC<YOLOImageLabelingKonvaProps> = ({
  imageSrc,
  classes,
  onSave,
  onCancel,
  disabled = false,
}) => {
  const stageRef = useRef<Konva.Stage | null>(null);
  const [rects, setRects] = useState<BoundingBox[]>([]);
  const [newRect, setNewRect] = useState<BoundingBox | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>(classes[0] || '');
  const [showLabels, setShowLabels] = useState(false);

  // Màu sắc cho từng class
  const classColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
  ];

  const getColorForClass = (className: string) => {
    const index = classes.indexOf(className);
    return index >= 0 ? classColors[index % classColors.length] : '#4ECDC4';
  };

  const downloadURI = (uri: string, name: string): void => {
    const link = document.createElement('a');
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current;
    // Check if clicked on empty area (the stage itself)
    const clickedOnEmpty = e.target === stage;
    if (!clickedOnEmpty) return;

    if (stage) {
      const pointerPosition = stage.getPointerPosition();
      if (pointerPosition) {
        const { x, y } = pointerPosition;
        setNewRect({ x, y, width: 0, height: 0, id: Date.now().toString(), label: selectedClass });
        setIsDrawing(true);
      }
    }
  };

  const handleMouseMove = () => {
    if (!newRect || !isDrawing) return;
    const stage = stageRef.current;
    if (stage) {
      const pointerPosition = stage.getPointerPosition();
      if (pointerPosition) {
        const { x, y } = pointerPosition;
        setNewRect({
          ...newRect,
          width: x - newRect.x,
          height: y - newRect.y,
        });
      }
    }
  };

  const handleMouseUp = () => {
    if (newRect) {
      setRects([...rects, newRect]);
    }
    setNewRect(null);
    setIsDrawing(false);
  };

  const handleExport = () => {
    if (!stageRef.current) return;
    const uri = stageRef.current.toDataURL();
    downloadURI(uri, 'labeled-image.png');
  };

  const handleSave = () => {
    if (rects.length === 0) {
      alert('Vui lòng vẽ ít nhất một bounding box');
      return;
    }

    const labels = rects.map((rect) => ({
      classId: classes.indexOf(rect.label || selectedClass),
      className: rect.label || selectedClass,
      x: Math.round(Math.min(rect.x, rect.x + rect.width)),
      y: Math.round(Math.min(rect.y, rect.y + rect.height)),
      width: Math.round(Math.abs(rect.width)),
      height: Math.round(Math.abs(rect.height)),
    }));

    onSave(labels, 'completed');
  };

  const handleDeleteBox = (id: string) => {
    setRects(rects.filter(rect => rect.id !== id));
  };

  const handleClearAll = () => {
    setRects([]);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Gán nhãn YOLO (Konva)</CardTitle>
        <CardDescription>
          Vẽ bounding boxes xung quanh các đối tượng trong ảnh
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Label htmlFor="class-select" className="min-w-fit">
            Class:
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
        </div>

        <div className="bg-muted/50 p-3 rounded-md">
          <Label className="text-sm font-semibold mb-2 block">Màu sắc classes:</Label>
          <div className="flex flex-wrap gap-3">
            {classes.map((cls) => (
              <div key={cls} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: getColorForClass(cls) }}
                />
                <span className="text-sm">{cls}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          {/* Canvas */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLabels(!showLabels)}
                className="gap-2"
              >
                {showLabels ? 'Ẩn' : 'Hiện'} label
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>

            <div className="border-2 border-dashed border-primary rounded-md overflow-auto flex-1 bg-muted/10">
              <Stage
                ref={stageRef}
                width={800}
                height={600}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                style={{
                  cursor: isDrawing ? 'crosshair' : 'grab',
                }}
              >
                <Layer>
                  <Text text="Drag để vẽ bounding boxes" fontSize={15} x={10} y={10} />

                  {/* Existing boxes */}
                  {rects.map((rect) => (
                    <React.Fragment key={rect.id}>
                      <Rect
                        {...rect}
                        fill={`${getColorForClass(rect.label)}33`}
                        stroke={getColorForClass(rect.label)}
                        strokeWidth={2}
                        draggable
                      />
                      {showLabels && (
                        <Text
                          x={rect.x}
                          y={rect.y - 20}
                          text={rect.label}
                          fontSize={12}
                          fill={getColorForClass(rect.label)}
                          fontStyle="bold"
                        />
                      )}
                    </React.Fragment>
                  ))}

                  {/* New drawing rect */}
                  {newRect && (
                    <Rect
                      {...newRect}
                      fill={`${getColorForClass(newRect.label)}33`}
                      stroke={getColorForClass(newRect.label)}
                      strokeWidth={2}
                    />
                  )}
                </Layer>
              </Stage>
            </div>

            <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted/50 rounded">
              💡 Drag để vẽ | Kéo box để di chuyển | Click trong sidebar để xóa
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-64 flex flex-col bg-muted/20 rounded-md p-4 overflow-hidden">
            <Label className="text-sm font-semibold mb-3">
              Boxes ({rects.length})
            </Label>

            {rects.length > 0 ? (
              <div className="flex-1 overflow-y-auto space-y-2">
                {rects.map((rect, idx) => (
                  <div
                    key={rect.id}
                    className="p-2 rounded border border-border hover:bg-muted/30 cursor-pointer text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: getColorForClass(rect.label) }}
                        />
                        <span>#{idx + 1}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBox(rect.id)}
                        className="h-5 w-5 p-0 text-xs"
                      >
                        ✕
                      </Button>
                    </div>
                    <div className="text-muted-foreground">
                      <div>{rect.label}</div>
                      <div>
                        {Math.round(Math.abs(rect.width))} × {Math.round(Math.abs(rect.height))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-xs">
                Chưa có boxes
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel} disabled={disabled}>
            Hủy
          </Button>
          {rects.length > 0 && (
            <Button variant="outline" onClick={handleClearAll} disabled={disabled}>
              Xóa tất cả
            </Button>
          )}
          <Button
            variant="outline"
            disabled={rects.length === 0 || disabled}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Lưu nháp
          </Button>
          <Button
            onClick={handleSave}
            disabled={rects.length === 0 || disabled}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Lưu ({rects.length})
          </Button>
          <Button
            variant="default"
            onClick={handleSave}
            disabled={rects.length === 0 || disabled}
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle2 className="h-4 w-4" />
            Hoàn thành
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
