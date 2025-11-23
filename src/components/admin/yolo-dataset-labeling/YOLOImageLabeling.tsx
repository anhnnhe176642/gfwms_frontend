'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Undo2, Redo2, ZoomIn, ZoomOut, RotateCcw, Wand2, Loader2, Save, CheckCircle2, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useBoundingBox, BoundingBox } from '@/hooks/useBoundingBox';
import { useCanvasOptimization } from '@/hooks/useCanvasOptimization';
import { yoloService } from '@/services/yolo.service';
import { 
  boundingBoxToYOLO,
  isValidBoundingBox,
  normalizeBoundingBox,
} from '@/lib/canvasHelpers';

interface YOLOImageLabelingProps {
  imageSrc: string;
  classes: string[];
  /**
   * Existing labels in pixel format
   * Array of: {classId, className, x, y, width, height}
   * x, y = top-left corner in pixels; width, height = dimensions in pixels
   */
  existingLabels?: Array<{
    classId: number;
    className: string;
    x: number;  // x1 pixel coordinate (top-left corner)
    y: number;  // y1 pixel coordinate (top-left corner)
    width: number;   // width in pixels
    height: number;  // height in pixels
  }>;
  /**
   * Callback when labels are saved
   * Labels are in pixel format
   * Array of: {classId, className, x, y, width, height}
   * x, y = top-left corner in pixels; width, height = dimensions in pixels
   */
  onSave: (labels: Array<{
    classId: number;
    className: string;
    x: number;  // x1 pixel coordinate (top-left corner)
    y: number;  // y1 pixel coordinate (top-left corner)
    width: number;   // width in pixels
    height: number;  // height in pixels
  }>, status?: 'draft' | 'completed') => void;
  onCancel: () => void;
  disabled?: boolean;
}

