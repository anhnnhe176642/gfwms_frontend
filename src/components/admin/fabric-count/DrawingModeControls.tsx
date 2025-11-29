'use client';

import React from 'react';
import { Lightbulb, Check, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DrawingModeControlsProps {
  isDrawing: boolean;
  pointCount: number;
  onFinish: () => void;
  onClear: () => void;
}

export const DrawingModeControls: React.FC<DrawingModeControlsProps> = ({
  isDrawing,
  pointCount,
  onFinish,
  onClear,
}) => {
  const canFinish = pointCount >= 3;

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="bg-muted p-3 rounded-md flex gap-2 flex-wrap items-center">
        <span className="text-sm font-medium">
          Điểm vẽ: <span className="text-blue-600 font-bold">{pointCount}</span>
        </span>

        {canFinish && (
          <Button
            onClick={onFinish}
            disabled={!isDrawing}
            variant="default"
            size="sm"
          >
            <Check className="w-4 h-4" />
            Hoàn thành vùng
          </Button>
        )}

        {pointCount > 0 && (
          <Button
            onClick={onClear}
            variant="outline"
            size="sm"
          >
            <Trash className="w-4 h-4" />
            Xóa vùng
          </Button>
        )}
      </div>

      {/* Instruction Text */}
      <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md flex gap-2">
        <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <strong>Hướng dẫn:</strong>
          <ul className="list-disc ml-4 mt-1">
            <li><strong>Vẽ:</strong> Click để thêm điểm, bấm vào điểm đầu hoặc nút "Hoàn thành" khi có ≥3 điểm</li>
            <li><strong>Chỉnh sửa (sau khi hoàn thành):</strong> Kéo thả điểm để di chuyển, bấm vào cạnh để thêm điểm mới</li>
            <li>Không thể thêm điểm mới bên ngoài vùng sau khi hoàn thành</li>
            <li>Các điểm nằm trong vùng sẽ hiển thị, ngoài vùng sẽ ẩn</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
