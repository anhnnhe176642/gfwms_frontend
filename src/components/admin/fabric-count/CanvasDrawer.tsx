'use client';

import React, { useCallback, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { Detection } from '@/types/yolo';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { CanvasControlBar } from './CanvasControlBar';
import { CanvasDisplay } from './CanvasDisplay';
import { EditModeControls } from './EditModeControls';
import { DrawingModeControls } from './DrawingModeControls';
import { SizeControlPanel } from './SizeControlPanel';
import { setupCanvasDPR, mapClientToLogicalPoint } from '@/lib/canvasUtils';
import { usePolygonDrawing, type PolygonPoint } from '@/hooks/usePolygonDrawing';

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
  showRowlines?: boolean;
  onShowRowlinesChange?: (show: boolean) => void;
  confidenceFilter?: React.ReactNode;
  onReload?: () => void | Promise<void>;
  isReloading?: boolean;
  onPolygonFilteredCountChange?: (count: number) => void;
  detectionsByClass?: Record<string, number>;
  filteredDetectionsCount?: number;
  totalDetectionsCount?: number;
}

export const CanvasDrawer: React.FC<CanvasDrawerProps> = ({
  imageUrl,
  detections,
  imageInfo,
  containerWidth = 800,
  onDetectionsChange,
  enableEdit = false,
  showRowlines = true,
  onShowRowlinesChange,
  confidenceFilter,
  onReload,
  isReloading,
  onPolygonFilteredCountChange,
  detectionsByClass = {},
  filteredDetectionsCount = 0,
  totalDetectionsCount = 0,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [scale, setScale] = useState(1);
  const [currentDetections, setCurrentDetections] = useState<Detection[]>(detections);
  const [history, setHistory] = useState<Detection[][]>([detections]);
  const [maxObjectSize, setMaxObjectSize] = useState(500);
  const [objectSize, setObjectSize] = useState(100);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [hasUserSetSize, setHasUserSetSize] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const [fontSize, setFontSize] = useState(1);
  const [circleScale, setCircleScale] = useState(1);
  const [manualCircleColor, setManualCircleColor] = useState('#FF6B6B');
  const [localShowRowlines, setLocalShowRowlines] = useState(showRowlines);
  const [polygonFilteredCount, setPolygonFilteredCount] = useState<number>(0);
  const [filteredDetectionsByClass, setFilteredDetectionsByClass] = useState<Record<string, number>>({});
  const [filteredTotalDetections, setFilteredTotalDetections] = useState<number>(0);

  // Polygon drawing state
  const polygon = usePolygonDrawing();

  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const addToHistory = useCallback((detections: Detection[]) => {
    setHistory((prevHistory) => [...prevHistory, detections]);
  }, []);

  const calculateScale = useCallback(() => {
    const maxWidth = containerWidth;

    const widthRatio = maxWidth / imageInfo.width;

    return Math.min(widthRatio, 1);
  }, [containerWidth, imageInfo.width]);

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
        const dpr = setupCanvasDPR(canvas, displayWidth, displayHeight);
        canvas.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        toast.error('Không thể lấy canvas context');
        return;
      }

      // Vẽ ảnh
      ctx.drawImage(img, 0, 0, displayWidth, displayHeight);
      
      // Tính toán số phát hiện được lọc bởi vùng đa giác
      let filteredDetectionCount = 0;
      const classCountsInRegion: Record<string, number> = {};
      // Mảng màu cho các rows khác nhau
      const rowColors = [
        "#FF6B6B", // đỏ
        "#45B7D1", // xanh dương
        "#F7DC6F", // vàng
        "#BB8FCE", // tím
        "#F5A962", // cam gold
        "#98D8C8", // xanh mint
        "#D7BEE8", // tím nhạt
        "#FFA07A", // cam nhạt
      ];

      // Vẽ rowlines (nếu có và được bật)
      if (localShowRowlines) {
        type RowLine = { row: number; meanX: number; meanY: number; dirX: number; dirY: number };
        const rowlinesMap = new Map<number, RowLine>();
        currentDetections.forEach((detection) => {
          if (detection.rowline && detection.rowline.row !== undefined) {
            rowlinesMap.set(detection.rowline.row, detection.rowline);
          }
        });

        if (rowlinesMap.size > 0) {
          // Vẽ các rowline, mỗi row 1 đường
          rowlinesMap.forEach((rowline, row) => {
            if (!rowline) return;
            // Màu theo row
            const colorIndex = row !== undefined ? (row - 1) % rowColors.length : 0;
            const lineColor = rowColors[colorIndex];

            // Vector cơ sở (meanX, meanY) và hướng (dirX, dirY)
            const mx = rowline.meanX * calculatedScale;
            const my = rowline.meanY * calculatedScale;
            const dx = rowline.dirX;
            const dy = rowline.dirY;

            // Khoảng dài đủ lớn để kéo đường qua toàn bộ ảnh
            const length = Math.max(displayWidth, displayHeight) * 2;
            const startX = mx - dx * length;
            const startY = my - dy * length;
            const endX = mx + dx * length;
            const endY = my + dy * length;

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 3;
            // Solid line to show rowline
            ctx.setLineDash([]);
            ctx.globalAlpha = 0.9;
            ctx.stroke();
            // Reset line dash and alpha
            ctx.globalAlpha = 1.0;

            // No label - the user requested not to show row numbers
          });
        }
      }

      // (nothing)


      // Vẽ bounding boxes với hình tròn
      let displayIndex = 0; // Index cho hiển thị (được cập nhật khi lọc theo vùng)
      currentDetections.forEach((detection, index) => {
        const { class_name, confidence, center, dimensions, row } = detection;

        // Kiểm tra xem điểm có nằm trong đa giác không (nếu đang vẽ đa giác)
        if (isDrawingMode && polygon.polygonPoints.length > 0) {
          const isInside = polygon.isPointInPolygon({ x: center.x, y: center.y });
          if (!isInside) {
            // Không hiển thị điểm nằm ngoài vùng
            return;
          }
          filteredDetectionCount++; // Đếm các phát hiện nằm trong vùng
          // Cập nhật count theo class
          classCountsInRegion[class_name] = (classCountsInRegion[class_name] || 0) + 1;
        }

        // Nếu có row, sử dụng màu theo row; nếu không có, sử dụng màu theo index
        const colorIndex = row !== undefined ? (row - 1) % rowColors.length : displayIndex % rowColors.length;
        // Nếu là custom (được vẽ thủ công), dùng màu tuỳ chỉnh; nếu không, dùng màu mặc định
        const circleColor = class_name === 'custom' ? manualCircleColor : rowColors[colorIndex];

        const centerX = center.x * calculatedScale;
        const centerY = center.y * calculatedScale;
        const radius = (Math.min(dimensions.width, dimensions.height) * calculatedScale) / 2 * circleScale;

        // Vẽ vòng tròn với tô màu và độ trong suốt
        ctx.fillStyle = circleColor + '40';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fill();

        // Vẽ border vòng tròn
        ctx.strokeStyle = circleColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Vẽ số thứ tự ở tâm hình tròn (sử dụng displayIndex khi lọc vùng)
        const orderNumber = isDrawingMode && polygon.polygonPoints.length > 0 ? displayIndex + 1 : index + 1;
        const baseFontSize = Math.max(Math.floor(radius * 1.5), 14); // Font size ~ 1.5x bán kính, tối thiểu 14px
        const adjustedFontSize = Math.floor(baseFontSize * fontSize);
        ctx.font = `bold ${adjustedFontSize}px Arial`;
        
        // Vẽ viền đen cho chữ
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(adjustedFontSize * 0.05, 1); // Độ dày viền ~3% font size, tối thiểu 1px
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeText(String(orderNumber), centerX, centerY);
        
        // Vẽ chữ trắng
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(orderNumber), centerX, centerY);

        // Vẽ label ở dưới vòng tròn
        //const rowLabel = detection.row ? ` (Row ${detection.row})` : '';
        const label = `${class_name} ${(confidence * 100).toFixed(1)}%`;
        ctx.font = '12px Arial';
        ctx.fillStyle = circleColor;
        ctx.textAlign = 'center';
        const labelY = centerY + radius + 15;
        if (showLabels) {
          ctx.fillText(label, centerX, labelY);
        }

        displayIndex++; // Tăng index cho phần tử kế tiếp được hiển thị
      });

      // Vẽ đa giác (nếu đang vẽ)
      if (isDrawingMode && polygon.polygonPoints.length > 0) {
        // Vẽ nền đa giác (filled polygon)
        ctx.fillStyle = 'rgba(255, 107, 107, 0.1)'; // Đỏ nhạt với độ trong suốt 10%
        ctx.beginPath();
        const firstPoint = polygon.polygonPoints[0];
        ctx.moveTo(firstPoint.x * calculatedScale, firstPoint.y * calculatedScale);

        for (let i = 1; i < polygon.polygonPoints.length; i++) {
          const p = polygon.polygonPoints[i];
          ctx.lineTo(p.x * calculatedScale, p.y * calculatedScale);
        }

        // Nối lại với điểm đầu tiên nếu đã hoàn thành
        if (!polygon.isDrawing) {
          ctx.lineTo(firstPoint.x * calculatedScale, firstPoint.y * calculatedScale);
        }

        ctx.fill();

        // Vẽ các điểm đã vẽ
        polygon.polygonPoints.forEach((point) => {
          const x = point.x * calculatedScale;
          const y = point.y * calculatedScale;
          ctx.fillStyle = '#FF6B6B';
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, 2 * Math.PI);
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          ctx.stroke();
        });

        // Vẽ các cạnh của đa giác
        if (polygon.polygonPoints.length > 1) {
          ctx.strokeStyle = '#FF6B6B';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          const firstPoint = polygon.polygonPoints[0];
          ctx.moveTo(firstPoint.x * calculatedScale, firstPoint.y * calculatedScale);

          for (let i = 1; i < polygon.polygonPoints.length; i++) {
            const p = polygon.polygonPoints[i];
            ctx.lineTo(p.x * calculatedScale, p.y * calculatedScale);
          }

          // Nếu đã hoàn thành, nối lại với điểm đầu tiên
          if (!polygon.isDrawing) {
            ctx.lineTo(firstPoint.x * calculatedScale, firstPoint.y * calculatedScale);
          }

          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Vẽ đường preview (đang kéo chuột)
        if (polygon.tempLine && polygon.polygonPoints.length > 0) {
          const lastPoint = polygon.polygonPoints[polygon.polygonPoints.length - 1];
          ctx.strokeStyle = '#FFFF00';
          ctx.lineWidth = 2;
          ctx.setLineDash([10, 5]);
          ctx.beginPath();
          ctx.moveTo(lastPoint.x * calculatedScale, lastPoint.y * calculatedScale);
          ctx.lineTo(polygon.tempLine.x * calculatedScale, polygon.tempLine.y * calculatedScale);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // Gửi thông tin số lượng phát hiện được lọc bởi vùng đa giác
      if (isDrawingMode && polygon.polygonPoints.length > 0) {
        onPolygonFilteredCountChange?.(filteredDetectionCount);
        setPolygonFilteredCount(filteredDetectionCount);
        setFilteredDetectionsByClass(classCountsInRegion);
        setFilteredTotalDetections(filteredDetectionCount);
      } else {
        onPolygonFilteredCountChange?.(0); // 0 có nghĩa là không có vùng được vẽ
        setPolygonFilteredCount(0);
        setFilteredDetectionsByClass({});
        setFilteredTotalDetections(0);
      }

      setIsLoading(false);
    };

    img.onerror = () => {
      toast.error('Không thể tải ảnh');
      setIsLoading(false);
    };

    img.src = imageUrl;
  }, [currentDetections, calculateScale, imageUrl, isEditMode, isDrawingMode, objectSize, isDraggingSlider, showLabels, fontSize, circleScale, manualCircleColor, localShowRowlines, polygon.polygonPoints, polygon.tempLine, polygon.isDrawing]);

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

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode || !canvasRef.current) return;

    const p = mapClientToLogicalPoint(e.clientX, e.clientY, canvasRef.current, calculateScale());
    const point: PolygonPoint = { x: p.x, y: p.y };

    // Nếu đang kéo một điểm
    if (polygon.draggingPointIndex !== null && !polygon.isDrawing) {
      polygon.updatePoint(polygon.draggingPointIndex, point);
      drawDetections();
      return;
    }

    // Nếu đang vẽ
    if (polygon.isDrawing) {
      polygon.setCurrentLine(point);
      drawDetections();
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode || !canvasRef.current) return;

    const p = mapClientToLogicalPoint(e.clientX, e.clientY, canvasRef.current, calculateScale());
    const point: PolygonPoint = { x: p.x, y: p.y };

    // Kiểm tra xem có click vào một điểm hiện có không (để kéo chỉnh sửa)
    const pointRadius = 50;
    for (let i = 0; i < polygon.polygonPoints.length; i++) {
      const existingPoint = polygon.polygonPoints[i];
      const dist = Math.hypot(point.x - existingPoint.x, point.y - existingPoint.y);

      if (dist < pointRadius) {
        polygon.setDraggingPointIndex(i);
        return;
      }
    }

    // Chỉ cho phép thêm điểm trên cạnh nếu đang trong quá trình vẽ hoặc đã hoàn tất
    // (cạnh chỉ có thể được click nếu đa giác đã tồn tại)
    const edgeInfo = polygon.findClosestPointOnEdge(point, 15);
    if (edgeInfo) {
      // Thêm điểm mới trên cạnh
      polygon.insertPoint(edgeInfo.closestPoint, edgeInfo.edgeIndex + 1);
      polygon.setDraggingPointIndex(edgeInfo.edgeIndex + 1);
      drawDetections();
    }
  };

  const handleCanvasMouseUp = () => {
    if (polygon.draggingPointIndex !== null) {
      polygon.setDraggingPointIndex(null);
      drawDetections();
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Nếu đang vẽ đa giác
    if (isDrawingMode && canvasRef.current) {
      const p = mapClientToLogicalPoint(e.clientX, e.clientY, canvasRef.current, calculateScale());
      const point: PolygonPoint = { x: p.x, y: p.y };

      if (!polygon.isDrawing && polygon.polygonPoints.length > 0) {
        // Đã hoàn thành vẽ - chỉ cho phép chỉnh sửa (không thêm điểm bên ngoài)
        // Kiểm tra xem có click vào một điểm hiện có không
        const pointRadius = 15;
        for (let i = 0; i < polygon.polygonPoints.length; i++) {
          const existingPoint = polygon.polygonPoints[i];
          const dist = Math.hypot(point.x - existingPoint.x, point.y - existingPoint.y);

          if (dist < pointRadius) {
            // Click vào một điểm hiện có, chỉ cho phép chỉnh sửa
            // (logic này được xử lý trong handleCanvasMouseDown)
            return;
          }
        }

        // Kiểm tra xem có click vào một cạnh không
        const edgeInfo = polygon.findClosestPointOnEdge(point, 15);
        if (edgeInfo) {
          // Click vào một cạnh, chỉ cho phép thêm điểm trên cạnh
          // (logic này được xử lý trong handleCanvasMouseDown)
          return;
        }

        // Click bên ngoài vùng - không làm gì
        return;
      } else if (polygon.isDrawing || polygon.polygonPoints.length === 0) {
        // Đang vẽ hoặc chưa vẽ gì - thêm điểm tiếp theo hoặc kết thúc vẽ
        
        if (!polygon.isDrawing) {
          // Bắt đầu vẽ - click lần đầu tiên
          polygon.setIsDrawing(true);
          polygon.addPoint(point);
        } else {
          // Thêm điểm tiếp theo hoặc kết thúc vẽ nếu click vào điểm đầu tiên
          
          // Kiểm tra xem có click vào một điểm hiện có không (với radius 10 pixels)
          const clickRadius = 10;
          let clickedExistingPoint = false;
          
          for (let i = 0; i < polygon.polygonPoints.length; i++) {
            const existingPoint = polygon.polygonPoints[i];
            const dist = Math.hypot(point.x - existingPoint.x, point.y - existingPoint.y);
            
            // Nếu click quá gần điểm đầu tiên và có ≥3 điểm, kết thúc vẽ
            if (i === 0 && dist < clickRadius && polygon.polygonPoints.length >= 3) {
              polygon.finishPolygon();
              clickedExistingPoint = true;
              toast.success('Đã hoàn thành vùng đếm');
              break;
            }
          }
          
          if (!clickedExistingPoint) {
            // Kiểm tra khoảng cách với điểm cuối cùng để tránh click trùng
            const lastPoint = polygon.polygonPoints[polygon.polygonPoints.length - 1];
            const distance = Math.hypot(point.x - lastPoint.x, point.y - lastPoint.y);
            
            if (distance > 5) {
              // Nếu khoảng cách > 5 pixels, thêm điểm mới
              polygon.addPoint(point);
            }
          }
        }
      }
      polygon.setCurrentLine(null);
      drawDetections();
      return;
    }

    // Nếu không ở chế độ vẽ, sử dụng logic edit cũ
    if (!isEditMode || !canvasRef.current) return;

    const canvas = canvasRef.current;
    
    // Tính toán tọa độ click chính xác với device pixel ratio
    const p = mapClientToLogicalPoint(e.clientX, e.clientY, canvas, calculateScale());
    const x = p.x; // original image pixel coordinates
    const y = p.y;

    // Kiểm tra xem click có nằm trong vòng tròn nào không
    for (let i = 0; i < currentDetections.length; i++) {
      const detection = currentDetections[i];
      const centerX = detection.center.x; // original image pixel coordinates
      const centerY = detection.center.y;
      const radius = (Math.min(detection.dimensions.width, detection.dimensions.height)) / 2;

      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

      if (distance <= radius) {
        // Click vào vòng tròn -> xóa
        deleteDetection(i);
        return;
      }
    }

    // Không click vào vòng tròn nào -> thêm vật thể mới
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
    // x and y are original image pixel coordinates
    const originalX = x;
    const originalY = y;

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
      {enableEdit ? (
        <CanvasControlBar
          isEditMode={isEditMode}
          isDrawingMode={isDrawingMode}
          canUndo={history.length > 1}
          showLabels={showLabels}
          showRowlines={localShowRowlines}
          onEditModeToggle={() => setIsEditMode(!isEditMode)}
          onDrawingModeToggle={() => setIsDrawingMode(!isDrawingMode)}
          onUndo={handleUndo}
          onLabelsToggle={() => setShowLabels(!showLabels)}
          onRowlinesToggle={() => {
            const newShowRowlines = !localShowRowlines;
            setLocalShowRowlines(newShowRowlines);
            if (onShowRowlinesChange) {
              onShowRowlinesChange(newShowRowlines);
            }
          }}
          sizeControlPanel={
            <SizeControlPanel
              fontSize={fontSize}
              circleScale={circleScale}
              manualCircleColor={manualCircleColor}
              onFontSizeChange={setFontSize}
              onCircleScaleChange={setCircleScale}
              onManualCircleColorChange={setManualCircleColor}
            />
          }
          confidenceFilter={confidenceFilter}
          onReload={onReload}
          isReloading={isReloading}
        />
      ) : (
        <div className="flex gap-2 flex-wrap items-center">
          <SizeControlPanel
            fontSize={fontSize}
            circleScale={circleScale}
            manualCircleColor={manualCircleColor}
            onFontSizeChange={setFontSize}
            onCircleScaleChange={setCircleScale}
            onManualCircleColorChange={setManualCircleColor}
          />
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
      )}

      {isEditMode && (
        <EditModeControls
          objectSize={objectSize}
          maxObjectSize={maxObjectSize}
          isDraggingSlider={isDraggingSlider}
          scale={scale}
          onObjectSizeChange={(value) => {
            setObjectSize(value);
            setHasUserSetSize(true);
          }}
          onDragStart={() => setIsDraggingSlider(true)}
          onDragEnd={() => setIsDraggingSlider(false)}
        />
      )}

      {isDrawingMode && (
        <DrawingModeControls
          isDrawing={polygon.isDrawing}
          pointCount={polygon.polygonPoints.length}
          onFinish={() => {
            polygon.finishPolygon();
            drawDetections();
            toast.success('Đã hoàn thành vùng đếm');
          }}
          onClear={() => {
            polygon.clearPolygon();
            drawDetections();
            toast.success('Đã xóa vùng');
          }}
        />
      )}

      <CanvasDisplay
        canvasRef={canvasRef}
        isEditMode={isEditMode}
        isDrawingMode={isDrawingMode}
        onCanvasClick={handleCanvasClick}
        onCanvasMouseMove={handleCanvasMouseMove}
        onCanvasMouseDown={handleCanvasMouseDown}
        onCanvasMouseUp={handleCanvasMouseUp}
        polygonFilteredCount={polygonFilteredCount}
        totalDetections={polygonFilteredCount > 0 ? filteredTotalDetections : currentDetections.length}
        detectionsByClass={polygonFilteredCount > 0 ? filteredDetectionsByClass : detectionsByClass}
        filteredDetectionsCount={filteredDetectionsCount}
        totalDetectionsCount={totalDetectionsCount}
      />
    </div>
  );
};
