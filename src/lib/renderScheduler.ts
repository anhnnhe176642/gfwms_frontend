/**
 * RenderScheduler - Pattern từ Label Studio
 * Giới hạn FPS của canvas rendering để tránh lag
 * 
 * Cách dùng:
 * const scheduler = new RenderScheduler(60);
 * scheduler.schedule(() => redrawCanvas(), 'high');
 */

export type RenderPriority = 'high' | 'normal' | 'low';

interface RenderTask {
  id: string;
  fn: () => void;
  priority: RenderPriority;
  timestamp: number;
}

export class RenderScheduler {
  private fps: number;
  private minFrameTime: number;
  private lastRenderTime: number = 0;
  private pendingTasks: Map<string, RenderTask> = new Map();
  private renderScheduled: boolean = false;
  private frameId: NodeJS.Timeout | null = null;

  /**
   * @param fps - Maximum frames per second (default 60)
   */
  constructor(fps: number = 60) {
    this.fps = fps;
    this.minFrameTime = 1000 / fps;
  }

  /**
   * Schedule a render task with priority
   * 
   * High priority: render immediately if time slot available
   * Normal: batch at next frame
   * Low: batch at next available slot
   */
  schedule(fn: () => void, priority: RenderPriority = 'normal', id?: string): string {
    const taskId = id || `task-${Date.now()}-${Math.random()}`;

    const task: RenderTask = {
      id: taskId,
      fn,
      priority,
      timestamp: Date.now(),
    };

    // Replace existing task with same id
    this.pendingTasks.set(taskId, task);

    // Check if we can render immediately
    const now = performance.now();
    const timeSinceLastRender = now - this.lastRenderTime;

    if (timeSinceLastRender >= this.minFrameTime) {
      // Enough time has passed, render immediately
      this.executeFrame();
    } else if (!this.renderScheduled) {
      // Schedule next frame
      this.renderScheduled = true;

      const timeUntilNextFrame = this.minFrameTime - timeSinceLastRender;

      this.frameId = setTimeout(() => {
        requestAnimationFrame(() => {
          this.executeFrame();
        });
      }, timeUntilNextFrame) as unknown as NodeJS.Timeout;
    }

    return taskId;
  }

  /**
   * Cancel a scheduled task
   */
  cancel(id: string): void {
    this.pendingTasks.delete(id);
  }

  /**
   * Execute all pending tasks sorted by priority
   */
  private executeFrame(): void {
    const now = performance.now();

    // Sort by priority: high > normal > low
    const priorityOrder: Record<RenderPriority, number> = {
      high: 0,
      normal: 1,
      low: 2,
    };

    const sortedTasks = Array.from(this.pendingTasks.values()).sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    );

    // Execute all tasks
    for (const task of sortedTasks) {
      try {
        task.fn();
      } catch (error) {
        console.error(`Error executing render task ${task.id}:`, error);
      }
    }

    this.pendingTasks.clear();
    this.lastRenderTime = now;
    this.renderScheduled = false;
  }

  /**
   * Get current pending task count
   */
  getPendingCount(): number {
    return this.pendingTasks.size;
  }

  /**
   * Set FPS limit
   */
  setFps(fps: number): void {
    this.fps = fps;
    this.minFrameTime = 1000 / fps;
  }

  /**
   * Reset scheduler state
   */
  reset(): void {
    this.lastRenderTime = 0;
    this.pendingTasks.clear();
    this.renderScheduled = false;

    if (this.frameId) {
      clearTimeout(this.frameId);
      this.frameId = null;
    }
  }

  /**
   * Destroy scheduler
   */
  destroy(): void {
    this.reset();
  }
}

// Singleton instance
let globalScheduler: RenderScheduler | null = null;

export function getGlobalScheduler(fps: number = 60): RenderScheduler {
  if (!globalScheduler) {
    globalScheduler = new RenderScheduler(fps);
  }
  return globalScheduler;
}

export function resetGlobalScheduler(): void {
  globalScheduler?.reset();
  globalScheduler = null;
}
