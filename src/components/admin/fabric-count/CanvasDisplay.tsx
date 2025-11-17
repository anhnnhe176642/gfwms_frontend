'use client';

import React from 'react';

interface CanvasDisplayProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isEditMode: boolean;
  onCanvasClick: (e: React.MouseEvent<HTMLCanvasElement>) => void;
}

export const CanvasDisplay: React.FC<CanvasDisplayProps> = ({
  canvasRef,
  isEditMode,
  onCanvasClick,
}) => {
  return (
    <div className="flex justify-center">
      <canvas
        ref={canvasRef}
        onClick={onCanvasClick}
        className={`max-w-full h-auto border border-input rounded-md ${
          isEditMode ? 'cursor-pointer' : 'cursor-default'
        }`}
      />
    </div>
  );
};
