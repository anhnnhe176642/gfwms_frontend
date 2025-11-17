'use client';

import React from 'react';

interface EditModeControlsProps {
  objectSize: number;
  maxObjectSize: number;
  isDraggingSlider: boolean;
  scale: number;
  onObjectSizeChange: (value: number) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

export const EditModeControls: React.FC<EditModeControlsProps> = ({
  objectSize,
  maxObjectSize,
  isDraggingSlider,
  scale,
  onObjectSizeChange,
  onDragStart,
  onDragEnd,
}) => {
  return (
    <div className="space-y-3">
      {/* Object Size Control */}
      <div className="bg-muted p-3 rounded-md">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Kích thước:</label>
          <input
            type="range"
            min="20"
            max={maxObjectSize}
            value={objectSize}
            onChange={(e) => onObjectSizeChange(Number(e.target.value))}
            onMouseDown={onDragStart}
            onMouseUp={onDragEnd}
            onTouchStart={onDragStart}
            onTouchEnd={onDragEnd}
            className="w-48 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <span className="text-sm font-medium">
            {Math.round((objectSize / maxObjectSize) * 100)}%
          </span>
        </div>
      </div>

      {/* Instruction Text */}
      <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
        💡 <strong>Hướng dẫn:</strong> Click vào vòng tròn để xóa, click vào vị trí khác để thêm vật thể mới
      </div>

      {/* Preview Circle */}
      {isDraggingSlider && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-4">
            <div 
              className="bg-blue-500 bg-opacity-40 border-2 border-blue-500 rounded-full flex items-center justify-center"
              style={{
                width: `${objectSize * scale}px`,
                height: `${objectSize * scale}px`,
              }}
            >
              <span className="text-white font-bold text-2xl">
                {Math.round((objectSize / maxObjectSize) * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
