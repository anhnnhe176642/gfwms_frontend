'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface CanvasControlBarProps {
  isEditMode: boolean;
  canUndo: boolean;
  showLabels: boolean;
  onEditModeToggle: () => void;
  onUndo: () => void;
  onLabelsToggle: () => void;
  sizeControlPanel: React.ReactNode;
  confidenceFilter?: React.ReactNode;
}

export const CanvasControlBar: React.FC<CanvasControlBarProps> = ({
  isEditMode,
  canUndo,
  showLabels,
  onEditModeToggle,
  onUndo,
  onLabelsToggle,
  sizeControlPanel,
  confidenceFilter,
}) => {
  return (
    <div className="flex gap-2 flex-wrap items-center">
      {/* Edit Mode Controls */}
      <Button
        variant={isEditMode ? 'default' : 'outline'}
        onClick={onEditModeToggle}
      >
        {isEditMode ? '✓ Chế độ chỉnh sửa (bật)' : '○ Chế độ chỉnh sửa (tắt)'}
      </Button>

      {isEditMode && (
        <Button 
          variant="outline" 
          onClick={onUndo}
          disabled={!canUndo}
        >
          ↶ Hoàn tác
        </Button>
      )}

      {/* Labels Toggle */}
      <Button
        variant={showLabels ? 'default' : 'outline'}
        onClick={onLabelsToggle}
      >
        {showLabels ? '👁️ Ẩn tên & độ tin cậy' : '👁️‍🗨️ Hiện tên & độ tin cậy'}
      </Button>

      {/* Size Control Panel */}
      {sizeControlPanel}

      {/* Confidence Filter */}
      {confidenceFilter && <div>{confidenceFilter}</div>}
    </div>
  );
};
