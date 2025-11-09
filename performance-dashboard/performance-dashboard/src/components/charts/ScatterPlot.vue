<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import type { DataPoint, ChartConfig } from '@/types/dashboard.types';
import {
  createOptimizedContext,
  clearCanvas,
  calculateBounds,
  createScales,
  drawGrid
} from '@/utils/canvasUtils';

interface Props {
  data: DataPoint[];
  config: ChartConfig;
  color?: string;
}

const props = withDefaults(defineProps<Props>(), {
  color: '#a855f7'
});

const canvasRef = ref<HTMLCanvasElement | null>(null);
let animationFrameId: number | null = null;

const render = () => {
  const canvas = canvasRef.value;
  if (!canvas || props.data.length === 0) return;

  const ctx = createOptimizedContext(canvas);
  if (!ctx) return;

  const { width, height } = props.config;
  clearCanvas(ctx, width, height);

  const bounds = calculateBounds(props.data);
  const { xScale, yScale } = createScales(bounds, props.config, width, height);

  drawGrid(ctx, props.config, width, height);

  // Draw scatter points
  ctx.fillStyle = props.color + '80';
  props.data.forEach(point => {
    const x = xScale(point.timestamp);
    const y = yScale(point.value);
    
    if (isFinite(x) && isFinite(y)) {
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  });
};

const scheduleRender = () => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }
  animationFrameId = requestAnimationFrame(render);
};

watch(() => props.data, scheduleRender, { deep: true });
watch(() => props.color, scheduleRender);

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