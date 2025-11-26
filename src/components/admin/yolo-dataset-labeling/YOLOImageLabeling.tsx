'use client';

import React, { useRef, useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Button } from "@/components/ui/button";
import { Undo2, Redo2, ZoomIn, ZoomOut, RotateCcw, Wand2, Loader2, Save, CheckCircle2, FileText, Lightbulb, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useBoundingBox, BoundingBox } from '@/hooks/useBoundingBox';
import { yoloService } from '@/services/yolo.service';
import { BoxesList } from './BoxesList';
import { 
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

  const boxesRef = useRef<BoundingBox[]>([]); // Track boxes without triggering redraw
  const activeBoxRef = useRef<BoundingBox | null>(null); // Track active box
  const [baseScale, setBaseScale] = useState(1); // Scale từ fit to container
  const [zoomLevel, setZoomLevel] = useState(1); // Zoom factor (1 = 100%, 1.5 = 150%, etc)
  const [imageLoaded, setImageLoaded] = useState(false);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>(classes[0] || '');
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [showLabelsOnCanvas, setShowLabelsOnCanvas] = useState(false); // Toggle label text on boxes - default hidden
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isMarking, setIsMarking] = useState(false);

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
    isDrawing,
    isMoving,
    undo,
    redo,
    canUndo,
    canRedo,
    deleteActiveBox,
  } = useBoundingBox({
    canvasRef,
    enabled: imageLoaded,
    multipleBoxes: true,
    zoomLevel,
    // Truyền kích thước logical (trước zoom)
    canvasLogicalWidth: originalImage ? originalImage.width * baseScale : 0,
    canvasLogicalHeight: originalImage ? originalImage.height * baseScale : 0,
  });

  // State to track if we've loaded initial boxes
  const [initialBoxesLoaded, setInitialBoxesLoaded] = useState(false);
  const [baseScaleReady, setBaseScaleReady] = useState(false);

  // Sync boxes and activeBox to refs for use in drawCanvas without dependency issues
  useEffect(() => {
    boxesRef.current = boxes;
  }, [boxes]);

  

  useEffect(() => {
    activeBoxRef.current = activeBox;
  }, [activeBox]);
  const [isAutoLabeling, setIsAutoLabeling] = useState(false);
  // Auto-label review states
  const [autoLabelResults, setAutoLabelResults] = useState<Array<any>>([]);
  const [autoReviewIndex, setAutoReviewIndex] = useState<number>(0);
  const [isReviewingAutoLabels, setIsReviewingAutoLabels] = useState(false);
  const [reviewOrigin, setReviewOrigin] = useState<'auto' | 'existing' | null>(null);
  // Ref for autoLabelResults to draw preview boxes without causing effect loops
  const autoLabelResultsRef = useRef<any[]>([]);
  useEffect(() => {
    autoLabelResultsRef.current = autoLabelResults;
  }, [autoLabelResults]);

  // Track which preview boxes have been added to canvas (so we can remove them if unconfirmed)
  const previewAddedIdsRef = useRef<Set<string>>(new Set());
  // Snapshot of boxes before starting auto-label (used to restore on cancel)
  const preAutoLabelBoxesRef = useRef<BoundingBox[] | null>(null);

  const ensurePreviewAdded = useCallback((item: any) => {
    if (!item || !item.id) return;
    if (boxesRef.current.some((b) => b.id === item.id)) return; // already present
    // Add box with preview flag
    const previewBox: BoundingBox = { ...item.canvas, label: item.className, isAutoPreview: true };
    addBox(previewBox);
    previewAddedIdsRef.current.add(item.id);
  }, [addBox]);

  const removePreviewIfPresent = useCallback((item: any) => {
    if (!item || !item.id) return;
    if (previewAddedIdsRef.current.has(item.id)) {
      removeBox(item.id);
      previewAddedIdsRef.current.delete(item.id);
    }
  }, [removeBox]);

  const prunePreviewsExcept = useCallback((keepId?: string | null) => {
    const ids = Array.from(previewAddedIdsRef.current);
    ids.forEach((id) => {
      if (id === keepId) return;
      // If it's still present in boxes, remove it
      if (boxesRef.current.some((b) => b.id === id)) {
        removeBox(id);
      }
      previewAddedIdsRef.current.delete(id);
    });
  }, [removeBox]);
  // Track when user manually selects a box (so we don't override with review focus)
  const userSelectedBoxRef = useRef(false);

  // Sync refs với state - chỉ update ref, không trigger re-render
  useEffect(() => {
    boxesRef.current = boxes;
  }, [boxes]);

  useEffect(() => {
    activeBoxRef.current = activeBox;
  }, [activeBox]);

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
      
      if (Math.abs(baseScale - calculatedScale) > 0.0001) {
        setBaseScale(calculatedScale);
      } else if (!baseScaleReady) {
        setBaseScaleReady(true);
        console.log('BaseScale ready:', calculatedScale);
      }
    }
  }, [originalImage, containerSize, baseScale, baseScaleReady]);

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

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    userSelectedBoxRef.current = true;
    return hookMouseDown(e);
  }, [hookMouseDown]);
  const handleMouseMove = hookMouseMove;
  const handleMouseUp = hookMouseUp;

  // Vẽ canvas - optimized với viewport culling + batch rendering
  const drawCanvas = useCallback(() => {
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

    // Use refs instead of closure to get latest boxes without dependency
    const boxes = boxesRef.current;
    const activeBox = activeBoxRef.current;

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
      isAutoPreview: (box as any).isAutoPreview,
    }));

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
        isAutoPreview: (activeBox as any).isAutoPreview,
      };

      const existsInRender = boxesToRender.some((b: any) => b.id === activeBox.id);
      if (!existsInRender) {
        renderedBoxes = [...boxesToRender, activeScreenBox];
      }
    }

    //  Pattern 2: Batch draw all boxes
    ctx.save();

    // Tách non-active boxes và active box
    const activeBoxIndex = renderedBoxes.findIndex((box: any) => box.id === activeBox?.id);
    const nonActiveBoxes = renderedBoxes.filter((box: any) => box.id !== activeBox?.id);
    const activeBoxToRender = renderedBoxes.find((box: any) => box.id === activeBox?.id);

    // Vẽ non-active boxes trước
    nonActiveBoxes.forEach((box: any) => {
      // Tìm index gốc của box này trong renderedBoxes
      const originalIndex = renderedBoxes.findIndex((b: any) => b.id === box.id);
      const color = box.label ? getColorForClass(box.label) : '#4ECDC4';

      const x1 = box.x;
      const y1 = box.y;
      const width = box.width;
      const height = box.height;

      // Fill (dashed/transparent if preview)
      ctx.fillStyle = box.isAutoPreview ? `${color}22` : `${color}33`;
      ctx.fillRect(x1, y1, width, height);

      // Stroke
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x1, y1, width, height);

      // Label with index
      if (box.label && showLabelsOnCanvas) {
        ctx.fillStyle = color;
        ctx.font = 'bold 14px Arial';
        const indexLabel = `#${originalIndex + 1} ${box.label}`;
        const labelMetrics = ctx.measureText(indexLabel);
        const labelPadding = 6;
        const labelHeight = 20;

        ctx.fillRect(
          x1,
          y1 - labelHeight - labelPadding,
          labelMetrics.width + labelPadding * 2,
          labelHeight + labelPadding
        );

        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(indexLabel, x1 + labelPadding, y1 - labelPadding - 2);
      }
    });

    // Vẽ active box cuối cùng (để nó nổi lên trên)
    if (activeBoxToRender) {
      const box = activeBoxToRender;
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
      ctx.lineWidth = 3;
      ctx.strokeRect(x1, y1, width, height);

      // Label with index - dùng activeBoxIndex từ renderedBoxes gốc
      if (box.label && showLabelsOnCanvas) {
        ctx.fillStyle = color;
        ctx.font = 'bold 14px Arial';
        const indexLabel = `#${activeBoxIndex + 1} ${box.label}`;
        const labelMetrics = ctx.measureText(indexLabel);
        const labelPadding = 6;
        const labelHeight = 20;

        ctx.fillRect(
          x1,
          y1 - labelHeight - labelPadding,
          labelMetrics.width + labelPadding * 2,
          labelHeight + labelPadding
        );

        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(indexLabel, x1 + labelPadding, y1 - labelPadding - 2);
      }

      // Handles (only for active box)
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

    // Draw auto-label preview boxes (if in review mode)
    if (isReviewingAutoLabels && autoLabelResultsRef.current.length > 0) {
      const previewItems = autoLabelResultsRef.current;
      previewItems.forEach((item: any, idx: number) => {
        // Skip if already confirmed in boxes
        if (boxes.some((b) => b.id === item.id)) return;

        const box = item.canvas;
        const x = Math.min(box.startX, box.endX) * zoomLevel;
        const y = Math.min(box.startY, box.endY) * zoomLevel;
        const width = Math.abs(box.endX - box.startX) * zoomLevel;
        const height = Math.abs(box.endY - box.startY) * zoomLevel;

        // Dimmed fill for preview
        ctx.fillStyle = `${getColorForClass(item.className) || '#4ECDC4'}22`;
        ctx.fillRect(x, y, width, height);

        // Dashed stroke for preview
        ctx.save();
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = getColorForClass(item.className) || '#4ECDC4';
        ctx.lineWidth = idx === autoReviewIndex ? 3 : 2;
        ctx.strokeRect(x, y, width, height);
        ctx.restore();

        if (showLabelsOnCanvas) {
          ctx.fillStyle = getColorForClass(item.className) || '#4ECDC4';
          ctx.font = 'bold 14px Arial';
          const indexLabel = `#${idx + 1} ${item.className}`;
          const labelMetrics = ctx.measureText(indexLabel);
          const labelPadding = 6;
          const labelHeight = 20;

          ctx.fillRect(
            x,
            y - labelHeight - labelPadding,
            labelMetrics.width + labelPadding * 2,
            labelHeight + labelPadding
          );
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(indexLabel, x + labelPadding, y - labelPadding - 2);
        }
      });
    }

    ctx.restore();
  }, [originalImage, baseScale, zoomLevel, getColorForClass, showLabelsOnCanvas, isReviewingAutoLabels, autoReviewIndex]);

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
        // Use offsetWidth/offsetHeight to get the full container size
        // including scrollbar, preventing oscillation when scrollbar appears
        setContainerSize({
          width: canvasContainerRef.current.offsetWidth,
          height: canvasContainerRef.current.offsetHeight,
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
  }, [imageLoaded, baseScaleReady, baseScale, zoomLevel, containerSize, showLabelsOnCanvas, autoLabelResults, autoReviewIndex, isReviewingAutoLabels]);

  // Redraw canvas when boxes or activeBox change
  useEffect(() => {
    if (imageLoaded && originalImage) {
      drawCanvas();
    }
  }, [boxes, activeBox, imageLoaded, originalImage, showLabelsOnCanvas, autoLabelResults, autoReviewIndex, isReviewingAutoLabels]);

  useEffect(() => {
    if (activeBox && !activeBox.label && selectedClass) {
      const updatedBox = { ...activeBox, label: selectedClass };
      setActiveBox(updatedBox);
    }
  }, [activeBox, selectedClass]);

  // If user starts drawing/moving/resizing on canvas, treat it as a manual selection
  useEffect(() => {
    if (isDrawing || isMoving) {
      userSelectedBoxRef.current = true;
    }
  }, [isDrawing, isMoving]);

  const isSameBox = useCallback((a: BoundingBox | null | undefined, b: BoundingBox | null | undefined) => {
    if (!a || !b) return false;
    return (
      a.id === b.id &&
      a.startX === b.startX &&
      a.startY === b.startY &&
      a.endX === b.endX &&
      a.endY === b.endY &&
      a.label === b.label
    );
  }, []);

  // When reviewing auto labels, update activeBox to the current review item.
  // Do NOT override if the user manually selected another box (tracked by userSelectedBoxRef).
  useEffect(() => {
    if (!isReviewingAutoLabels) return;
    if (!autoLabelResults || autoLabelResults.length === 0) return;
    const idx = Math.max(0, Math.min(autoReviewIndex, autoLabelResults.length - 1));
    const item = autoLabelResults[idx];
    if (!item) return;
    const found = boxesRef.current.find((b) => b.id === item.id);
    const currentActive = activeBoxRef.current;

    // If user manually selected another box, do not override their selection
    if (userSelectedBoxRef.current) {
      // If user manually selected the current review item, ensure we focus the saved one when available
      if (currentActive && currentActive.id === item.id && found && !isSameBox(currentActive, found)) {
        setActiveBox(found);
      }
      return;
    }

    // Otherwise, set active box to review item (saved box if exists, otherwise preview canvas box)
    // Ensure the current preview box exists in the canvas list and is editable
    ensurePreviewAdded(item);
    prunePreviewsExcept(item.id);

    if (found) {
      if (!isSameBox(currentActive, found)) setActiveBox(found);
    } else {
      const preview = { ...item.canvas, label: item.className };
      if (!isSameBox(currentActive, preview)) setActiveBox(preview);
    }
    // Intentionally only depend on review-specific state to avoid loops from boxes/activeBox changes
  }, [isReviewingAutoLabels, autoLabelResults, autoReviewIndex, isSameBox, setActiveBox]);

  // Helpers to control review flow
  const confirmCurrentAutoLabel = useCallback(() => {
    if (!isReviewingAutoLabels || !autoLabelResults || autoLabelResults.length === 0) return;
    const idx = autoReviewIndex;
    const item = autoLabelResults[idx];
    if (!item) return;
    const toSave = activeBox && activeBox.id === item.id ? { ...activeBox } : { ...item.canvas, label: item.className };
    // If the box already exists (e.g. user resized and mouseup auto-added it), update instead of adding to avoid duplicate ids
    const existing = boxes.find((b) => b.id === item.id);
    if (existing) {
      updateBox(existing.id!, { ...toSave, isAutoPreview: false });
      // Mark as confirmed (no longer preview)
      previewAddedIdsRef.current.delete(item.id);
    } else {
      // Add but mark as confirmed (remove preview flag)
      addBox({ ...toSave, isAutoPreview: false });
    }
    if (idx + 1 < autoLabelResults.length) {
      userSelectedBoxRef.current = false; // move focus to next review item
      setAutoReviewIndex(idx + 1);
      const nextItem = autoLabelResults[idx + 1];
      prunePreviewsExcept(nextItem?.id);
    } else {
      setIsReviewingAutoLabels(false);
      setAutoLabelResults([]);
      setAutoReviewIndex(0);
      setActiveBox(null);
      toast.success('Hoàn tất kiểm tra tự động label');
      // Clear pre-auto snapshot on finish
      preAutoLabelBoxesRef.current = null;
      setReviewOrigin(null);
    }
  }, [isReviewingAutoLabels, autoLabelResults, autoReviewIndex, activeBox, addBox, boxes, updateBox]);

  const skipCurrentAutoLabel = useCallback(() => {
    if (!isReviewingAutoLabels) return;
    const idx = autoReviewIndex;
    const item = autoLabelResults[idx];
    // Always remove preview for current item if it was added
    removePreviewIfPresent(item);
    if (idx + 1 < autoLabelResults.length) {
      userSelectedBoxRef.current = false; // next review item should take control
      setAutoReviewIndex(idx + 1);
      // also prune other previews so only next one remains
      const nextItem = autoLabelResults[idx + 1];
      prunePreviewsExcept(nextItem?.id);
    } else {
      // Final item skipped — end review and cleanup
      setIsReviewingAutoLabels(false);
      setAutoLabelResults([]);
      setAutoReviewIndex(0);
      setActiveBox(null);
      // Remove any remaining preview boxes
      previewAddedIdsRef.current.forEach((id) => {
        const found = boxesRef.current.find((b) => b.id === id);
        if (found && found.isAutoPreview) removeBox(id);
      });
      previewAddedIdsRef.current.clear();
      // Do not restore pre-auto snapshot on skip; only cancel restores snapshot
      toast.success('Hoàn tất kiểm tra tự động label');
    }
  }, [isReviewingAutoLabels, autoLabelResults, autoReviewIndex, removePreviewIfPresent, prunePreviewsExcept]);

  const prevAutoLabel = useCallback(() => {
    if (!isReviewingAutoLabels) return;
    if (autoReviewIndex > 0) {
      userSelectedBoxRef.current = false;
      const nextIndex = autoReviewIndex - 1;
      setAutoReviewIndex((i) => i - 1);
      // ensure preview updated and prune others
      const prevItem = autoLabelResults[nextIndex];
      if (prevItem) {
        ensurePreviewAdded(prevItem);
        prunePreviewsExcept(prevItem.id);
      }
    }
  }, [isReviewingAutoLabels, autoReviewIndex]);

  const cancelAutoLabelReview = useCallback(() => {
    setIsReviewingAutoLabels(false);
    setAutoLabelResults([]);
    setAutoReviewIndex(0);
    setActiveBox(null);
    userSelectedBoxRef.current = false;
    // Remove any preview boxes that were added
    previewAddedIdsRef.current.forEach((id) => {
      // only remove if still exists and is marked preview
      const found = boxesRef.current.find((b) => b.id === id);
      if (found && found.isAutoPreview) removeBox(id);
    });
    previewAddedIdsRef.current.clear();
    // If review originated from auto-label, restore pre-snapshot
    if (reviewOrigin === 'auto' && preAutoLabelBoxesRef.current) {
      // Clear whatever current boxes are now
      clearBoxes();
      // Restore previous boxes
      preAutoLabelBoxesRef.current.forEach((b) => {
        addBox({ ...b, isAutoPreview: false });
      });
      preAutoLabelBoxesRef.current = null;
    }
    setReviewOrigin(null);
    if (reviewOrigin === 'auto') {
      toast('Hủy tự động label — đã phục hồi nhãn trước đó', { duration: 2000 });
    } else {
      toast('Hủy chế độ kiểm tra', { duration: 2000 });
    }
  }, [setActiveBox, addBox, removeBox, clearBoxes, reviewOrigin]);

  // Handle user manual selection from BoxesList — mark a flag so we don't override by review effect
  const handleSelectBox = useCallback((box: BoundingBox) => {
    userSelectedBoxRef.current = true;
    setActiveBox(box);
  }, [setActiveBox]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && activeBox) {
        e.preventDefault();
        deleteActiveBox();
        toast.success('Đã xóa box');
      }

      // Support Ctrl/Cmd + Z (undo) and Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y (redo)
      const key = e.key?.toLowerCase();
      const mod = e.ctrlKey || e.metaKey; // Ctrl for Windows/Linux, Meta for macOS

      if (mod && key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) {
          const rs = undo();
          toast('Hoàn tác: '+rs?.op.type, { duration: 500 });
        }
      }

      if (mod && ((e.shiftKey && key === 'z') || key === 'y')) {
        e.preventDefault();
        if (canRedo) {
          const rs = redo();
          toast('Làm lại: '+rs?.op.type, { duration: 500 });
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

      // Snapshot existing boxes before auto-label run so we can restore on cancel
      preAutoLabelBoxesRef.current = boxesRef.current.map((b) => ({ ...b }));
      setReviewOrigin('auto');
      // Clear existing boxes and prepare detections for review (do not add yet)
      clearBoxes();

      const results: Array<any> = detections.map((detection: any, index: number) => {
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

        console.log(`Prepared box ${index}:`, { pixel: { x1, y1, x2, y2 }, canvas: box });
        return {
          id: box.id,
          pixel: { x1, y1, x2, y2 },
          canvas: box,
          className: detection.class_name && classes.includes(detection.class_name) ? detection.class_name : (classes.length > 0 ? classes[0] : 'Object'),
        };
      });

      // Save results for step-by-step review
      setAutoLabelResults(results);
      setAutoReviewIndex(0);
      if (results.length > 0) {
        userSelectedBoxRef.current = false; // reset manual selection when starting review
        setIsReviewingAutoLabels(true);
        setAutoReviewIndex(0);
        // Add the first preview box immediately so it's on canvas and in the list
        setTimeout(() => {
          // schedule after setState resolves to avoid sync update conflict
          ensurePreviewAdded(results[0]);
          prunePreviewsExcept(results[0].id);
          setActiveBox({ ...results[0].canvas, label: results[0].className });
        }, 0);
      }
      toast.success(`Phát hiện ${results.length} vật thể — kiểm tra trước khi thêm`) ;
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Lỗi khi tự động label';
      console.error('Auto-label error:', error);
      toast.error(message);
    } finally {
      setIsAutoLabeling(false);
    }
  };

  // Start a review session for current labels (boxes) instead of auto-detection
  const handleReviewExisting = useCallback(() => {
    const currentBoxes = boxesRef.current;
    if (!currentBoxes || currentBoxes.length === 0) {
      toast.error('Không có nhãn nào để duyệt');
      return;
    }

    const results = currentBoxes.map((b: BoundingBox, i: number) => ({
      id: b.id,
      pixel: {
        x1: Math.min(b.startX, b.endX) / baseScale,
        y1: Math.min(b.startY, b.endY) / baseScale,
        x2: Math.max(b.startX, b.endX) / baseScale,
        y2: Math.max(b.startY, b.endY) / baseScale,
      },
      canvas: { ...b },
      className: b.label || '',
    }));

    setAutoLabelResults(results);
    setAutoReviewIndex(0);
    setIsReviewingAutoLabels(true);
    setReviewOrigin('existing');
    preAutoLabelBoxesRef.current = null;
    userSelectedBoxRef.current = false;
    // Focus first box in the list
    const first = results[0];
    if (first) {
      setActiveBox({ ...first.canvas, label: first.className });
    }
  }, [baseScale, setActiveBox]);

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

  const handleDeleteBox = useCallback((boxId: string) => {
    removeBox(boxId);
    toast.success('Đã xóa box');
  }, [removeBox]);

  const handleChangeBoxLabel = useCallback((boxId: string, newLabel: string) => {
    updateBox(boxId, { label: newLabel });
  }, [updateBox]);

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
      toast.success(` Đã đánh dấu hoàn thành với ${labels.length} labels`);
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
                  disabled={isAutoLabeling || !imageLoaded || isReviewingAutoLabels}
                  title="Tự động label bằng AI"
                  className="gap-2"
                >
                  {isAutoLabeling ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4" />
                  )}
                  {isAutoLabeling ? 'Đang phát hiện...' : isReviewingAutoLabels ? `Đang kiểm tra (${autoReviewIndex+1}/${autoLabelResults.length || 0})` : 'Tự động label'}
                </Button>

                {/* Review existing labels button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReviewExisting()}
                  disabled={isReviewingAutoLabels || boxes.length === 0}
                  title="Duyệt nhãn hiện tại"
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Duyệt nhãn
                </Button>

                {/* Cancel review (global) */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={cancelAutoLabelReview}
                  hidden={!isReviewingAutoLabels}
                  title="Hủy kiểm tra"
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Hủy
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
              <span className="text-xs text-muted-foreground flex gap-1 items-center">
                <Lightbulb className="w-4 h-4 shrink-0" />
                Ctrl+Scroll để zoom
              </span>
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
          </div>

          <div style={{ width: '25%' }} className="flex flex-col overflow-hidden">
            {isReviewingAutoLabels && (
              <div className="p-3 rounded-md bg-muted/50 border mb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">Duyệt kết quả</div>
                    <div className="text-xs text-muted-foreground">{`Kết quả: ${autoLabelResults.length} — Đang xem ${autoReviewIndex + 1}/${autoLabelResults.length}`}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={prevAutoLabel} disabled={autoReviewIndex === 0}>Trước</Button>
                  <Button size="sm" variant="outline" onClick={skipCurrentAutoLabel}>Tiếp</Button>
                  <Button size="sm" variant="default" onClick={confirmCurrentAutoLabel}>Xác nhận & Tiếp</Button>
                  <Button size="sm" variant="ghost" onClick={cancelAutoLabelReview}>Hủy</Button>
                </div>
                <div className="mt-3">
                  <Label className="text-sm">Class cho object</Label>
                  <Select value={activeBox?.label || selectedClass} onValueChange={(val) => {
                    userSelectedBoxRef.current = true;
                    if (activeBox) {
                      setActiveBox({ ...activeBox, label: val });
                      // If preview exists in boxes, update it as well
                      if (activeBox.id && boxes.some((b) => b.id === activeBox.id)) {
                        updateBox(activeBox.id, { label: val });
                      }
                    }
                  }}>
                    <SelectTrigger className="w-full max-w-xs">
                      <SelectValue placeholder="Chọn class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls} value={cls}>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: getColorForClass(cls) }} />
                            {cls}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <BoxesList 
              boxes={boxes}
              activeBox={activeBox}
              classes={classes}
              onSelectBox={handleSelectBox}
              onDeleteBox={handleDeleteBox}
              onChangeBoxLabel={handleChangeBoxLabel}
              getColorForClass={getColorForClass}
            />
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
             {disabled ? 'Đang lưu...' : 'Lưu'} ({boxes.length})
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
