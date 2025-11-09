export interface DataPoint {
  timestamp: number;
  value: number;
  category?: string;
  id?: string;
}

export interface ChartConfig {
  width: number;
  height: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface TimeRange {
  start: number;
  end: number;
}

export interface AggregationConfig {
  type: '1min' | '5min' | '1hour';
  intervalMs: number;
}

export interface PerformanceMetrics {
  fps: number;
  renderTime: number;
  dataPoints: number;
  memoryUsage: number;
}

export interface ChartBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  config: ChartConfig;
}

export type AggregationType = '1min' | '5min' | '1hour';

export interface FilterOptions {
  minValue?: number;
  maxValue?: number;
  categories?: string[];
}