<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import type { DataPoint, ChartConfig } from '@/types/dashboard.types';
import { createOptimizedContext, clearCanvas } from '@/utils/canvasUtils';

interface Props {
  data: DataPoint[];
  config: ChartConfig;
}

const props = defineProps<Props>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
let animationFrameId: number | null = null;

const heatmapData = computed(() => {
  if (!props.data || props.data.length === 0) return [];

  const gridSize = 30;
  const grid: number[][] = Array(gridSize)
    .fill(0)
    .map(() => Array(gridSize).fill(0));

  const minTime = props.data[0]?.timestamp || 0;
  const maxTime = props.data[props.data.length - 1]?.timestamp || 1;
  const minValue = Math.min(...props.data.map(d => d.value));
  const maxValue = Math.max(...props.data.map(d => d.value));

  const timeRange = maxTime - minTime || 1;
  const valueRange = maxValue - minValue || 1;

  props.data.forEach(point => {
    const x = Math.floor(((point.timestamp - minTime) / timeRange) * (gridSize - 1));
    const y = Math.floor(((point.value - minValue) / valueRange) * (gridSize - 1));
    if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
      grid[y][x] += 1;
    }
  });

  return grid;
});

const render = () => {
  const canvas = canvasRef.value;
  if (!canvas || !heatmapData.value || heatmapData.value.length === 0) return;

  const ctx = createOptimizedContext(canvas);
  if (!ctx) return;

  const { width, height, margin } = props.config;
  clearCanvas(ctx, width, height);

  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const cellWidth = chartWidth / heatmapData.value[0].length;
  const cellHeight = chartHeight / heatmapData.value.length;
  const maxDensity = Math.max(...heatmapData.value.flat());

  if (maxDensity === 0) return;

  heatmapData.value.forEach((row, y) => {
    row.forEach((density, x) => {
      const intensity = density / maxDensity;
      const r = Math.floor(255 * intensity);
      const g = Math.floor(100 * (1 - intensity));
      const b = Math.floor(255 * (1 - intensity));

      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(
        margin.left + x * cellWidth,
        margin.top + y * cellHeight,
        cellWidth,
        cellHeight
      );
    });
  });
};

const scheduleRender = () => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }
  animationFrameId = requestAnimationFrame(render);
};

watch(() => props.data, scheduleRender, { deep: true });

onMounted(() => {
  scheduleRender();
});

onUnmounted(() => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }
});
</script>

<template>
  <canvas
    ref="canvasRef"
    :width="config.width"
    :height="config.height"
    class="chart-canvas"
  />
</template>

<style scoped>
.chart-canvas {
  border-radius: 8px;
  display: block;
}
</style>