import { BoundingBox } from '@/hooks/useBoundingBox';

/**
 * Canvas Drawing Options - Inspired by Label Studio's rendering approach
 */
export interface DrawBoxOptions {
  strokeColor?: string;
  fillColor?: string;
  lineWidth?: number;
  showHandles?: boolean;
  showLabel?: boolean;
  handleColor?: string;
  handleSize?: number;
  edgeHandleColor?: string;
  edgeHandleSize?: number;
  dimBackground?: boolean;
  showDimensions?: boolean;
  scale?: number;
  usePixelSnapping?: boolean;
  showRotationHandle?: boolean;
  rotation?: number;
}

/**
 * Geometry utilities - Similar to Label Studio's Geometry class
 */
export class GeometryHelper {
  /**
   * Calculate bounding box coordinates from 4 corners (with rotation support)
   * Similar to Label Studio's getRectBBox method
   */
  static getRectBBox(x: number, y: number, width: number, height: number, angle: number = 0) {
    if (angle === 0) {
      return { x, y, width, height };
    }

    const rad = (angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    // 4 corners of the rectangle
    const corners = [
      { x, y },
      { x: x + width, y },
      { x: x + width, y: y + height },
      { x, y: y + height },
    ];

    // Rotate all corners
    const rotatedCorners = corners.map((point) => ({
      x: point.x * cos - point.y * sin,
      y: point.x * sin + point.y * cos,
    }));

    // Find axis-aligned bounding box
    const xs = rotatedCorners.map((p) => p.x);
    const ys = rotatedCorners.map((p) => p.y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  /**
   * Calculate bounding box from polygon points
   * Similar to Label Studio's getPolygonBBox method
   */
  static getPolygonBBox(points: Array<{ x: number; y: number }>) {
    if (points.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  /**
   * Check if point is inside rectangle
   */
  static isPointInRect(
    px: number,
    py: number,
    x: number,
    y: number,
    width: number,
    height: number,
    threshold: number = 0
  ): boolean {
    return (
      px >= x - threshold &&
      px <= x + width + threshold &&
      py >= y - threshold &&
      py <= y + height + threshold
    );
  }

  /**
   * Check if point is on edge/corner with threshold
   */
  static getPointOnEdge(
    px: number,
    py: number,
    x: number,
    y: number,
    width: number,
    height: number,
    threshold: number = 5
  ): string | null {
    const corners = [
      { id: 'tl', cx: x, cy: y },
      { id: 'tr', cx: x + width, cy: y },
      { id: 'bl', cx: x, cy: y + height },
      { id: 'br', cx: x + width, cy: y + height },
    ];

    // Check corners first (priority)
    for (const corner of corners) {
      if (Math.abs(px - corner.cx) < threshold && Math.abs(py - corner.cy) < threshold) {
        return corner.id;
      }
    }

    // Check edges
    const edges = [
      { id: 'n', cx: x + width / 2, cy: y },
      { id: 's', cx: x + width / 2, cy: y + height },
      { id: 'w', cx: x, cy: y + height / 2 },
      { id: 'e', cx: x + width, cy: y + height / 2 },
    ];

    for (const edge of edges) {
      if (Math.abs(px - edge.cx) < threshold && Math.abs(py - edge.cy) < threshold) {
        return edge.id;
      }
    }

    return null;
  }

  /**
   * Calculate distance between two points
   */
  static distance(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

/**
 * Advanced canvas drawing - Inspired by Label Studio's rendering
 */
export const drawBoundingBox = (
  ctx: CanvasRenderingContext2D,
  box: BoundingBox,
  options: DrawBoxOptions = {}
) => {
  const {
    strokeColor = '#4ECDC4',
    fillColor = 'rgba(78, 205, 196, 0.1)',
    lineWidth = 2,
    showHandles = true,
    showLabel = false,
    handleColor = '#4ECDC4',
    handleSize = 10,
    edgeHandleColor = '#95E1D3',
    edgeHandleSize = 8,
    showDimensions = false,
    scale = 1,
    usePixelSnapping = false,
    showRotationHandle = false,
    rotation = 0,
  } = options;

  // Normalize coordinates (ensure startX < endX, startY < endY)
  const x1 = Math.min(box.startX, box.endX);
  const y1 = Math.min(box.startY, box.endY);
  const width = Math.abs(box.endX - box.startX);
  const height = Math.abs(box.endY - box.startY);

  // Apply pixel snapping if enabled (similar to Label Studio)
  const snappedX1 = usePixelSnapping ? Math.round(x1) : x1;
  const snappedY1 = usePixelSnapping ? Math.round(y1) : y1;
  const snappedWidth = usePixelSnapping ? Math.round(width) : width;
  const snappedHeight = usePixelSnapping ? Math.round(height) : height;

  ctx.save();

  // Draw fill
  if (fillColor && fillColor !== 'rgba(0, 0, 0, 0)') {
    ctx.fillStyle = fillColor;
    ctx.fillRect(snappedX1, snappedY1, snappedWidth, snappedHeight);
  }

  // Draw border
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = lineWidth;
  ctx.strokeRect(snappedX1, snappedY1, snappedWidth, snappedHeight);

  // Draw corner handles
  if (showHandles) {
    const corners = [
      { x: snappedX1, y: snappedY1 }, // top-left
      { x: snappedX1 + snappedWidth, y: snappedY1 }, // top-right
      { x: snappedX1, y: snappedY1 + snappedHeight }, // bottom-left
      { x: snappedX1 + snappedWidth, y: snappedY1 + snappedHeight }, // bottom-right
    ];

    corners.forEach((corner) => {
      ctx.fillStyle = handleColor;
      ctx.fillRect(corner.x - handleSize / 2, corner.y - handleSize / 2, handleSize, handleSize);
    });

    // Draw edge handles
    const edges = [
      { x: snappedX1 + snappedWidth / 2, y: snappedY1 }, // top
      { x: snappedX1 + snappedWidth / 2, y: snappedY1 + snappedHeight }, // bottom
      { x: snappedX1, y: snappedY1 + snappedHeight / 2 }, // left
      { x: snappedX1 + snappedWidth, y: snappedY1 + snappedHeight / 2 }, // right
    ];

    edges.forEach((edge) => {
      ctx.fillStyle = edgeHandleColor;
      ctx.fillRect(edge.x - edgeHandleSize / 2, edge.y - edgeHandleSize / 2, edgeHandleSize, edgeHandleSize);
    });
  }

  // Draw rotation handle (if rotation is supported)
  if (showRotationHandle && rotation !== 0) {
    const centerX = snappedX1 + snappedWidth / 2;
    const centerY = snappedY1 + snappedHeight / 2;
    const rotationHandleDistance = Math.max(snappedWidth, snappedHeight) * 0.6;

    // Rotate point calculation
    const rad = (rotation * Math.PI) / 180;
    const rotateX = centerX + rotationHandleDistance * Math.cos(rad);
    const rotateY = centerY + rotationHandleDistance * Math.sin(rad);

    // Draw line from center to rotation handle
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(rotateX, rotateY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw rotation handle circle
    ctx.fillStyle = handleColor;
    ctx.beginPath();
    ctx.arc(rotateX, rotateY, handleSize / 2, 0, 2 * Math.PI);
    ctx.fill();
  }

  // Draw label
  if (showLabel && box.label) {
    ctx.fillStyle = strokeColor;
    ctx.font = 'bold 14px Arial';
    const labelMetrics = ctx.measureText(box.label);
    const labelPadding = 6;
    const labelHeight = 20;

    // Background for label
    ctx.fillRect(
      snappedX1,
      snappedY1 - labelHeight - labelPadding,
      labelMetrics.width + labelPadding * 2,
      labelHeight + labelPadding
    );

    // Text
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(box.label, snappedX1 + labelPadding, snappedY1 - labelPadding - 2);
  }

  // Draw dimensions
  if (showDimensions) {
    const displayWidth = Math.round(snappedWidth / scale);
    const displayHeight = Math.round(snappedHeight / scale);
    const dimensionText = `${displayWidth}×${displayHeight}px`;

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px Arial';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;

    ctx.strokeText(dimensionText, snappedX1 + 10, snappedY1 + 30);
    ctx.fillText(dimensionText, snappedX1 + 10, snappedY1 + 30);
  }

  ctx.restore();
};

/**
 * Draw multiple bounding boxes with batch optimization
 */
export const drawBoundingBoxes = (
  ctx: CanvasRenderingContext2D,
  boxes: BoundingBox[],
  options: DrawBoxOptions & { activeBoxId?: string } = {}
) => {
  ctx.save();

  const { activeBoxId, ...drawOptions } = options;

  // Batch draw inactive boxes first
  boxes.forEach((box) => {
    if (box.id !== activeBoxId) {
      drawBoundingBox(ctx, box, drawOptions);
    }
  });

  // Draw active box last (on top) with different styling
  const activeBox = boxes.find((box) => box.id === activeBoxId);
  if (activeBox) {
    drawBoundingBox(ctx, activeBox, {
      ...drawOptions,
      strokeColor: drawOptions.strokeColor || '#FF6B6B',
      lineWidth: (drawOptions.lineWidth || 2) + 1,
      showHandles: true, // Always show handles for active box
    });
  }

  ctx.restore();
};

/**
 * Draw darkened overlay outside bounding box (like Label Studio)
 */
export const drawDimOverlay = (
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  box: BoundingBox,
  opacity: number = 0.5
) => {
  const x1 = Math.min(box.startX, box.endX);
  const y1 = Math.min(box.startY, box.endY);
  const width = Math.abs(box.endX - box.startX);
  const height = Math.abs(box.endY - box.startY);

  // Draw darkened overlay
  ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Clear box area
  ctx.clearRect(x1, y1, width, height);
};

/**
 * Normalize bounding box (ensure startX < endX, startY < endY)
 */
export const normalizeBoundingBox = (box: BoundingBox): BoundingBox => {
  return {
    ...box,
    startX: Math.min(box.startX, box.endX),
    startY: Math.min(box.startY, box.endY),
    endX: Math.max(box.startX, box.endX),
    endY: Math.max(box.startY, box.endY),
  };
};

/**
 * Get bounding box size
 */
export const getBoundingBoxSize = (box: BoundingBox) => {
  return {
    width: Math.abs(box.endX - box.startX),
    height: Math.abs(box.endY - box.startY),
  };
};

/**
 * Validate bounding box (min size check)
 */
export const isValidBoundingBox = (box: BoundingBox, minSize: number = 10): boolean => {
  const { width, height } = getBoundingBoxSize(box);
  return width >= minSize && height >= minSize;
};

/**
 * Convert bounding box to YOLO format (normalized coordinates)
 * YOLO format: center_x, center_y, width, height (all normalized 0-1)
 */
export const boundingBoxToYOLO = (
  box: BoundingBox,
  imageWidth: number,
  imageHeight: number
): { x: number; y: number; width: number; height: number } => {
  const normalized = normalizeBoundingBox(box);
  const { width, height } = getBoundingBoxSize(normalized);

  // Center point
  const centerX = (normalized.startX + width / 2) / imageWidth;
  const centerY = (normalized.startY + height / 2) / imageHeight;

  // Normalized width and height
  const normalizedWidth = width / imageWidth;
  const normalizedHeight = height / imageHeight;

  return {
    x: Math.max(0, Math.min(1, centerX)),
    y: Math.max(0, Math.min(1, centerY)),
    width: Math.max(0, Math.min(1, normalizedWidth)),
    height: Math.max(0, Math.min(1, normalizedHeight)),
  };
};

/**
 * Convert from YOLO format to bounding box
 */
export const yoloToBoundingBox = (
  yolo: { x: number; y: number; width: number; height: number },
  imageWidth: number,
  imageHeight: number,
  id?: string,
  label?: string
): BoundingBox => {
  const width = yolo.width * imageWidth;
  const height = yolo.height * imageHeight;
  const centerX = yolo.x * imageWidth;
  const centerY = yolo.y * imageHeight;

  return {
    startX: centerX - width / 2,
    startY: centerY - height / 2,
    endX: centerX + width / 2,
    endY: centerY + height / 2,
    id,
    label,
  };
};

/**
 * Scale bounding box by a factor
 */
export const scaleBoundingBox = (box: BoundingBox, scale: number): BoundingBox => {
  return {
    ...box,
    startX: box.startX * scale,
    startY: box.startY * scale,
    endX: box.endX * scale,
    endY: box.endY * scale,
  };
};

/**
 * Translate bounding box
 */
export const translateBoundingBox = (box: BoundingBox, dx: number, dy: number): BoundingBox => {
  return {
    ...box,
    startX: box.startX + dx,
    startY: box.startY + dy,
    endX: box.endX + dx,
    endY: box.endY + dy,
  };
};

/**
 * Constrain bounding box within canvas bounds
 * Similar to Label Studio's constraint logic
 */
export const constrainBoundingBox = (
  box: BoundingBox,
  canvasWidth: number,
  canvasHeight: number,
  minSize: number = 1
): BoundingBox => {
  const normalized = normalizeBoundingBox(box);
  const { width, height } = getBoundingBoxSize(normalized);

  // Ensure minimum size
  let finalWidth = Math.max(width, minSize);
  let finalHeight = Math.max(height, minSize);

  // Constrain to canvas bounds
  let x1 = Math.max(0, normalized.startX);
  let y1 = Math.max(0, normalized.startY);
  let x2 = Math.min(canvasWidth, normalized.startX + finalWidth);
  let y2 = Math.min(canvasHeight, normalized.startY + finalHeight);

  // If box exceeds bounds, recalculate
  if (x2 - x1 < finalWidth) {
    x2 = Math.min(canvasWidth, x1 + finalWidth);
    if (x2 > canvasWidth) {
      x1 = Math.max(0, canvasWidth - finalWidth);
      x2 = canvasWidth;
    }
  }

  if (y2 - y1 < finalHeight) {
    y2 = Math.min(canvasHeight, y1 + finalHeight);
    if (y2 > canvasHeight) {
      y1 = Math.max(0, canvasHeight - finalHeight);
      y2 = canvasHeight;
    }
  }

  return {
    ...box,
    startX: x1,
    startY: y1,
    endX: x2,
    endY: y2,
  };
};

/**
 * Snap bounding box to grid
 */
export const snapBoundingBoxToGrid = (box: BoundingBox, gridSize: number = 1): BoundingBox => {
  const snap = (val: number) => Math.round(val / gridSize) * gridSize;

  return {
    ...box,
    startX: snap(box.startX),
    startY: snap(box.startY),
    endX: snap(box.endX),
    endY: snap(box.endY),
  };
};

/**
 * Snap bounding box to pixel boundaries
 * Similar to Label Studio's pixel snapping feature
 */
export const snapBoundingBoxToPixel = (box: BoundingBox): BoundingBox => {
  return {
    ...box,
    startX: Math.round(box.startX),
    startY: Math.round(box.startY),
    endX: Math.round(box.endX),
    endY: Math.round(box.endY),
  };
};

/**
 * Check if two bounding boxes intersect
 */
export const boundingBoxesIntersect = (box1: BoundingBox, box2: BoundingBox): boolean => {
  const a = normalizeBoundingBox(box1);
  const b = normalizeBoundingBox(box2);

  return !(a.endX < b.startX || a.startX > b.endX || a.endY < b.startY || a.startY > b.endY);
};

/**
 * Calculate intersection area between two bounding boxes (IoU metric)
 */
export const boundingBoxIntersectionOverUnion = (box1: BoundingBox, box2: BoundingBox): number => {
  const a = normalizeBoundingBox(box1);
  const b = normalizeBoundingBox(box2);

  const x1 = Math.max(a.startX, b.startX);
  const y1 = Math.max(a.startY, b.startY);
  const x2 = Math.min(a.endX, b.endX);
  const y2 = Math.min(a.endY, b.endY);

  if (x1 >= x2 || y1 >= y2) return 0; // No intersection

  const intersectionArea = (x2 - x1) * (y2 - y1);
  const area1 = Math.abs(a.endX - a.startX) * Math.abs(a.endY - a.startY);
  const area2 = Math.abs(b.endX - b.startX) * Math.abs(b.endY - b.startY);
  const unionArea = area1 + area2 - intersectionArea;

  return intersectionArea / unionArea;
};

/**
 * Merge multiple bounding boxes into one
 */
export const mergeBoundingBoxes = (boxes: BoundingBox[]): BoundingBox => {
  if (boxes.length === 0) {
    return { startX: 0, startY: 0, endX: 0, endY: 0 };
  }

  const normalized = boxes.map(normalizeBoundingBox);
  const xs = normalized.flatMap((b) => [b.startX, b.endX]);
  const ys = normalized.flatMap((b) => [b.startY, b.endY]);

  return {
    startX: Math.min(...xs),
    startY: Math.min(...ys),
    endX: Math.max(...xs),
    endY: Math.max(...ys),
  };
};
