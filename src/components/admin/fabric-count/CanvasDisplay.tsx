'use client';

import React from 'react';
import { Detection } from '@/types/yolo';

interface CanvasDisplayProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isEditMode: boolean;
  isDrawingMode?: boolean;
  onCanvasClick: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onCanvasMouseMove?: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onCanvasMouseDown?: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onCanvasMouseUp?: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  polygonFilteredCount?: number;
  totalDetections?: number;
  detectionsByClass?: Record<string, number>;
  filteredDetectionsCount?: number;
  totalDetectionsCount?: number;
}

export const CanvasDisplay: React.FC<CanvasDisplayProps> = ({
  canvasRef,
  isEditMode,
  isDrawingMode = false,
  onCanvasClick,
  onCanvasMouseMove,
  onCanvasMouseDown,
  onCanvasMouseUp,
  polygonFilteredCount = 0,
  totalDetections = 0,
  detectionsByClass = {},
  filteredDetectionsCount = 0,
  totalDetectionsCount = 0,
}) => {
  return (
    <div className="space-y-4">
      {totalDetections > 0 && (
        <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            Kết quả đếm được: {totalDetections} vật thể
          </p>
          {Object.entries(detectionsByClass).length > 0 && (
            <div className="flex flex-wrap gap-3">
              {Object.entries(detectionsByClass).map(([className, count]) => (
                <div key={className} className="text-xs text-blue-800 dark:text-blue-200">
                  <span className="font-semibold">{className}:</span> {count}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          onClick={onCanvasClick}
          onMouseMove={onCanvasMouseMove}
          onMouseDown={onCanvasMouseDown}
          onMouseUp={onCanvasMouseUp}
          onMouseLeave={onCanvasMouseUp}
          className={`max-w-full h-auto border border-input rounded-md ${
            isEditMode || isDrawingMode ? 'cursor-crosshair' : 'cursor-default'
          }`}
        />
      </div>
    </div>
  );
};
