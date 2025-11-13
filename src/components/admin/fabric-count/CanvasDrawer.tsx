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
  const [maxObjectSize, setMaxObjectSize] = useState(500);
  const [objectSize, setObjectSize] = useState(100);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [hasUserSetSize, setHasUserSetSize] = useState(false);
  const [showLabels, setShowLabels] = useState(true);

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

  const calculateMaxObjectSize = useCallback(() => {
    // Kích thước tối đa là 80% của kích thước ảnh nhỏ nhất (width hoặc height)
    const minDimension = Math.min(imageInfo.width, imageInfo.height);
    return Math.floor(minDimension * 0.8);
  }, [imageInfo.width, imageInfo.height]);

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
        const { class_name, confidence, center, dimensions } = detection;

        const circleColor = circleColors[index % circleColors.length];

        const centerX = center.x * calculatedScale;
        const centerY = center.y * calculatedScale;
        const radius = (Math.min(dimensions.width, dimensions.height) * calculatedScale) / 2;

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
        const fontSize = Math.max(Math.floor(radius * 1.5), 14); // Font size ~ 1.5x bán kính, tối thiểu 14px
        ctx.font = `bold ${fontSize}px Arial`;
        
        // Vẽ viền đen cho chữ
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(fontSize * 0.05, 1); // Độ dày viền ~3% font size, tối thiểu 1px
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeText(String(orderNumber), centerX, centerY);
        
        // Vẽ chữ trắng
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
        if (showLabels) {
          ctx.fillText(label, centerX, labelY);
        }
      });

      // Vẽ hình tròn xem trước ở tâm ảnh khi đang kéo slider
      if (isEditMode && isDraggingSlider) {
        const centerX = displayWidth / 2;
        const centerY = displayHeight / 2;
        const radius = (objectSize * calculatedScale) / 2;

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
  }, [currentDetections, calculateScale, imageUrl, isEditMode, objectSize, isDraggingSlider, showLabels]);

  React.useEffect(() => {
    if (imageUrl) {
      setIsLoading(true);
      drawDetections();
      const newMaxSize = calculateMaxObjectSize();
      setMaxObjectSize(newMaxSize);
      // Chỉ set objectSize mặc định nếu người dùng chưa từng thay đổi
      if (!hasUserSetSize) {
        setObjectSize(Math.floor(newMaxSize * 0.2));
      }
    }
  }, [imageUrl, drawDetections, calculateMaxObjectSize, hasUserSetSize]);

  React.useEffect(() => {
    setCurrentDetections(detections);
  }, [detections]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEditMode || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Tính toán tọa độ click chính xác với device pixel ratio
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Kiểm tra xem click có nằm trong vòng tròn nào không
    for (let i = 0; i < currentDetections.length; i++) {
      const detection = currentDetections[i];
      const centerX = detection.center.x * scale;
      const centerY = detection.center.y * scale;
      const radius = (Math.min(detection.dimensions.width, detection.dimensions.height) * scale) / 2;

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
      center: {
        x: originalX,
        y: originalY,
      },
      dimensions: {
        width: objectSize,
        height: objectSize,
      },
    } as Detection;

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
      <div className="flex gap-2 flex-wrap">
        {enableEdit && (
          <>
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
          </>
        )}
        <Button
          variant={showLabels ? 'default' : 'outline'}
          onClick={() => setShowLabels(!showLabels)}
        >
          {showLabels ? '👁️ Ẩn tên & độ chính xác' : '👁️‍🗨️ Hiện tên & độ chính xác'}
        </Button>
      </div>

      {isEditMode && (
        <div className="space-y-3">
          <div className="bg-muted p-3 rounded-md">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Kích thước:</label>
              <input
                type="range"
                min="20"
                max={maxObjectSize}
                value={objectSize}
                onChange={(e) => {
                  setObjectSize(Number(e.target.value));
                  setHasUserSetSize(true);
                }}
                onMouseDown={() => setIsDraggingSlider(true)}
                onMouseUp={() => setIsDraggingSlider(false)}
                onTouchStart={() => setIsDraggingSlider(true)}
                onTouchEnd={() => setIsDraggingSlider(false)}
                className="w-48 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-sm font-medium">{Math.round((objectSize / maxObjectSize) * 100)}%</span>
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
