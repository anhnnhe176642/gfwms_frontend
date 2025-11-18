/**
 * OffscreenRenderer - Pattern từ Label Studio
 * Vẽ ẩn (offscreen) rồi copy lên màn hình
 * 
 * Cách dùng:
 * const renderer = new OffscreenRenderer(mainCanvas, 800, 600);
 * renderer.render((ctx) => { ... vẽ ... });
 */

export class OffscreenRenderer {
  private offscreenCanvas: OffscreenCanvas | HTMLCanvasElement;
  private offscreenCtx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  private mainCtx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private lastFlushTime: number = 0;
  private flushInterval: number = 16; // ~60fps

  constructor(mainCanvas: HTMLCanvasElement, width: number, height: number) {
    this.mainCtx = mainCanvas.getContext('2d')!;
    this.width = width;
    this.height = height;

    // Create offscreen canvas
    // Use OffscreenCanvas if available (modern browsers)
    // Fallback to regular canvas
    if (typeof OffscreenCanvas !== 'undefined') {
      this.offscreenCanvas = new OffscreenCanvas(width, height);
    } else {
      this.offscreenCanvas = document.createElement('canvas');
      (this.offscreenCanvas as HTMLCanvasElement).width = width;
      (this.offscreenCanvas as HTMLCanvasElement).height = height;
    }

    const ctx = this.offscreenCanvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context from offscreen canvas');
    }
    this.offscreenCtx = ctx;
  }

  /**
   * Draw to offscreen canvas (hidden)
   */
  drawToOffscreen(
    renderFn: (ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) => void
  ): void {
    try {
      // Clear offscreen
      this.offscreenCtx.clearRect(0, 0, this.width, this.height);

      // Draw
      renderFn(this.offscreenCtx);
    } catch (error) {
      console.error('Error drawing to offscreen canvas:', error);
    }
  }

  /**
   * Transfer from offscreen to main canvas (display)
   * This is atomic - either all or nothing
   */
  flushToMain(): void {
    try {
      this.mainCtx.save();

      // Transfer to main canvas
      if (this.offscreenCanvas instanceof HTMLCanvasElement) {
        this.mainCtx.drawImage(this.offscreenCanvas, 0, 0);
      } else {
        // For OffscreenCanvas, we need to use it directly
        // Note: OffscreenCanvas needs to be transferred via canvas rendering context
        this.mainCtx.drawImage(this.offscreenCanvas as any, 0, 0);
      }

      this.mainCtx.restore();
      this.lastFlushTime = Date.now();
    } catch (error) {
      console.error('Error flushing to main canvas:', error);
    }
  }

  /**
   * One-shot: render to offscreen + flush to main
   */
  render(
    renderFn: (ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) => void
  ): void {
    this.drawToOffscreen(renderFn);
    this.flushToMain();
  }

  /**
   * Render to offscreen, flush only if interval has passed
   * Useful for high-frequency updates (e.g., brush strokes)
   */
  renderWithThrottle(
    renderFn: (ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) => void,
    intervalMs: number = this.flushInterval
  ): void {
    this.drawToOffscreen(renderFn);

    const now = Date.now();
    if (now - this.lastFlushTime >= intervalMs) {
      this.flushToMain();
    }
  }

  /**
   * Render to offscreen, flush if using requestAnimationFrame
   */
  renderAsync(
    renderFn: (ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) => void
  ): Promise<void> {
    return new Promise((resolve) => {
      this.drawToOffscreen(renderFn);
      requestAnimationFrame(() => {
        this.flushToMain();
        resolve();
      });
    });
  }

  /**
   * Clear offscreen canvas
   */
  clearOffscreen(): void {
    this.offscreenCtx.clearRect(0, 0, this.width, this.height);
  }

  /**
   * Clear main canvas
   */
  clearMain(): void {
    this.mainCtx.clearRect(0, 0, this.mainCtx.canvas.width, this.mainCtx.canvas.height);
  }

  /**
   * Clear both
   */
  clearAll(): void {
    this.clearOffscreen();
    this.clearMain();
  }

  /**
   * Resize offscreen canvas
   */
  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;

    if (this.offscreenCanvas instanceof HTMLCanvasElement) {
      this.offscreenCanvas.width = width;
      this.offscreenCanvas.height = height;
    }
  }

  /**
   * Get offscreen context (for advanced usage)
   */
  getOffscreenContext(): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D {
    return this.offscreenCtx;
  }

  /**
   * Get main context
   */
  getMainContext(): CanvasRenderingContext2D {
    return this.mainCtx;
  }

  /**
   * Get offscreen canvas
   */
  getOffscreenCanvas(): OffscreenCanvas | HTMLCanvasElement {
    return this.offscreenCanvas;
  }

  /**
   * Set flush interval (for throttle operations)
   */
  setFlushInterval(ms: number): void {
    this.flushInterval = ms;
  }

  /**
   * Get time since last flush
   */
  getTimeSinceLastFlush(): number {
    return Date.now() - this.lastFlushTime;
  }
}

/**
 * Batch offscreen renderer for multiple layers
 */
export class LayeredOffscreenRenderer {
  private layers: Map<string, OffscreenRenderer> = new Map();
  private mainCanvas: HTMLCanvasElement;
  private mainCtx: CanvasRenderingContext2D;

  constructor(mainCanvas: HTMLCanvasElement) {
    this.mainCanvas = mainCanvas;
    this.mainCtx = mainCanvas.getContext('2d')!;
  }

  /**
   * Create a new offscreen layer
   */
  createLayer(
    name: string,
    width: number,
    height: number
  ): OffscreenRenderer {
    const layer = new OffscreenRenderer(this.mainCanvas, width, height);
    this.layers.set(name, layer);
    return layer;
  }

  /**
   * Get layer by name
   */
  getLayer(name: string): OffscreenRenderer | undefined {
    return this.layers.get(name);
  }

  /**
   * Composite all layers to main canvas
   */
  composite(order: string[]): void {
    this.mainCtx.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);

    for (const layerName of order) {
      const layer = this.layers.get(layerName);
      if (!layer) continue;

      // Transfer layer to main
      layer.flushToMain();
    }
  }

  /**
   * Remove layer
   */
  removeLayer(name: string): void {
    this.layers.delete(name);
  }

  /**
   * Clear all layers
   */
  clearAll(): void {
    for (const layer of this.layers.values()) {
      layer.clearAll();
    }
  }

  /**
   * Resize all layers
   */
  resizeAll(width: number, height: number): void {
    for (const layer of this.layers.values()) {
      layer.resize(width, height);
    }
  }

  /**
   * Get all layer names
   */
  getLayerNames(): string[] {
    return Array.from(this.layers.keys());
  }
}
