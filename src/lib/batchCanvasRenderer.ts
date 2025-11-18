/**
 * BatchCanvasRenderer - Pattern từ Label Studio
 * Batch tất cả canvas operations vào 1 lần frame
 * 
 * Cách dùng:
 * const renderer = new BatchCanvasRenderer(canvas);
 * renderer.addOperation(() => ctx.fillRect(...));
 * renderer.addOperation(() => ctx.strokeRect(...));
 * renderer.render();
 */

export interface DrawOptions {
  strokeColor?: string;
  fillColor?: string;
  lineWidth?: number;
  opacity?: number;
  compositeOperation?: GlobalCompositeOperation;
}

export class BatchCanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private operations: Array<() => void> = [];
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context from canvas');
    }
    this.ctx = ctx;
  }

  /**
   * Add operation to batch (not executed immediately)
   */
  addOperation(fn: () => void): void {
    this.operations.push(fn);
  }

  /**
   * Clear all pending operations without rendering
   */
  clearOperations(): void {
    this.operations = [];
  }

  /**
   * Execute all pending operations in one go
   */
  render(): void {
    if (this.operations.length === 0) {
      return;
    }

    this.ctx.save();

    for (const operation of this.operations) {
      try {
        operation();
      } catch (error) {
        console.error('Error during batch render operation:', error);
      }
    }

    this.ctx.restore();
    this.operations = [];
  }

  /**
   * Shorthand: add multiple boxes with consistent styling
   */
  batchDrawBoxes(
    boxes: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
      label?: string;
      color?: string;
      rotation?: number;
    }>,
    options: DrawOptions = {}
  ): void {
    const {
      strokeColor = '#FF0000',
      lineWidth = 2,
      compositeOperation = 'source-over',
    } = options;

    this.ctx.save();
    this.ctx.strokeStyle = strokeColor;
    this.ctx.lineWidth = lineWidth;
    this.ctx.globalCompositeOperation = compositeOperation;

    for (const box of boxes) {
      this.addOperation(() => {
        this.ctx.save();

        // Apply rotation if specified
        if (box.rotation) {
          const centerX = box.x + box.width / 2;
          const centerY = box.y + box.height / 2;
          this.ctx.translate(centerX, centerY);
          this.ctx.rotate((box.rotation * Math.PI) / 180);
          this.ctx.translate(-centerX, -centerY);
        }

        // Draw box
        this.ctx.strokeStyle = box.color || strokeColor;
        this.ctx.strokeRect(box.x, box.y, box.width, box.height);

        // Draw label if provided
        if (box.label) {
          this.ctx.fillStyle = box.color || strokeColor;
          this.ctx.font = '12px Arial';
          this.ctx.fillText(box.label, box.x + 4, box.y - 4);
        }

        this.ctx.restore();
      });
    }

    this.render();
  }

  /**
   * Batch draw lines
   */
  batchDrawLines(
    lines: Array<{
      fromX: number;
      fromY: number;
      toX: number;
      toY: number;
      color?: string;
      lineWidth?: number;
    }>,
    options: DrawOptions = {}
  ): void {
    const { strokeColor = '#000000', lineWidth = 1 } = options;

    this.ctx.save();
    this.ctx.strokeStyle = strokeColor;
    this.ctx.lineWidth = lineWidth;

    for (const line of lines) {
      this.addOperation(() => {
        this.ctx.strokeStyle = line.color || strokeColor;
        this.ctx.lineWidth = line.lineWidth || lineWidth;

        this.ctx.beginPath();
        this.ctx.moveTo(line.fromX, line.fromY);
        this.ctx.lineTo(line.toX, line.toY);
        this.ctx.stroke();
      });
    }

    this.render();
  }

  /**
   * Batch fill rectangles
   */
  batchFillRects(
    rects: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
      color?: string;
      opacity?: number;
    }>,
    options: DrawOptions = {}
  ): void {
    const { fillColor = '#0000FF', opacity = 1 } = options;

    this.ctx.save();
    this.ctx.globalAlpha = opacity;

    for (const rect of rects) {
      this.addOperation(() => {
        this.ctx.fillStyle = rect.color || fillColor;
        this.ctx.globalAlpha = rect.opacity ?? opacity;
        this.ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
      });
    }

    this.render();
  }

  /**
   * Get number of pending operations
   */
  getPendingCount(): number {
    return this.operations.length;
  }

  /**
   * Get canvas context (for advanced usage)
   */
  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  /**
   * Get canvas element
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }
}
