/**
 * Performance monitoring and optimization utilities
 */

export class PerformanceMonitor {
  private frameTimes: number[] = [];
  private lastFrameTime = performance.now();
  private rafId: number | null = null;
  private onUpdate: (fps: number, renderTime: number) => void;

  constructor(onUpdate: (fps: number, renderTime: number) => void) {
    this.onUpdate = onUpdate;
  }

  start(): void {
    const measure = () => {
      const now = performance.now();
      const delta = now - this.lastFrameTime;

      this.frameTimes.push(delta);
      if (this.frameTimes.length > 60) {
        this.frameTimes.shift();
      }

      const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
      const fps = 1000 / avgFrameTime;

      this.onUpdate(Math.round(fps), Math.round(avgFrameTime * 100) / 100);

      this.lastFrameTime = now;
      this.rafId = requestAnimationFrame(measure);
    };

    this.rafId = requestAnimationFrame(measure);
  }

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for limiting execution rate
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Get memory usage if available
 */
export function getMemoryUsage(): number {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return Math.round(memory.usedJSHeapSize / 1048576); // Convert to MB
  }
  return 0;
}

/**
 * RequestAnimationFrame wrapper with performance tracking
 */
export class AnimationFrameScheduler {
  private callback: (timestamp: number) => void;
  private rafId: number | null = null;
  private isRunning = false;

  constructor(callback: (timestamp: number) => void) {
    this.callback = callback;
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    const loop = (timestamp: number) => {
      if (!this.isRunning) return;

      this.callback(timestamp);
      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
  }

  stop(): void {
    this.isRunning = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}