'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface SizeControlPanelProps {
  fontSize: number;
  circleScale: number;
  manualCircleColor: string;
  onFontSizeChange: (value: number) => void;
  onCircleScaleChange: (value: number) => void;
  onManualCircleColorChange: (value: string) => void;
}

export const SizeControlPanel: React.FC<SizeControlPanelProps> = ({
  fontSize,
  circleScale,
  manualCircleColor,
  onFontSizeChange,
  onCircleScaleChange,
  onManualCircleColorChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <Button
        variant={isOpen ? 'default' : 'outline'}
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <span>📏 Kích thước: {Math.round(fontSize * 100)}%</span>
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white dark:bg-slate-950 border border-input rounded-md shadow-lg p-4 w-80 z-50">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Kích thước chữ</label>
              <span className="text-lg font-bold text-blue-600">
                {Math.round(fontSize * 100)}%
              </span>
            </div>

            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={fontSize}
              onChange={(e) => onFontSizeChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>50%</span>
              <span>200%</span>
            </div>

            <div className="border-t pt-3">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Tỉ lệ hình tròn</label>
                <span className="text-lg font-bold text-blue-600">
                  {Math.round(circleScale * 100)}%
                </span>
              </div>

              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={circleScale}
                onChange={(e) => onCircleScaleChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />

            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>50%</span>
              <span>200%</span>
            </div>
            </div>

            <div className="border-t pt-3">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Màu hình tròn tuỳ chỉnh</label>
              </div>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={manualCircleColor}
                  onChange={(e) => onManualCircleColorChange(e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={manualCircleColor}
                  onChange={(e) => onManualCircleColorChange(e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border border-input rounded"
                  placeholder="#FF6B6B"
                />
              </div>
            </div>            <Button
              variant="default"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="w-full"
            >
              Đóng
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
