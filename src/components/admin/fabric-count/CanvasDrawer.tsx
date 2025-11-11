'use client';

import React, { useCallback, useState } from 'react';
import { Detection } from '@/types/yolo';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface CanvasDrawerProps {
  imageUrl: string;
  detections: Detection[];
  imageInfo: {
    width: number;
    height: number;
  };
  containerWidth?: number;
  onDetectionsChange?: (detections: Detection[]) => void;
  enableEdit?: boolean;
}

export const CanvasDrawer: React.FC<CanvasDrawerProps> = ({
  imageUrl,
  detections,
  imageInfo,
  containerWidth = 800,
  onDetectionsChange,
  enableEdit = false,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [scale, setScale] = useState(1);
  const [currentDetections, setCurrentDetections] = useState<Detection[]>(detections);
  const [history, setHistory] = useState<Detection[][]>([detections]);
  const [objectSize, setObjectSize] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const addToHistory = useCallback((detections: Detection[]) => {
    setHistory((prevHistory) => [...prevHistory, detections]);
  }, []);

  const calculateScale = useCallback(() => {
    const maxWidth = containerWidth;
    const maxHeight = 600;

    const widthRatio = maxWidth / imageInfo.width;
    const heightRatio = maxHeight / imageInfo.height;

    return Math.min(widthRatio, heightRatio, 1);
  }, [containerWidth, imageInfo.width, imageInfo.height]);

  const drawDetections = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const calculatedScale = calculateScale();
      setScale(calculatedScale);

      const displayWidth = img.width * calculatedScale;
      const displayHeight = img.height * calculatedScale;

      canvas.width = displayWidth;
      canvas.height = displayHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        toast.error('Không thể lấy canvas context');
        return;
      }

      // Vẽ ảnh
      ctx.drawImage(img, 0, 0, displayWidth, displayHeight);

      // Mảng màu cho các số thứ tự khác nhau
      const circleColors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
        '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#F5A962',
        '#D7BEE8', '#A9DFBF',
      ];

      // Vẽ bounding boxes với hình tròn
      currentDetections.forEach((detection, index) => {
        const { bbox, class_name, confidence, center } = detection;

        const circleColor = circleColors[index % circleColors.length];

        const x1 = bbox.x1 * calculatedScale;
        const y1 = bbox.y1 * calculatedScale;
        const x2 = bbox.x2 * calculatedScale;
        const y2 = bbox.y2 * calculatedScale;
        const width = x2 - x1;
        const height = y2 - y1;
        const radius = Math.max(width, height) / 2 + 10;

        const centerX = center.x * calculatedScale;
        const centerY = center.y * calculatedScale;

        // Vẽ vòng tròn với tô màu và độ trong suốt
        ctx.fillStyle = circleColor + '40';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fill();

        // Vẽ border vòng tròn
        ctx.strokeStyle = circleColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Vẽ số thứ tự ở tâm hình tròn
        const orderNumber = index + 1;
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(orderNumber), centerX, centerY);

        // Vẽ label ở dưới vòng tròn
        const label = `${class_name} ${(confidence * 100).toFixed(1)}%`;
        ctx.font = '12px Arial';
        ctx.fillStyle = circleColor;
        ctx.textAlign = 'center';
        const labelY = centerY + radius + 15;
        ctx.fillText(label, centerX, labelY);
      });

      // Vẽ hình tròn xem trước ở tâm ảnh khi đang kéo slider
      if (isEditMode && isDraggingSlider) {
        const centerX = displayWidth / 2;
        const centerY = displayHeight / 2;
        const radius = (objectSize * calculatedScale) / 2 + 10;

        // Vẽ vòng tròn xem trước
        ctx.fillStyle = '#4ECDC4' + '40';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fill();

        ctx.strokeStyle = '#4ECDC4';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Vẽ chữ "Preview"
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Preview', centerX, centerY);
      }

      setIsLoading(false);
    };

    img.onerror = () => {
      toast.error('Không thể tải ảnh');
      setIsLoading(false);
    };

    img.src = imageUrl;
  }, [currentDetections, calculateScale, imageUrl, isEditMode, objectSize, isDraggingSlider]);

  React.useEffect(() => {
    if (imageUrl) {
      setIsLoading(true);
      drawDetections();
    }
  }, [imageUrl, drawDetections]);

  React.useEffect(() => {
    setCurrentDetections(detections);
  }, [detections]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEditMode || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Kiểm tra xem click có nằm trong vòng tròn nào không
    for (let i = 0; i < currentDetections.length; i++) {
      const detection = currentDetections[i];
      const centerX = detection.center.x * scale;
      const centerY = detection.center.y * scale;
      const x1 = detection.bbox.x1 * scale;
      const y1 = detection.bbox.y1 * scale;
      const x2 = detection.bbox.x2 * scale;
      const y2 = detection.bbox.y2 * scale;
      const width = x2 - x1;
      const height = y2 - y1;
      const radius = Math.max(width, height) / 2 + 10;

      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

      if (distance <= radius) {
        // Click vào vòng tròn → xóa
        deleteDetection(i);
        return;
      }
    }

    // Không click vào vòng tròn nào → thêm vật thể mới
    addDetection(x, y);
  };

  const deleteDetection = (index: number) => {
    const newDetections = currentDetections.filter((_, i) => i !== index);
    setCurrentDetections(newDetections);
    addToHistory(newDetections);
    if (onDetectionsChange) {
      onDetectionsChange(newDetections);
    }
    toast.success(`Đã xóa vật thể #${index + 1}`);
    drawDetections();
  };

  const addDetection = (x: number, y: number) => {
    // Chuyển đổi pixel sang tọa độ gốc
    const originalX = x / scale;
    const originalY = y / scale;

    // Tạo vật thể mới với kích thước từ slider
    const newDetection: Detection = {
      class_id: 0,
      class_name: 'custom',
      confidence: 0.95,
      bbox: {
        x1: Math.max(0, originalX - objectSize / 2),
        y1: Math.max(0, originalY - objectSize / 2),
        x2: Math.min(imageInfo.width, originalX + objectSize / 2),
        y2: Math.min(imageInfo.height, originalY + objectSize / 2),
      },
      center: {
        x: originalX,
        y: originalY,
      },
      dimensions: {
        width: objectSize,
        height: objectSize,
      },
    };

    const newDetections = [...currentDetections, newDetection];
    setCurrentDetections(newDetections);
    addToHistory(newDetections);
    if (onDetectionsChange) {
      onDetectionsChange(newDetections);
    }
    toast.success(`Đã thêm vật thể mới #${newDetections.length}`);
    drawDetections();
  };

  const handleUndo = () => {
    if (history.length <= 1) {
      toast.info('Không có thao tác nào để hoàn tác');
      return;
    }

    const newHistory = history.slice(0, -1);
    const previousDetections = newHistory[newHistory.length - 1];
    setHistory(newHistory);
    setCurrentDetections(previousDetections);
    if (onDetectionsChange) {
      onDetectionsChange(previousDetections);
    }
    toast.success('Đã hoàn tác thao tác cuối cùng');
  };

  return (
    <div ref={containerRef} className="w-full space-y-4">
      {enableEdit && (
        <div className="flex gap-2">
          <Button
            variant={isEditMode ? 'default' : 'outline'}
            onClick={() => setIsEditMode(!isEditMode)}
          >
            {isEditMode ? '✓ Chế độ chỉnh sửa (bật)' : '○ Chế độ chỉnh sửa (tắt)'}
          </Button>
          {isEditMode && (
            <Button 
              variant="outline" 
              onClick={handleUndo}
              disabled={history.length <= 1}
            >
              ↶ Hoàn tác
            </Button>
          )}
        </div>
      )}

      {isEditMode && (
        <div className="space-y-3">
          <div className="bg-muted p-3 rounded-md">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Kích thước:</label>
              <input
                type="range"
                min="20"
                max="500"
                value={objectSize}
                onChange={(e) => setObjectSize(Number(e.target.value))}
                onMouseDown={() => setIsDraggingSlider(true)}
                onMouseUp={() => setIsDraggingSlider(false)}
                onTouchStart={() => setIsDraggingSlider(true)}
                onTouchEnd={() => setIsDraggingSlider(false)}
                className="w-48 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-sm font-medium">{objectSize}px</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
            💡 <strong>Hướng dẫn:</strong> Click vào vòng tròn để xóa, click vào vị trí khác để thêm vật thể mới
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className={`max-w-full h-auto border border-input rounded-md ${
            isEditMode ? 'cursor-pointer' : 'cursor-default'
          }`}
        />
      </div>
    </div>
  );
};
