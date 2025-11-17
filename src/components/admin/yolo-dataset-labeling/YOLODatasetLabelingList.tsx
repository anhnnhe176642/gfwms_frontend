'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * YOLO Dataset Labeling List Component
 * Hiển thị danh sách ảnh cần gán nhãn để train YOLO model
 */
const YOLODatasetLabelingList: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Danh sách ảnh cần gán nhãn</CardTitle>
        <CardDescription>
          Danh sách các ảnh cần được gán nhãn để train mô hình YOLO
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Thành phần danh sách sẽ được phát triển.
        </p>
      </CardContent>
    </Card>
  );
};

export default YOLODatasetLabelingList;
