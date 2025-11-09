import { ref, onMounted, onUnmounted } from 'vue';
import type { Ref } from 'vue';
import type { PerformanceMetrics } from '@/types/dashboard.types';
import { PerformanceMonitor, getMemoryUsage } from '@/utils/performanceUtils';

export function usePerformanceMonitor() {
  const metrics: Ref<PerformanceMetrics> = ref({
    fps: 0,
    renderTime: 0,
    dataPoints: 0,
    memoryUsage: 0
  });

  let monitor: PerformanceMonitor | null = null;
  let memoryInterval: ReturnType<typeof setInterval> | null = null;

  onMounted(() => {
    monitor = new PerformanceMonitor((fps, renderTime) => {
      metrics.value.fps = fps;
      metrics.value.renderTime = renderTime;
    });
    monitor.start();

    memoryInterval = setInterval(() => {
      metrics.value.memoryUsage = getMemoryUsage();
    }, 1000);
  });

  onUnmounted(() => {
    monitor?.stop();
    if (memoryInterval) {
      clearInterval(memoryInterval);
    }
  });

  const updateDataPointCount = (count: number) => {
    metrics.value.dataPoints = count;
  };

  return {
    metrics,
    updateDataPointCount
  };
}