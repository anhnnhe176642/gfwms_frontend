'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, RotateCcw, Eye, EyeOff, GitBranch, Pen, RefreshCw, Loader2 } from 'lucide-react';

interface CanvasControlBarProps {
  isEditMode: boolean;
  isDrawingMode?: boolean;
  canUndo: boolean;
  showLabels: boolean;
  showRowlines: boolean;
  showRowColor?: boolean;
  onEditModeToggle: () => void;
  onDrawingModeToggle?: () => void;
  onUndo: () => void;
  onLabelsToggle: () => void;
  onRowlinesToggle: () => void;
  onRowColorToggle?: () => void;
  sizeControlPanel: React.ReactNode;
  confidenceFilter?: React.ReactNode;
  onReload?: () => void | Promise<void>;
  isReloading?: boolean;
}

export const CanvasControlBar: React.FC<CanvasControlBarProps> = ({
  isEditMode,
  isDrawingMode = false,
  canUndo,
  showLabels,
  showRowlines,
  showRowColor = true,
  onEditModeToggle,
  onDrawingModeToggle,
  onUndo,
  onLabelsToggle,
  onRowlinesToggle,
  onRowColorToggle,
  sizeControlPanel,
  confidenceFilter,
  onReload,
  isReloading,
}) => {
  return (
    <div className="flex gap-2 flex-wrap items-center">
      {/* Edit Mode Controls */}
      <Button
        variant={isEditMode ? 'default' : 'outline'}
        onClick={onEditModeToggle}
        className="gap-2"
      >
        {isEditMode ? (
          <>
            <Check className="w-4 h-4" />
            Chế độ chỉnh sửa (bật)
          </>
        ) : (
          'Chế độ chỉnh sửa (tắt)'
        )}
      </Button>

      {/* Drawing Mode Controls */}
      {onDrawingModeToggle && (
        <Button
          variant={isDrawingMode ? 'default' : 'outline'}
          onClick={onDrawingModeToggle}
          className="gap-2"
        >
          {isDrawingMode ? (
            <>
              <Pen className="w-4 h-4" />
              Chế độ vẽ vùng (bật)
            </>
          ) : (
            <>
              <Pen className="w-4 h-4" />
              Chế độ vẽ vùng (tắt)
            </>
          )}
        </Button>
      )}

      {isEditMode && (
        <Button 
          variant="outline" 
          onClick={onUndo}
          disabled={!canUndo}
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Hoàn tác
        </Button>
      )}

      {/* Labels Toggle */}
      <Button
        variant={showLabels ? 'default' : 'outline'}
        onClick={onLabelsToggle}
        className="gap-2"
      >
        {showLabels ? (
          <>
            <Eye className="w-4 h-4" />
            Ẩn tên & độ tin cậy
          </>
        ) : (
          <>
            <EyeOff className="w-4 h-4" />
            Hiện tên & độ tin cậy
          </>
        )}
      </Button>

      {/* Rowlines Toggle */}
      <Button
        variant={showRowlines ? 'default' : 'outline'}
        onClick={onRowlinesToggle}
        className="gap-2"
      >
        {showRowlines ? (
          <>
            <GitBranch className="w-4 h-4" />
            Ẩn Rowline
          </>
        ) : (
          <>
            <GitBranch className="w-4 h-4" />
            Hiện Rowline
          </>
        )}
      </Button>

      {/* Row Color Toggle */}
      <Button
        variant={showRowColor ? 'default' : 'outline'}
        onClick={onRowColorToggle}
        className="gap-2"
      >
        {showRowColor ? (
          <>
            <Eye className="w-4 h-4" />
            Hiện màu viền
          </>
        ) : (
          <>
            <EyeOff className="w-4 h-4" />
            Hiện màu hình tròn
          </>
        )}
      </Button>

      {/* Size Control Panel */}
      {sizeControlPanel}

      {/* Confidence Filter */}
      {confidenceFilter && (
        <div className="flex items-center gap-2">
          <div>{confidenceFilter}</div>
          <Button
            variant="outline"
            size="sm"
            onClick={onReload}
            disabled={!onReload || isReloading}
            className="gap-2 p-2"
            aria-label="Tải lại"
          >
            {isReloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </Button>
        </div>
      )}
    </div>
  );
};
