import { BoundingBox } from '@/hooks/useBoundingBox';

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
}

/**
 * Vẽ một bounding box lên canvas
 */
export const drawBoundingBox = (
  ctx: CanvasRenderingContext2D,
  box: BoundingBox,
  options: DrawBoxOptions = {}
) => {
  const {
    strokeColor = '#4ECDC4',
    fillColor = 'rgba(0, 0, 0, 0)',
    lineWidth = 2,
    showHandles = true,
    showLabel = false,
    handleColor = '#4ECDC4',
    handleSize = 10,
    edgeHandleColor = '#95E1D3',
    edgeHandleSize = 8,
    showDimensions = false,
    scale = 1,
  } = options;

  const x1 = Math.min(box.startX, box.endX);
  const y1 = Math.min(box.startY, box.endY);
  const width = Math.abs(box.endX - box.startX);
  const height = Math.abs(box.endY - box.startY);

  // Vẽ fill
  if (fillColor !== 'rgba(0, 0, 0, 0)') {
    ctx.fillStyle = fillColor;
    ctx.fillRect(x1, y1, width, height);
  }

  // Vẽ border
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = lineWidth;
  ctx.strokeRect(x1, y1, width, height);

  // Vẽ corner handles
  if (showHandles) {
    const corners = [
      { x: x1, y: y1 }, // top-left
      { x: x1 + width, y: y1 }, // top-right
      { x: x1, y: y1 + height }, // bottom-left
      { x: x1 + width, y: y1 + height }, // bottom-right
    ];

    corners.forEach((corner) => {
      ctx.fillStyle = handleColor;
      ctx.fillRect(
        corner.x - handleSize / 2,
        corner.y - handleSize / 2,
        handleSize,
        handleSize
      );
    });

    // Vẽ edge handles
    const edges = [
      { x: x1 + width / 2, y: y1 }, // top
      { x: x1 + width / 2, y: y1 + height }, // bottom
      { x: x1, y: y1 + height / 2 }, // left
      { x: x1 + width, y: y1 + height / 2 }, // right
    ];

    edges.forEach((edge) => {
      ctx.fillStyle = edgeHandleColor;
      ctx.fillRect(
        edge.x - edgeHandleSize / 2,
        edge.y - edgeHandleSize / 2,
        edgeHandleSize,
        edgeHandleSize
      );
    });
  }

  // Vẽ label
  if (showLabel && box.label) {
    ctx.fillStyle = strokeColor;
    ctx.font = 'bold 12px Arial';
    const labelMetrics = ctx.measureText(box.label);
    const labelPadding = 4;
    const labelHeight = 16;

    // Background cho label
    ctx.fillRect(
      x1,
      y1 - labelHeight - labelPadding,
      labelMetrics.width + labelPadding * 2,
      labelHeight + labelPadding
    );

    // Text
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(box.label, x1 + labelPadding, y1 - labelPadding);
  }

  // Hiển thị kích thước
  if (showDimensions) {
    const displayWidth = Math.round(width / scale);
    const displayHeight = Math.round(height / scale);
    const dimensionText = `${displayWidth}x${displayHeight}px`;

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px Arial';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;

    ctx.strokeText(dimensionText, x1 + 10, y1 + 30);
    ctx.fillText(dimensionText, x1 + 10, y1 + 30);
  }
};

/**
 * Vẽ overlay tối lên toàn bộ canvas ngoại trừ vùng box
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

  // Vẽ overlay tối
  ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Xóa vùng box để hiển thị ảnh gốc
  ctx.clearRect(x1, y1, width, height);
};

/**
 * Vẽ nhiều bounding boxes
 */
export const drawBoundingBoxes = (
  ctx: CanvasRenderingContext2D,
  boxes: BoundingBox[],
  options: DrawBoxOptions & { activeBoxId?: string } = {}
) => {
  const { activeBoxId, ...drawOptions } = options;

  boxes.forEach((box) => {
    const isActive = box.id === activeBoxId;
    drawBoundingBox(ctx, box, {
      ...drawOptions,
      strokeColor: isActive ? '#FF6B6B' : drawOptions.strokeColor,
      lineWidth: isActive ? 3 : drawOptions.lineWidth,
    });
  });
};

/**
 * Scale bounding box theo tỷ lệ
 */
export const scaleBoundingBox = (box: BoundingBox, scale: number): BoundingBox => {
  return {
    ...box,
    startX: box.startX / scale,
    startY: box.startY / scale,
    endX: box.endX / scale,
    endY: box.endY / scale,
  };
};

/**
 * Normalize bounding box (đảm bảo startX < endX, startY < endY)
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
 * Lấy kích thước của bounding box
 */
export const getBoundingBoxSize = (box: BoundingBox) => {
  return {
    width: Math.abs(box.endX - box.startX),
    height: Math.abs(box.endY - box.startY),
  };
};

/**
 * Kiểm tra bounding box có hợp lệ không
 */
export const isValidBoundingBox = (box: BoundingBox, minSize: number = 10): boolean => {
  const { width, height } = getBoundingBoxSize(box);
  return width >= minSize && height >= minSize;
};

/**
 * Chuyển đổi bounding box sang YOLO format (normalized)
 */
export const boundingBoxToYOLO = (
  box: BoundingBox,
  imageWidth: number,
  imageHeight: number
): { x: number; y: number; width: number; height: number } => {
  const normalized = normalizeBoundingBox(box);
  const { width, height } = getBoundingBoxSize(normalized);

  const centerX = (normalized.startX + width / 2) / imageWidth;
  const centerY = (normalized.startY + height / 2) / imageHeight;
  const normalizedWidth = width / imageWidth;
  const normalizedHeight = height / imageHeight;

  return {
    x: centerX,
    y: centerY,
    width: normalizedWidth,
    height: normalizedHeight,
  };
};

/**
 * Chuyển đổi từ YOLO format sang bounding box
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
