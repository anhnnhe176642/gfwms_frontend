/**
 * useCanvasOptimization - Custom hook tích hợp tất cả 5 patterns từ Label Studio
 * 
 * Cách dùng:
 * const optimization = useCanvasOptimization(canvasRef, imageRef);
 * 
 * const handleDraw = () => {
 *   optimization.scheduleRender(() => {
 *     optimization.batchRender(visibleBoxes, drawOptions);
 *   }, 'high');
 * };
 */

import { useRef, useCallback, useEffect } from 'react';
import { RenderScheduler } from '@/lib/renderScheduler';
import { BatchCanvasRenderer } from '@/lib/batchCanvasRenderer';
import { OffscreenRenderer } from '@/lib/offscreenRenderer';
import { ViewportFilter, getViewportBounds, filterBoxesInViewport, getViewportStats, ViewportStats } from '@/lib/viewportOptimization';
import type { Viewport } from '@/lib/viewportOptimization';

export interface OptimizationBox {
  id?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  color?: string;
  rotation?: number;
  [key: string]: any;
}

export interface UseCanvasOptimizationOptions {
  fps?: number;
  enableOffscreen?: boolean;
  enableViewportCulling?: boolean;
  viewportPadding?: number;
}

export function useCanvasOptimization(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  imageRef?: React.RefObject<HTMLImageElement | null>,
  options: UseCanvasOptimizationOptions = {}
) {
  const {
    fps = 60,
    enableOffscreen = true,
    enableViewportCulling = true,
    viewportPadding = 50,
  } = options;

  // Refs for optimization utilities
  const schedulerRef = useRef<RenderScheduler | null>(null);
  const batchRendererRef = useRef<BatchCanvasRenderer | null>(null);
  const offscreenRef = useRef<OffscreenRenderer | null>(null);
  const viewportFilterRef = useRef<ViewportFilter>(new ViewportFilter());
  const statsRef = useRef<ViewportStats | null>(null);

  // Initialize optimizers
  useEffect(() => {
    if (!canvasRef.current) return;

    // Pattern 1: Render Scheduler
    schedulerRef.current = new RenderScheduler(fps);

    // Pattern 2: Batch Renderer
    batchRendererRef.current = new BatchCanvasRenderer(canvasRef.current);

    // Pattern 4: Offscreen Renderer
    if (enableOffscreen) {
      const canvas = canvasRef.current;
      offscreenRef.current = new OffscreenRenderer(
        canvas,
        canvas.width,
        canvas.height
      );
    }

    return () => {
      schedulerRef.current?.reset();
    };
  }, [fps, enableOffscreen]);

  /**
   * Pattern 1: Schedule render with rate limiting
   */
  const scheduleRender = useCallback(
    (fn: () => void, priority: 'high' | 'normal' | 'low' = 'normal') => {
      schedulerRef.current?.schedule(fn, priority);
    },
    []
  );

  /**
   * Pattern 5: Get viewport bounds
   */
  const getViewport = useCallback(
    (panX: number = 0, panY: number = 0, zoom: number = 1): Viewport => {
      if (!canvasRef.current) {
        return { x: 0, y: 0, width: 0, height: 0 };
      }

      const viewport = getViewportBounds(canvasRef.current, panX, panY, zoom);

      // Add padding for preloading
      return {
        x: viewport.x - viewportPadding,
        y: viewport.y - viewportPadding,
        width: viewport.width + viewportPadding * 2,
        height: viewport.height + viewportPadding * 2,
      };
    },
    [viewportPadding]
  );

  /**
   * Pattern 5: Cull boxes outside viewport
   */
  const culledBoxes = useCallback(
    (boxes: OptimizationBox[], viewport: Viewport): OptimizationBox[] => {
      if (!enableViewportCulling) {
        return boxes;
      }

      return viewportFilterRef.current.filter(boxes, viewport);
    },
    [enableViewportCulling]
  );

  /**
   * Pattern 2: Batch render boxes
   */
  const batchRender = useCallback(
    (
      boxes: OptimizationBox[],
      options: {
        strokeColor?: string;
        lineWidth?: number;
        fillOpacity?: number;
      } = {}
    ) => {
      if (!batchRendererRef.current || !canvasRef.current) {
        return;
      }

      batchRendererRef.current.batchDrawBoxes(boxes, {
        strokeColor: options.strokeColor || '#FF0000',
        lineWidth: options.lineWidth || 2,
        opacity: options.fillOpacity || 0.1,
      });
    },
    []
  );

  /**
   * Pattern 4: Render to offscreen canvas
   */
  const renderOffscreen = useCallback(
    (
      renderFn: (ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) => void
    ) => {
      if (!offscreenRef.current) {
        return;
      }

      offscreenRef.current.render(renderFn);
    },
    []
  );

  /**
   * Combined: Optimized render with culling + batching + offscreen
   */
  const optimizedRender = useCallback(
    (
      boxes: OptimizationBox[],
      panX: number,
      panY: number,
      zoom: number,
      drawFn: (ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, boxes: OptimizationBox[]) => void
    ) => {
      scheduleRender(
        () => {
          // Pattern 5: Cull boxes
          const viewport = getViewport(panX, panY, zoom);
          const visibleBoxes = culledBoxes(boxes, viewport);

          // Calculate stats
          statsRef.current = {
            totalBoxes: boxes.length,
            visibleBoxes: visibleBoxes.length,
            culledBoxes: boxes.length - visibleBoxes.length,
            optimizationRatio: visibleBoxes.length / Math.max(boxes.length, 1),
            estimatedSpeedup: boxes.length / Math.max(visibleBoxes.length, 1),
          };

          // Pattern 4: Render to offscreen
          if (enableOffscreen && offscreenRef.current) {
            offscreenRef.current.render((ctx) => {
              drawFn(ctx, visibleBoxes);
            });
          } else {
            // Fallback: render directly
            if (canvasRef.current) {
              const ctx = canvasRef.current.getContext('2d');
              if (ctx) {
                drawFn(ctx, visibleBoxes);
              }
            }
          }
        },
        'high'
      );
    },
    [scheduleRender, getViewport, culledBoxes, enableOffscreen]
  );

  /**
   * Get optimization stats
   */
  const getStats = useCallback((): ViewportStats | null => {
    return statsRef.current;
  }, []);

  /**
   * Resize canvas and all associated renderers
   */
  const resize = useCallback((width: number, height: number) => {
    if (!canvasRef.current) return;

    canvasRef.current.width = width;
    canvasRef.current.height = height;

    offscreenRef.current?.resize(width, height);
  }, []);

  /**
   * Clear all canvases
   */
  const clearCanvas = useCallback(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    offscreenRef.current?.clearAll();
  }, []);

  return {
    // Pattern 1
    scheduleRender,

    // Pattern 2
    batchRender,

    // Pattern 4
    renderOffscreen,

    // Pattern 5
    getViewport,
    culledBoxes,

    // Combined
    optimizedRender,

    // Utilities
    getStats,
    resize,
    clearCanvas,

    // Raw accessors (for advanced usage)
    getRawScheduler: () => schedulerRef.current,
    getRawBatchRenderer: () => batchRendererRef.current,
    getRawOffscreenRenderer: () => offscreenRef.current,
  };
}
