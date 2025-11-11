'use client';

import React from 'react';
import { Summary, ImageInfo, ModelInfo } from '@/types/yolo';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  summary: Summary;
  imageInfo: ImageInfo;
  modelInfo: ModelInfo;
}

export default function SummaryCard({ summary, imageInfo, modelInfo }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Objects Card */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-sm font-medium">
            Tổng vật thể phát hiện
          </p>
          <p className="text-3xl font-bold text-primary mt-2">
            {summary.total_objects}
          </p>
        </CardContent>
      </Card>

      {/* Class Counts */}
      {Object.entries(summary.counts_by_class).map(([className, count]) => (
        <Card key={className}>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm font-medium capitalize">
              {className}
            </p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-500 mt-2">
              {count}
            </p>
          </CardContent>
        </Card>
      ))}

      {/* Image Dimensions */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-sm font-medium">
            Kích thước ảnh
          </p>
          <p className="text-sm font-mono mt-2">
            {imageInfo.width} x {imageInfo.height}px
          </p>
        </CardContent>
      </Card>

      {/* Model Info */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-sm font-medium">
            Ngưỡng tin cậy
          </p>
          <p className="text-sm font-mono mt-2">
            {(modelInfo.confidence_threshold * 100).toFixed(0)}%
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