export const YOLOImageLabeling: React.FC<YOLOImageLabelingProps> = ({
  imageSrc,
  classes,
  existingLabels = [],
  onSave,
  onCancel,
  disabled = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const rafRef = useRef<number | null>(null); // Request Animation Frame reference
  const [baseScale, setBaseScale] = useState(1); // Scale từ fit to container
  const [zoomLevel, setZoomLevel] = useState(1); // Zoom factor (1 = 100%, 1.5 = 150%, etc)
  const [imageLoaded, setImageLoaded] = useState(false);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>(classes[0] || '');
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [showOptimizationStats, setShowOptimizationStats] = useState(false); // Debug mode
  const [showLabelsOnCanvas, setShowLabelsOnCanvas] = useState(false); // Toggle label text on boxes - default hidden
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isMarking, setIsMarking] = useState(false);

  //  NEW: Initialize canvas optimization (Pattern 1-5 from Label Studio)
  const optimization = useCanvasOptimization(canvasRef, imageRef, {
    fps: 60,
    enableOffscreen: true,
    enableViewportCulling: true,
    viewportPadding: 50,
  });

  // Scale cuối cùng = baseScale * zoomLevel
  const scale = baseScale * zoomLevel;

  // Màu sắc cho từng class - memoized
  const classColors = React.useMemo(() => [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
  ], []);

  const getColorForClass = useCallback((className: string) => {
    const index = classes.indexOf(className);
    return index >= 0 ? classColors[index % classColors.length] : '#4ECDC4';
  }, [classes, classColors]);

  // Sử dụng hook useBoundingBox
  const {
    boxes,
    activeBox,
    handleMouseDown: hookMouseDown,
    handleMouseMove: hookMouseMove,
    handleMouseUp: hookMouseUp,
    removeBox,
    clearBoxes,
    setActiveBox,
    updateBox,
    addBox,
    undo,
    redo,
    canUndo,
    canRedo,
    deleteActiveBox,
  } = useBoundingBox({
    canvasRef,
    enabled: imageLoaded,
    multipleBoxes: true,
    scale: baseScale, // Logical scale (zoom handled separately in mouse calcs)
    zoomLevel,
    // Truyền kích thước logical (trước zoom)
    canvasLogicalWidth: originalImage ? originalImage.width * baseScale : 0,
    canvasLogicalHeight: originalImage ? originalImage.height * baseScale : 0,
  });

  // State to track if we've loaded initial boxes
  const [initialBoxesLoaded, setInitialBoxesLoaded] = useState(false);
  const [baseScaleReady, setBaseScaleReady] = useState(false);
  const [isAutoLabeling, setIsAutoLabeling] = useState(false);

  // Reset initialBoxesLoaded when existingLabels changes (e.g., loading a new image)
  useEffect(() => {
    if (existingLabels !== undefined && existingLabels.length > 0) {
      console.log('existingLabels changed, resetting initialBoxesLoaded');
      setInitialBoxesLoaded(false);
      setBaseScaleReady(false);
    }
  }, [existingLabels]);

  // Calculate and stabilize baseScale first
  useEffect(() => {
    if (originalImage && containerSize.width > 0 && containerSize.height > 0) {
      const maxDisplayWidth = containerSize.width;
      const maxDisplayHeight = containerSize.height;
      const widthRatio = maxDisplayWidth / originalImage.width;
      const heightRatio = maxDisplayHeight / originalImage.height;
      const calculatedScale = Math.min(widthRatio, heightRatio, 1);
      
      if (baseScale !== calculatedScale) {
        // baseScale changed - rescale all boxes to match new scale
        // Boxes stored as pixel * baseScale, need to adjust them
        if (boxes.length > 0 && baseScale > 0) {
          // Convert boxes from old scale back to pixel coords, then apply new scale
          const oldScale = baseScale;
          const rescaledBoxes = boxes.map(box => ({
            ...box,
            startX: (box.startX / oldScale) * calculatedScale,
            startY: (box.startY / oldScale) * calculatedScale,
            endX: (box.endX / oldScale) * calculatedScale,
            endY: (box.endY / oldScale) * calculatedScale,
          }));
          // Update all boxes with new scale
          rescaledBoxes.forEach(box => {
            if (box.id) {
              updateBox(box.id, box);
            }
          });
        }
        setBaseScale(calculatedScale);
      } else if (!baseScaleReady) {
        setBaseScaleReady(true);
        console.log('BaseScale ready:', calculatedScale);
      }
    }
  }, [originalImage, containerSize, baseScale, baseScaleReady, boxes, updateBox]);

  // Load existing labels AFTER baseScale is ready
  useEffect(() => {
    if (existingLabels && existingLabels.length > 0 && originalImage && baseScale > 0 && baseScaleReady && !initialBoxesLoaded) {
      console.log('Loading existing labels:', existingLabels.length);
      console.log('BaseScale for loading:', baseScale);
      console.log('Image dimensions:', { width: originalImage.width, height: originalImage.height });
      console.log('ContainerSize:', containerSize);
      
      // Clear any existing boxes first
      clearBoxes();
      
      // Convert existing labels from pixel coordinates to canvas display coordinates
      // Annotations (pixel format) - Source of truth
      // Array of: {classId, className, x, y, width, height}
      // x, y = top-left corner in pixels; width, height = dimensions in pixels
      const loadedBoxes = existingLabels.map((label, index) => {
        // existingLabels are in original image pixel coordinates
        // Need to scale them to match the canvas display coordinates
        const box = {
          id: `existing-${index}-${Date.now()}`,
          startX: label.x * baseScale,
          startY: label.y * baseScale,
          endX: (label.x + label.width) * baseScale,
          endY: (label.y + label.height) * baseScale,
          label: label.className || (label.classId < classes.length ? classes[label.classId] : classes[0]),
        };
        console.log(`Loading box ${index}:`, {
          pixel: { x: label.x, y: label.y, w: label.width, h: label.height },
          canvas: { startX: box.startX, startY: box.startY, endX: box.endX, endY: box.endY },
          baseScale,
        });
        return box;
      });
      
      // Add boxes to the state via the hook's addBox function
      loadedBoxes.forEach((box) => {
        addBox(box);
      });
      
      setInitialBoxesLoaded(true);
      toast.success(`Đã tải ${loadedBoxes.length} labels có sẵn`);
    }
  }, [existingLabels, classes, originalImage, baseScale, baseScaleReady, initialBoxesLoaded, clearBoxes, addBox]);

  // Monitor baseScale changes
  useEffect(() => {
    console.log('⚠️ baseScale changed:', baseScale, 'initialBoxesLoaded:', initialBoxesLoaded);
  }, [baseScale, initialBoxesLoaded]);

  const handleMouseDown = hookMouseDown;
  const handleMouseMove = hookMouseMove;
  const handleMouseUp = hookMouseUp;

  // Vẽ canvas - optimized với viewport culling + batch rendering
  const drawCanvas = useCallback(() => {
    // Cancel any pending RAF
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas || !originalImage || baseScale === 0) return;

      // Canvas size = baseScale * zoomLevel
      // Zoom baked into canvas resolution
      const displayWidth = originalImage.width * baseScale * zoomLevel;
      const displayHeight = originalImage.height * baseScale * zoomLevel;

      canvas.width = displayWidth;
      canvas.height = displayHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Prepare boxes for rendering (NO culling for accuracy)
      // Viewport culling có thể gây lệch khi zoom lớn, disable để đảm bảo tính đúng
      const boxesToRender = boxes.map((box) => ({
        id: box.id,
        x: Math.min(box.startX, box.endX) * zoomLevel,
        y: Math.min(box.startY, box.endY) * zoomLevel,
        width: Math.abs(box.endX - box.startX) * zoomLevel,
        height: Math.abs(box.endY - box.startY) * zoomLevel,
        label: box.label,
        startX: box.startX,
        startY: box.startY,
        endX: box.endX,
        endY: box.endY,
      }));

      console.log('Drawing canvas with boxes:', boxes.length, 'boxesToRender:', boxesToRender);

      // Clear canvas
      ctx.clearRect(0, 0, displayWidth, displayHeight);

      // Draw image with zoom
      ctx.drawImage(originalImage, 0, 0, displayWidth, displayHeight);

      // Merge active box with visible boxes for rendering
      let renderedBoxes = boxesToRender;
      if (activeBox) {
        const activeScreenBox = {
          id: activeBox.id,
          x: Math.min(activeBox.startX, activeBox.endX) * zoomLevel,
          y: Math.min(activeBox.startY, activeBox.endY) * zoomLevel,
          width: Math.abs(activeBox.endX - activeBox.startX) * zoomLevel,
          height: Math.abs(activeBox.endY - activeBox.startY) * zoomLevel,
          label: activeBox.label,
          startX: activeBox.startX,
          startY: activeBox.startY,
          endX: activeBox.endX,
          endY: activeBox.endY,
        };

        const existsInRender = boxesToRender.some((b: any) => b.id === activeBox.id);
        if (!existsInRender) {
          renderedBoxes = [...boxesToRender, activeScreenBox];
        }
      }

      //  Pattern 2: Batch draw all boxes
      ctx.save();

      renderedBoxes.forEach((box: any) => {
        const isActive = box.id === activeBox?.id;
        const color = box.label ? getColorForClass(box.label) : '#4ECDC4';

        const x1 = box.x;
        const y1 = box.y;
        const width = box.width;
        const height = box.height;

        // Fill
        ctx.fillStyle = `${color}33`;
        ctx.fillRect(x1, y1, width, height);

        // Stroke
        ctx.strokeStyle = color;
        ctx.lineWidth = isActive ? 3 : 2;
        ctx.strokeRect(x1, y1, width, height);

        // Label
        if (box.label && showLabelsOnCanvas) {
          ctx.fillStyle = color;
          ctx.font = 'bold 14px Arial';
          const labelMetrics = ctx.measureText(box.label);
          const labelPadding = 6;
          const labelHeight = 20;

          ctx.fillRect(
            x1,
            y1 - labelHeight - labelPadding,
            labelMetrics.width + labelPadding * 2,
            labelHeight + labelPadding
          );

          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(box.label, x1 + labelPadding, y1 - labelPadding - 2);
        }

        // Handles (only for active box)
        if (isActive) {
          ctx.fillStyle = color;
          const handleSize = 8;
          const edgeSize = 6;

          // Draw corner handles
          const halfHandle = handleSize / 2;
          ctx.fillRect(x1 - halfHandle, y1 - halfHandle, handleSize, handleSize);
          ctx.fillRect(x1 + width - halfHandle, y1 - halfHandle, handleSize, handleSize);
          ctx.fillRect(x1 - halfHandle, y1 + height - halfHandle, handleSize, handleSize);
          ctx.fillRect(
            x1 + width - halfHandle,
            y1 + height - halfHandle,
            handleSize,
            handleSize
          );

          // Draw edge handles
          const halfEdge = edgeSize / 2;
          ctx.fillRect(x1 + width / 2 - halfEdge, y1 - halfEdge, edgeSize, edgeSize);
          ctx.fillRect(x1 + width / 2 - halfEdge, y1 + height - halfEdge, edgeSize, edgeSize);
          ctx.fillRect(x1 - halfEdge, y1 + height / 2 - halfEdge, edgeSize, edgeSize);
          ctx.fillRect(x1 + width - halfEdge, y1 + height / 2 - halfEdge, edgeSize, edgeSize);
        }
      });

      ctx.restore();

      //  Debug: Show optimization stats if enabled
      if (showOptimizationStats) {
        const stats = optimization.getStats();
        if (stats) {
          ctx.fillStyle = '#00FF00';
          ctx.font = '12px monospace';
          ctx.fillText(`Visible: ${stats.visibleBoxes}/${stats.totalBoxes}`, 10, 20);
          ctx.fillText(`Speedup: ${stats.estimatedSpeedup.toFixed(2)}x`, 10, 35);
          ctx.fillText(`Optimized: ${(stats.optimizationRatio * 100).toFixed(0)}%`, 10, 50);
        }
      }

      // Do NOT call drawCanvas() here - let React re-render trigger it
      // This prevents infinite loop and ensures baseScale stabilizes
    });
  }, [originalImage, baseScale, zoomLevel, boxes, activeBox, optimization, getColorForClass, showOptimizationStats, showLabelsOnCanvas]);

  // Zoom handlers
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.2, 3)); // Max 300%
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 0.5)); // Min 50%
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      // Chỉ zoom khi Ctrl được ấn
      if (!e.ctrlKey) return;
      
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1; // Scroll down = zoom out, up = zoom in
      setZoomLevel((prev) => Math.min(Math.max(prev + delta, 0.5), 3));
    },
    []
  );

  // Pan support (kéo để move khi zoom > 100%)
  const handleMouseDownOnContainer = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (zoomLevel <= 1) return; // Chỉ pan khi zoom > 100%
      
      // Nếu click vào canvas, để canvas xử lý
      if (e.target === canvasRef.current) return;
      
      const container = canvasContainerRef.current;
      if (!container) return;

      const startX = e.clientX;
      const startY = e.clientY;
      const scrollLeft = container.scrollLeft;
      const scrollTop = container.scrollTop;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        container.scrollLeft = scrollLeft - dx;
        container.scrollTop = scrollTop - dy;
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [zoomLevel]
  );

  useEffect(() => {
    const updateSize = () => {
      if (canvasContainerRef.current) {
        setContainerSize({
          width: canvasContainerRef.current.clientWidth,
          height: canvasContainerRef.current.clientHeight,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    const resizeObserver = new ResizeObserver(updateSize);
    if (canvasContainerRef.current) {
      resizeObserver.observe(canvasContainerRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateSize);
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setOriginalImage(img);
      setImageLoaded(true);
    };
    img.onerror = () => {
      toast.error('Không thể tải ảnh');
    };
    img.src = imageSrc;
  }, [imageSrc]);

  useEffect(() => {
    if (imageLoaded && baseScaleReady) {
      drawCanvas();
    }
    
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [imageLoaded, baseScaleReady, drawCanvas, containerSize]);

  useEffect(() => {
    if (activeBox && !activeBox.label && selectedClass) {
      const updatedBox = { ...activeBox, label: selectedClass };
      setActiveBox(updatedBox);
    }
  }, [activeBox, selectedClass]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && activeBox) {
        e.preventDefault();
        deleteActiveBox();
        toast.success('Đã xóa box');
      }

      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) {
          undo();
          toast.info('Undo');
        }
      }

      if ((e.ctrlKey && e.shiftKey && e.key === 'z') || (e.ctrlKey && e.key === 'y')) {
        e.preventDefault();
        if (canRedo) {
          redo();
          toast.info('Redo');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeBox, deleteActiveBox, undo, redo, canUndo, canRedo]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  /**
   * Tự động label bằng cách gọi YOLO detect API
   */
  const handleAutoLabel = async () => {
    if (!originalImage || !imageSrc) {
      toast.error('Vui lòng tải ảnh trước');
      return;
    }

    setIsAutoLabeling(true);
    try {
      // Fetch image as blob
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      const file = new File([blob], 'image.jpg', { type: blob.type });

      // Call YOLO detect API
      console.log('Calling YOLO detect API...');
      const result = await yoloService.detect({
        image: file,
        confidence: 0.3,
      });

      if (!result.success || !result.data.detections) {
        toast.error('Không thể phát hiện vật thể');
        return;
      }

      const detections = result.data.detections;
      console.log('Detections received:', detections);

      // Clear existing boxes
      clearBoxes();

      // Convert detections to boxes and add to canvas
      const addedBoxes: BoundingBox[] = [];
      
      detections.forEach((detection, index) => {
        // Detection format from API has bbox: {x1, y1, x2, y2} in PIXEL coordinates (not normalized!)
        // API returns actual pixel coordinates matching the image dimensions
        const x1 = detection.bbox.x1;
        const y1 = detection.bbox.y1;
        const x2 = detection.bbox.x2;
        const y2 = detection.bbox.y2;

        // Convert pixel coordinates to canvas coordinates (scale by baseScale)
        const box: BoundingBox = {
          id: `auto-label-${index}-${Date.now()}`,
          startX: x1 * baseScale,
          startY: y1 * baseScale,
          endX: x2 * baseScale,
          endY: y2 * baseScale,
          // Use detected class name if it exists in our classes list, otherwise use first class
          label: detection.class_name && classes.includes(detection.class_name) 
            ? detection.class_name 
            : (classes.length > 0 ? classes[0] : 'Object'),
        };

        addBox(box);
        addedBoxes.push(box);
        console.log(`Box ${index}:`, { pixel: { x1, y1, x2, y2 }, canvas: box });
      });

      toast.success(`Phát hiện và tự động label ${addedBoxes.length} vật thể`);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Lỗi khi tự động label';
      console.error('Auto-label error:', error);
      toast.error(message);
    } finally {
      setIsAutoLabeling(false);
    }
  };

  const handleSave = () => {
    if (!originalImage) return;

    const validBoxes = boxes.filter((box) => isValidBoundingBox(box, 10));

    if (validBoxes.length === 0) {
      toast.error('Vui lòng vẽ ít nhất một bounding box');
      return;
    }

    // Convert boxes from canvas coordinates to PIXEL coordinates
    // Annotations (pixel format) - Source of truth
    // Array of: {class_id, class_name, x1, y1, x2, y2, confidence}
    // x1, y1 = top-left corner; x2, y2 = bottom-right corner (pixel coordinates)
    // Format must match what saveImageAnnotations expects: classId, className, x, y, width, height in pixels
    const labels = validBoxes.map((box) => {
      // Boxes are in canvas display coordinates (scaled by baseScale)
      // Convert back to original image pixel coordinates
      const pixelBox = {
        startX: box.startX / baseScale,
        startY: box.startY / baseScale,
        endX: box.endX / baseScale,
        endY: box.endY / baseScale,
      };

      // Normalize to get startX, startY (top-left corner in pixels)
      const normalized = normalizeBoundingBox(pixelBox);
      const width = Math.abs(normalized.endX - normalized.startX);
      const height = Math.abs(normalized.endY - normalized.startY);

      const classId = classes.indexOf(box.label || '');

      // Return pixel coordinates (x, y, width, height in original image pixels)
      // This will be converted to x1, y1, x2, y2 in saveImageAnnotations
      return {
        classId,
        className: box.label || '',
        x: normalized.startX,  // x1 pixel coordinate (top-left corner)
        y: normalized.startY,  // y1 pixel coordinate (top-left corner)
        width: width,           // width in pixels
        height: height,         // height in pixels
      };
    });

    onSave(labels, 'completed');
    toast.success(`Đã lưu ${labels.length} labels`);
  };

  const handleDeleteBox = (boxId: string) => {
    removeBox(boxId);
    toast.success('Đã xóa box');
  };

  const handleChangeBoxLabel = (boxId: string, newLabel: string) => {
    updateBox(boxId, { label: newLabel });
  };

  const handleSaveDraft = async () => {
    if (!originalImage) return;

    const validBoxes = boxes.filter((box) => isValidBoundingBox(box, 10));

    const labels = validBoxes.map((box) => {
      const pixelBox = {
        startX: box.startX / baseScale,
        startY: box.startY / baseScale,
        endX: box.endX / baseScale,
        endY: box.endY / baseScale,
      };

      const normalized = normalizeBoundingBox(pixelBox);
      const width = Math.abs(normalized.endX - normalized.startX);
      const height = Math.abs(normalized.endY - normalized.startY);
      const classId = classes.indexOf(box.label || '');

      return {
        classId,
        className: box.label || '',
        x: normalized.startX,
        y: normalized.startY,
        width: width,
        height: height,
      };
    });

    setIsSavingDraft(true);
    try {
      onSave(labels, 'draft');
      toast.success(`Đã lưu nháp ${labels.length} labels`);
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!originalImage) return;

    const validBoxes = boxes.filter((box) => isValidBoundingBox(box, 10));

    if (validBoxes.length === 0) {
      toast.error('Vui lòng vẽ ít nhất một bounding box');
      return;
    }

    const labels = validBoxes.map((box) => {
      const pixelBox = {
        startX: box.startX / baseScale,
        startY: box.startY / baseScale,
        endX: box.endX / baseScale,
        endY: box.endY / baseScale,
      };

      const normalized = normalizeBoundingBox(pixelBox);
      const width = Math.abs(normalized.endX - normalized.startX);
      const height = Math.abs(normalized.endY - normalized.startY);
      const classId = classes.indexOf(box.label || '');

      return {
        classId,
        className: box.label || '',
        x: normalized.startX,
        y: normalized.startY,
        width: width,
        height: height,
      };
    });

    setIsMarking(true);
    try {
      onSave(labels, 'completed');
      toast.success(`✅ Đã đánh dấu hoàn thành với ${labels.length} labels`);
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gán nhãn YOLO</CardTitle>
            <CardDescription>
              Vẽ bounding boxes xung quanh các đối tượng trong ảnh và gán class label.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Label htmlFor="class-select" className="min-w-fit">
            Class hiện tại:
          </Label>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger id="class-select" className="w-full max-w-xs">
              <SelectValue placeholder="Chọn class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls} value={cls}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: getColorForClass(cls) }}
                    />
                    {cls}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            Boxes mới sẽ được gán class này
          </span>
        </div>

        <div className="bg-muted/50 p-3 rounded-md">
          <Label className="text-sm font-semibold mb-2 block">Màu sắc classes:</Label>
          <div className="flex flex-wrap gap-3">
            {classes.map((cls) => (
              <div key={cls} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: getColorForClass(cls), borderColor: getColorForClass(cls) }}
                />
                <span className="text-sm">{cls}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 h-screen max-h-screen">
          <div style={{ width: '75%' }} className="flex flex-col">
            {/* Zoom controls */}
            <div className="flex items-center justify-between bg-muted/50 p-3 rounded-t-md border-b">
              <div className="flex items-center gap-2">
                {/* Undo/Redo */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={undo}
                  disabled={!canUndo}
                  title="Undo (Ctrl+Z)"
                >
                  <Undo2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={redo}
                  disabled={!canRedo}
                  title="Redo (Ctrl+Shift+Z)"
                >
                  <Redo2 className="h-4 w-4" />
                </Button>

                {/* Separator */}
                <div className="w-px h-6 bg-border" />

                {/* Auto-label button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAutoLabel}
                  disabled={isAutoLabeling || !imageLoaded}
                  title="Tự động label bằng AI"
                  className="gap-2"
                >
                  {isAutoLabeling ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4" />
                  )}
                  {isAutoLabeling ? 'Đang phát hiện...' : 'Tự động label'}
                </Button>

                {/* Separator */}
                <div className="w-px h-6 bg-border" />

                {/* Toggle labels visibility */}
                <Button
                  variant={showLabelsOnCanvas ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowLabelsOnCanvas(!showLabelsOnCanvas)}
                  title="Ẩn/hiện tên class trên box"
                  className="gap-2"
                >
                  {showLabelsOnCanvas ? 'Ẩn label' : 'Hiện label'}
                </Button>

                {/* Separator */}
                <div className="w-px h-6 bg-border" />

                {/* Zoom controls */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 0.5}
                  title="Zoom out (Ctrl+Scroll Down)"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium w-16 text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 3}
                  title="Zoom in (Ctrl+Scroll Up)"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetZoom}
                  title="Reset zoom"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-xs text-muted-foreground">💡 Ctrl+Scroll để zoom</span>
            </div>

            <div
              ref={canvasContainerRef}
              className="flex-1 bg-muted/20 overflow-auto cursor-grab active:cursor-grabbing"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                padding: '20px',
              }}
              onMouseDown={handleMouseDownOnContainer}
            >
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className="border-2 border-dashed border-primary rounded-md cursor-crosshair"
              />
            </div>

            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md mt-4">
              💡 <strong>Hướng dẫn:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Chọn class label trước khi vẽ box</li>
                <li>Kéo chuột để vẽ bounding box xung quanh đối tượng</li>
                <li>Click vào box để chọn, kéo cạnh/góc để resize, kéo bên trong để di chuyển</li>
                <li>Nhấn Delete để xóa, Ctrl+Z để undo</li>
                <li>Ctrl+Scroll để zoom in/out, hoặc dùng nút +/- trên thanh zoom</li>
                <li>Khi zoom &gt; 100%, kéo trên canvas để pan (di chuyển ảnh)</li>
              </ul>
            </div>
          </div>

          <div style={{ width: '25%' }} className="flex flex-col bg-muted/20 rounded-md p-4 overflow-hidden">
            <div className="mb-3">
              <Label className="text-sm font-semibold">Danh sách boxes ({boxes.length}):</Label>
            </div>

            {boxes.length > 0 ? (
              <div className="flex-1 overflow-y-auto space-y-2">
                {boxes.map((box, index) => {
                  const boxColor = box.label ? getColorForClass(box.label) : '#4ECDC4';
                  const isActive = activeBox?.id === box.id;
                  return (
                    <div
                      key={box.id}
                      onClick={() => setActiveBox(box)}
                      className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                        isActive
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border hover:border-primary/50 hover:bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: boxColor }}
                          />
                          <span className="text-xs font-medium">#{index + 1}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBox(box.id!);
                          }}
                          className="h-5 w-5 p-0 hover:bg-destructive/10"
                        >
                          <span className="text-xs">✕</span>
                        </Button>
                      </div>

                      <Select
                        value={box.label || selectedClass}
                        onValueChange={(value) => handleChangeBoxLabel(box.id!, value)}
                      >
                        <SelectTrigger className="h-7 text-xs bg-background border-border/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((cls) => (
                            <SelectItem key={cls} value={cls}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: getColorForClass(cls) }}
                                />
                                <span className="text-xs">{cls}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="mt-2 text-xs text-muted-foreground space-y-1 border-t border-border/30 pt-2">
                        <div className="flex justify-between">
                          <span>Size:</span>
                          <span className="font-mono text-foreground">
                            {Math.round(Math.abs(box.endX - box.startX))} × {Math.round(Math.abs(box.endY - box.startY))}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pos:</span>
                          <span className="font-mono text-foreground">
                            ({Math.round(Math.min(box.startX, box.endX))}, {Math.round(Math.min(box.startY, box.endY))})
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-muted-foreground text-xs">Chưa có boxes</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel} disabled={disabled}>
            Hủy
          </Button>
          {boxes.length > 0 && (
            <Button variant="outline" onClick={clearBoxes} disabled={disabled}>
              Xóa tất cả
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={handleSaveDraft} 
            disabled={boxes.length === 0 || disabled || isSavingDraft}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            {isSavingDraft ? 'Đang lưu...' : 'Lưu nháp'}
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={boxes.length === 0 || disabled}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            💾 {disabled ? 'Đang lưu...' : 'Lưu'} ({boxes.length})
          </Button>
          <Button 
            variant="default" 
            onClick={handleMarkComplete} 
            disabled={boxes.length === 0 || disabled || isMarking}
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle2 className="h-4 w-4" />
            {isMarking ? 'Đang xử lý...' : 'Hoàn thành'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
