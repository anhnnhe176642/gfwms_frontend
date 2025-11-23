'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { YOLOImageLabelingKonva } from '@/components/admin/yolo-dataset-labeling-konva/YOLOImageLabelingKonva';

export default function YOLODatasetLabelingKonvaPage() {
  const router = useRouter();

  // Mock data for demo
  const mockImageSrc = '/fabric.jpg';
  const mockClasses = ['fabric', 'defect', 'label', 'pattern'];

  const handleSave = (
    labels: Array<{
      classId: number;
      className: string;
      x: number;
      y: number;
      width: number;
      height: number;
    }>,
    status?: 'draft' | 'completed'
  ) => {
    console.log('Labels saved:', { labels, status });
    alert(`Đã ${status === 'draft' ? 'lưu nháp' : 'lưu'} thành công`);
  };

  const handleCancel = () => {
    alert('Hủy bỏ');
    router.back();
  };

  return (
    <div className="w-full p-6">
      <YOLOImageLabelingKonva
        imageSrc={mockImageSrc}
        classes={mockClasses}
        existingLabels={[]}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
}
