<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import type { DataPoint, ChartConfig } from '@/types/dashboard.types';
import {
  createOptimizedContext,
  clearCanvas,
  calculateBounds,
  createScales,
  drawGrid,
  drawAxes,
  applyLOD
} from '@/utils/canvasUtils';

interface Props {
  data: DataPoint[];
  config: ChartConfig;
  color?: string;
}

const props = withDefaults(defineProps<Props>(), {
  color: '#06b6d4'
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

  const displayData = applyLOD(props.data, width);
  const bounds = calculateBounds(displayData);
  const { xScale, yScale } = createScales(bounds, props.config, width, height);

  drawGrid(ctx, props.config, width, height);
  drawAxes(ctx, bounds, props.config, width, height);

  // Draw line
  const gradient = ctx.createLinearGradient(
    0,
    props.config.margin.top,
    0,
    height - props.config.margin.bottom
  );
  gradient.addColorStop(0, props.color);
  gradient.addColorStop(1, props.color + '40');

  ctx.beginPath();
  const firstX = xScale(displayData[0].timestamp);
  const firstY = yScale(displayData[0].value);
  
  if (isFinite(firstX) && isFinite(firstY)) {
    ctx.moveTo(firstX, firstY);

    for (let i = 1; i < displayData.length; i++) {
      const x = xScale(displayData[i].timestamp);
      const y = yScale(displayData[i].value);
      if (isFinite(x) && isFinite(y)) {
        ctx.lineTo(x, y);
      }
    }

    ctx.strokeStyle = props.color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Fill area
    const lastPoint = displayData[displayData.length - 1];
    const lastX = xScale(lastPoint.timestamp);
    
    if (isFinite(lastX)) {
      ctx.lineTo(lastX, height - props.config.margin.bottom);
      ctx.lineTo(firstX, height - props.config.margin.bottom);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  }
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