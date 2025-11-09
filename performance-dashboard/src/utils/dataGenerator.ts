import type { DataPoint } from '@/types/dashboard.types';

/**
 * Generate realistic time-series data with multiple patterns
 */
export class DataGenerator {
  private baseValue: number;
  private trend: number;
  private seasonalAmplitude: number;
  private noiseLevel: number;

  constructor(
    baseValue = 50,
    trend = 0.01,
    seasonalAmplitude = 20,
    noiseLevel = 5
  ) {
    this.baseValue = baseValue;
    this.trend = trend;
    this.seasonalAmplitude = seasonalAmplitude;
    this.noiseLevel = noiseLevel;
  }

  /**
   * Generate a single data point with realistic patterns
   */
  generatePoint(timestamp: number): DataPoint {
    // Trend component
    const trendValue = this.baseValue + this.trend * (timestamp / 1000);

    // Seasonal component (sinusoidal)
    const seasonal = this.seasonalAmplitude * Math.sin(timestamp / 5000);

    // Noise component (Gaussian-like)
    const noise = (Math.random() - 0.5) * this.noiseLevel * 2;

    // Occasional spikes
    const spike = Math.random() > 0.95 ? (Math.random() - 0.5) * 30 : 0;

    return {
      timestamp,
      value: Math.max(0, trendValue + seasonal + noise + spike),
      id: `${timestamp}-${Math.random()}`
    };
  }

  /**
   * Generate a batch of historical data
   */
  generateBatch(count: number, startTime: number, interval: number): DataPoint[] {
    const points: DataPoint[] = [];
    for (let i = 0; i < count; i++) {
      points.push(this.generatePoint(startTime + i * interval));
    }
    return points;
  }

  /**
   * Update internal state for continuous generation
   */
  updateState(delta: number): void {
    this.baseValue += (Math.random() - 0.5) * delta;
    // Prevent drift too far
    this.baseValue = Math.max(20, Math.min(80, this.baseValue));
  }
}

/**
 * Generate multi-category data for complex visualizations
 */
export function generateMultiCategoryData(
  timestamp: number,
  categories: string[]
): DataPoint[] {
  return categories.map(category => ({
    timestamp,
    value: 30 + Math.random() * 40 + Math.sin((timestamp / 1000) * categories.indexOf(category)) * 15,
    category,
    id: `${timestamp}-${category}`
  }));
}