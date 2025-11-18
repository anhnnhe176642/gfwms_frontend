/**
 * ViewportOptimization - Pattern từ Label Studio
 * Chỉ render những object nhìn thấy trong viewport
 * 
 * Cách dùng:
 * const viewport = getViewportBounds(canvas, panX, panY, zoom);
 * const visibleBoxes = filterBoxesInViewport(allBoxes, viewport);
 */

export interface Viewport {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  id?: string;
  [key: string]: any;
}

/**
 * Calculate viewport bounds based on pan and zoom
 */
export function getViewportBounds(
  canvas: HTMLCanvasElement,
  panX: number = 0,
  panY: number = 0,
  zoom: number = 1
): Viewport {
  return {
    x: -panX / zoom,
    y: -panY / zoom,
    width: canvas.width / zoom,
    height: canvas.height / zoom,
  };
}

/**
 * Check if a box is inside viewport
 */
export function isBoxInViewport(box: BoundingBox, viewport: Viewport): boolean {
  // Box is completely outside if:
  // - right edge < viewport left
  // - left edge > viewport right
  // - bottom edge < viewport top
  // - top edge > viewport bottom

  return !(
    box.x + box.width < viewport.x ||
    box.x > viewport.x + viewport.width ||
    box.y + box.height < viewport.y ||
    box.y > viewport.y + viewport.height
  );
}

/**
 * Filter boxes that are visible in viewport
 */
export function filterBoxesInViewport(
  boxes: BoundingBox[],
  viewport: Viewport
): BoundingBox[] {
  return boxes.filter((box) => isBoxInViewport(box, viewport));
}

/**
 * Calculate intersection area between box and viewport
 * Used for priority sorting (bigger intersection = higher priority)
 */
export function getIntersectionArea(
  box: BoundingBox,
  viewport: Viewport
): number {
  if (!isBoxInViewport(box, viewport)) {
    return 0;
  }

  const x1 = Math.max(box.x, viewport.x);
  const y1 = Math.max(box.y, viewport.y);
  const x2 = Math.min(box.x + box.width, viewport.x + viewport.width);
  const y2 = Math.min(box.y + box.height, viewport.y + viewport.height);

  return Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
}

/**
 * Sort boxes by visibility (most visible first)
 */
export function sortBoxesByVisibility(
  boxes: BoundingBox[],
  viewport: Viewport
): BoundingBox[] {
  return [...boxes].sort((a, b) => {
    const areaA = getIntersectionArea(a, viewport);
    const areaB = getIntersectionArea(b, viewport);
    return areaB - areaA; // Descending order
  });
}

/**
 * Check if box needs partial rendering (clipped)
 */
export function isBoxClipped(box: BoundingBox, viewport: Viewport): boolean {
  return (
    box.x < viewport.x ||
    box.x + box.width > viewport.x + viewport.width ||
    box.y < viewport.y ||
    box.y + box.height > viewport.y + viewport.height
  );
}

/**
 * Get clipped bounds of box within viewport
 */
export function getClippedBounds(
  box: BoundingBox,
  viewport: Viewport
): BoundingBox | null {
  if (!isBoxInViewport(box, viewport)) {
    return null;
  }

  return {
    ...box,
    x: Math.max(box.x, viewport.x),
    y: Math.max(box.y, viewport.y),
    width: Math.min(box.x + box.width, viewport.x + viewport.width) - Math.max(box.x, viewport.x),
    height: Math.min(box.y + box.height, viewport.y + viewport.height) - Math.max(box.y, viewport.y),
  };
}

/**
 * Performance metrics for viewport optimization
 */
export interface ViewportStats {
  totalBoxes: number;
  visibleBoxes: number;
  culledBoxes: number;
  optimizationRatio: number; // visibleBoxes / totalBoxes
  estimatedSpeedup: number; // totalBoxes / visibleBoxes
}

/**
 * Calculate viewport optimization stats
 */
export function getViewportStats(
  allBoxes: BoundingBox[],
  viewport: Viewport
): ViewportStats {
  const visibleBoxes = filterBoxesInViewport(allBoxes, viewport);
  const totalBoxes = allBoxes.length;
  const culledBoxes = totalBoxes - visibleBoxes.length;
  const optimizationRatio = visibleBoxes.length / Math.max(totalBoxes, 1);
  const estimatedSpeedup = Math.max(totalBoxes, 1) / Math.max(visibleBoxes.length, 1);

  return {
    totalBoxes,
    visibleBoxes: visibleBoxes.length,
    culledBoxes,
    optimizationRatio,
    estimatedSpeedup,
  };
}

/**
 * Batch filter with caching for performance
 * Use when filtering same box array multiple times
 */
export class ViewportFilter {
  private lastViewport: Viewport | null = null;
  private lastResult: BoundingBox[] = [];
  private lastAllBoxes: BoundingBox[] = [];

  filter(boxes: BoundingBox[], viewport: Viewport): BoundingBox[] {
    // Simple cache: if same inputs, return cached result
    if (
      this.lastViewport &&
      this.lastAllBoxes === boxes &&
      viewportsEqual(this.lastViewport, viewport)
    ) {
      return this.lastResult;
    }

    const result = filterBoxesInViewport(boxes, viewport);

    this.lastViewport = viewport;
    this.lastResult = result;
    this.lastAllBoxes = boxes;

    return result;
  }

  clear(): void {
    this.lastViewport = null;
    this.lastResult = [];
    this.lastAllBoxes = [];
  }
}

/**
 * Helper: compare two viewports
 */
function viewportsEqual(v1: Viewport, v2: Viewport): boolean {
  return v1.x === v2.x && v1.y === v2.y && v1.width === v2.width && v1.height === v2.height;
}
