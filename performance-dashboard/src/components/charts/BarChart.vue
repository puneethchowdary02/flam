<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import type { DataPoint, ChartConfig } from '@/types/dashboard.types';
import { createOptimizedContext, clearCanvas } from '@/utils/canvasUtils';

interface Props {
  data: DataPoint[];
  config: ChartConfig;
  color?: string;
}

const props = withDefaults(defineProps<Props>(), {
  color: '#22c55e'
});

const canvasRef = ref<HTMLCanvasElement | null>(null);
let animationFrameId: number | null = null;

const aggregatedData = computed(() => {
  if (!props.data || props.data.length === 0) return [];

  const buckets = 20;
  const result: { value: number; count: number }[] = Array(buckets)
    .fill(0)
    .map(() => ({ value: 0, count: 0}));
const minValue = Math.min(...props.data.map(d => d.value));
const maxValue = Math.max(...props.data.map(d => d.value));
if (maxValue === minValue) {
return result.map(() => minValue);
}
props.data.forEach(point => {
const bucketIndex = Math.min(
Math.floor(((point.value - minValue) / (maxValue - minValue)) * buckets),
buckets - 1
);
if (bucketIndex >= 0 && bucketIndex < buckets) {
result[bucketIndex].value += point.value;
result[bucketIndex].count += 1;
}
});
return result.map(bucket => (bucket.count > 0 ? bucket.value / bucket.count : 0));
});
const render = () => {
const canvas = canvasRef.value;
if (!canvas || !aggregatedData.value || aggregatedData.value.length === 0) return;
const ctx = createOptimizedContext(canvas);
if (!ctx) return;
const { width, height, margin } = props.config;
clearCanvas(ctx, width, height);
const chartWidth = width - margin.left - margin.right;
const chartHeight = height - margin.top - margin.bottom;
const maxValue = Math.max(...aggregatedData.value.filter(v => isFinite(v)));
if (maxValue === 0 || !isFinite(maxValue)) return;
const barWidth = chartWidth / aggregatedData.value.length;
aggregatedData.value.forEach((value, i) => {
if (!isFinite(value) || value === 0) return;
const barHeight = (value / maxValue) * chartHeight;
const x = margin.left + i * barWidth;
const y = height - margin.bottom - barHeight;

const gradient = ctx.createLinearGradient(0, y, 0, height - margin.bottom);
gradient.addColorStop(0, props.color);
gradient.addColorStop(1, props.color + '60');

ctx.fillStyle = gradient;
ctx.fillRect(x + 2, y, barWidth - 4, barHeight);
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