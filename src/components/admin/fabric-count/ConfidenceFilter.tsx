'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Target, X, Loader2 } from 'lucide-react';

interface ConfidenceFilterProps {
  value: number;
  onChange: (value: number) => void;
  detectionCount: number;
  filteredCount: number;
  isLoading?: boolean;
}

export const ConfidenceFilter: React.FC<ConfidenceFilterProps> = ({
  value,
  onChange,
  detectionCount,
  filteredCount,
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Đang tải...</span>
          </>
        ) : (
          <>
            <Target className="w-4 h-4" />
            <span>Độ tin cậy: {Math.round(value * 100)}%</span>
            <span className="text-xs text-muted-foreground">
              ({filteredCount}/{detectionCount})
            </span>
          </>
        )}
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white dark:bg-slate-950 border border-input rounded-md shadow-lg p-4 w-80 z-50">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Ngưỡng độ tin cậy</label>
              <span className="text-lg font-bold text-blue-600">
                {Math.round(value * 100)}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(value * 100)}
              onChange={(e) => onChange(Number(e.target.value) / 100)}
              disabled={isLoading}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            />

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>100%</span>
            </div>

            <div className="bg-muted p-2 rounded text-sm">
              <p className="text-muted-foreground">
                Hiển thị: <strong className="text-foreground">{filteredCount}</strong> vật thể
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Ẩn: {detectionCount - filteredCount} vật thể có độ tin cậy thấp hơn
              </p>
            </div>

            <Button
              variant="default"
              size="sm"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
              className="w-full gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang tải...
                </>
              ) : (
                <>
                  <X className="w-4 h-4" />
                  Đóng
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
