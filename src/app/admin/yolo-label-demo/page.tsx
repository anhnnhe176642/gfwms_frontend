'use client';

import React, { useState } from 'react';
import { YOLOImageLabeling } from '@/components/admin/yolo-dataset-labeling/YOLOImageLabeling';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

/**
 * Trang demo YOLO Image Labeling
 * Sử dụng ảnh mẫu fabric.jpg từ public folder
 */
const YOLOLabelDemoPage: React.FC = () => {
  const [savedLabels, setSavedLabels] = useState<any[]>([]);

  // Danh sách classes mẫu cho fabric detection
  const fabricClasses = [
    'fabric_roll',
    'fabric_piece',
    'fabric_defect',
    'fabric_edge',
    'fabric_label',
  ];

  const handleSave = (labels: any[]) => {
    setSavedLabels(labels);
    console.log('YOLO Labels saved:', labels);
    
    // Hiển thị kết quả
    labels.forEach((label, index) => {
      console.log(`Label ${index + 1}:`, {
        class: label.className,
        classId: label.classId,
        x: label.x.toFixed(4),
        y: label.y.toFixed(4),
        width: label.width.toFixed(4),
        height: label.height.toFixed(4),
      });
    });
  };

  const handleCancel = () => {
    toast.info('Đã hủy labeling');
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">YOLO Image Labeling Demo</h1>
        <p className="text-muted-foreground mt-2">
          Demo tính năng gán nhãn YOLO với ảnh mẫu fabric.jpg
        </p>
      </div>

      <YOLOImageLabeling
        imageSrc="/fabric.jpg"
        classes={fabricClasses}
        onSave={handleSave}
        onCancel={handleCancel}
      />

      {savedLabels.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>YOLO Labels (Normalized Format)</CardTitle>
            <CardDescription>
              Format: class_id x_center y_center width height (tất cả normalized 0-1)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-md font-mono text-sm space-y-2">
              {savedLabels.map((label, index) => (
                <div key={index}>
                  {label.classId} {label.x.toFixed(6)} {label.y.toFixed(6)}{' '}
                  {label.width.toFixed(6)} {label.height.toFixed(6)}
                  <span className="text-muted-foreground ml-4">
                    # {label.className}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2">
              <h4 className="font-semibold">Labels JSON:</h4>
              <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-64">
                {JSON.stringify(savedLabels, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Hướng dẫn sử dụng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <strong>1. Chọn class:</strong> Chọn class label từ dropdown trước khi vẽ box
          </div>
          <div>
            <strong>2. Vẽ bounding box:</strong> Click và kéo chuột trên ảnh để vẽ box xung quanh đối tượng
          </div>
          <div>
            <strong>3. Resize:</strong> Click vào góc hoặc cạnh của box và kéo để thay đổi kích thước
          </div>
          <div>
            <strong>4. Di chuyển:</strong> Click vào bên trong box và kéo để di chuyển
          </div>
          <div>
            <strong>5. Thay đổi label:</strong> Chọn class mới từ dropdown trong danh sách boxes
          </div>
          <div>
            <strong>6. Xóa box:</strong> Click vào icon 🗑️ để xóa box
          </div>
          <div>
            <strong>7. Lưu:</strong> Click &quot;Lưu labels&quot; để export YOLO format
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default YOLOLabelDemoPage;
