import type { ChartConfig, ChartBounds } from '@/types/dashboard.types';

/**
 * Create optimized canvas context
 */
export function createOptimizedContext(
  canvas: HTMLCanvasElement
): CanvasRenderingContext2D | null {
  const ctx = canvas.getContext('2d', {
    alpha: false,
    desynchronized: true,
    willReadFrequently: false
  });

  if (ctx) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
  }

  return ctx;
}

/**
 * Clear canvas with solid background
 */
export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color = '#1a1a2e'
): void {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Calculate chart bounds from data
 */
export function calculateBounds(
  data: { timestamp: number; value: number }[],
  padding = 0.1
): ChartBounds {
  if (data.length === 0) {
    return { minX: 0, maxX: 1, minY: 0, maxY: 1 };
  }

  const timestamps = data.map(d => d.timestamp);
  const values = data.map(d => d.value);

  const minX = Math.min(...timestamps);
  const maxX = Math.max(...timestamps);
  const minY = Math.min(...values);
  const maxY = Math.max(...values);

  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  return {
    minX: minX - rangeX * padding,
    maxX: maxX + rangeX * padding,
    minY: minY - rangeY * padding,
    maxY: maxY + rangeY * padding
  };
}

/**
 * Create scale functions for mapping data to pixels
 */
export function createScales(
  bounds: ChartBounds,
  config: ChartConfig,
  width: number,
  height: number
) {
  const chartWidth = width - config.margin.left - config.margin.right;
  const chartHeight = height - config.margin.top - config.margin.bottom;

  const xScale = (value: number): number => {
    const range = bounds.maxX - bounds.minX || 1;
    return config.margin.left + ((value - bounds.minX) / range) * chartWidth;
  };

  const yScale = (value: number): number => {
    const range = bounds.maxY - bounds.minY || 1;
    return height - config.margin.bottom - ((value - bounds.minY) / range) * chartHeight;
  };

  return { xScale, yScale };
}

/**
 * Draw grid lines
 */
export function drawGrid(
  ctx: CanvasRenderingContext2D,
  config: ChartConfig,
  width: number,
  height: number,
  divisions = 5,
  color = '#2a2a4e'
): void {
  const chartWidth = width - config.margin.left - config.margin.right;
  const chartHeight = height - config.margin.top - config.margin.bottom;

  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  for (let i = 0; i <= divisions; i++) {
    const y = config.margin.top + (chartHeight / divisions) * i;
    ctx.beginPath();
    ctx.moveTo(config.margin.left, y);
    ctx.lineTo(width - config.margin.right, y);
    ctx.stroke();
  }

  for (let i = 0; i <= divisions; i++) {
    const x = config.margin.left + (chartWidth / divisions) * i;
    ctx.beginPath();
    ctx.moveTo(x, config.margin.top);
    ctx.lineTo(x, height - config.margin.bottom);
    ctx.stroke();
  }
}

/**
 * Draw axes labels
 */
export function drawAxes(
  ctx: CanvasRenderingContext2D,
  bounds: ChartBounds,
  config: ChartConfig,
  width: number,
  height: number,
  divisions = 5
): void {
  const chartHeight = height - config.margin.top - config.margin.bottom;

  ctx.fillStyle = '#8892b0';
  ctx.font = '11px monospace';
  ctx.textAlign = 'right';

  for (let i = 0; i <= divisions; i++) {
    const value = bounds.minY + ((bounds.maxY - bounds.minY) / divisions) * i;
    const y = height - config.margin.bottom - (chartHeight / divisions) * i;
    ctx.fillText(value.toFixed(1), config.margin.left - 10, y + 4);
  }
}

/**
 * Draw line with gradient
 */
export function drawLineWithGradient(
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
  color: string,
  fillArea = true,
  lineWidth = 2
): void {
  if (points.length < 2) return;

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke();

  if (fillArea) {
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    const bottom = Math.max(...points.map(p => p.y)) + 10;

    ctx.lineTo(lastPoint.x, bottom);
    ctx.lineTo(firstPoint.x, bottom);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, 0, 0, bottom);
    gradient.addColorStop(0, color + '60');
    gradient.addColorStop(1, color + '10');

    ctx.fillStyle = gradient;
    ctx.fill();
  }
}

/**
 * Level of Detail: Skip points based on zoom level
 */
export function applyLOD(
  data: any[],
  viewportWidth: number,
  pixelRatio = 2
): any[] {
  const targetPoints = viewportWidth * pixelRatio;

  if (data.length <= targetPoints) {
    return data;
  }

  const step = Math.ceil(data.length / targetPoints);
  return data.filter((_, i) => i % step === 0);
}