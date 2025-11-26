/**
 * Canvas utility helpers for consistent DPR sizing and client coordinate mapping
 * across canvas-based components.
 */

export interface MappedPoint {
  x: number; // logical coordinate space (pre-zoom)
  y: number; // logical coordinate space (pre-zoom)
  dpr: number; // device pixel ratio used
  rect: DOMRect; // bounding client rect
}

/**
 * Setup a canvas for DPR-aware drawing: sets canvas.width/height to device pixels and
 * sets the style width/height to CSS px (displayWidth/displayHeight). Returns the
 * devicePixelRatio used.
 */
export const setupCanvasDPR = (canvas: HTMLCanvasElement, displayWidth: number, displayHeight: number): number => {
  const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
  const pixelWidth = Math.round(displayWidth * dpr);
  const pixelHeight = Math.round(displayHeight * dpr);

  // Only set if changed
  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
  }

  // Return dpr so callers can set ctx transform and use the dpr
  return dpr;
};

/**
 * Map client (mouse) coordinates to the logical coordinate space used by the app.
 * - clientX, clientY: mouse coordinates from the event
 * - canvas: the canvas element
 * - zoomLevel: (optional) current zoomLevel used by the application (1 = 100%)
 *
 * The mapping accounts for boundingClientRect and canvas pixel resolution, and divides
 * by devicePixelRatio and zoomLevel to return logical coordinates (pre-zoom, CSS pixels).
 */
export const mapClientToLogicalPoint = (
  clientX: number,
  clientY: number,
  canvas: HTMLCanvasElement,
  zoomLevel = 1,
): MappedPoint => {
  const rect = canvas.getBoundingClientRect();
  const domX = clientX - rect.left;
  const domY = clientY - rect.top;
  const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;

  // Scale from DOM CSS pixels to canvas pixels
  const scaleX = canvas.width / Math.max(rect.width, 1);
  const scaleY = canvas.height / Math.max(rect.height, 1);

  const canvasX = domX * scaleX;
  const canvasY = domY * scaleY;

  // Convert canvas device pixels to logical coordinates and remove zoom
  const x = (canvasX / dpr) / (zoomLevel || 1);
  const y = (canvasY / dpr) / (zoomLevel || 1);

  // Clamp to logical bounds
  const maxX = canvas.width / (dpr * (zoomLevel || 1));
  const maxY = canvas.height / (dpr * (zoomLevel || 1));

  return {
    x: Math.max(0, Math.min(x, maxX)),
    y: Math.max(0, Math.min(y, maxY)),
    dpr,
    rect,
  };
};
