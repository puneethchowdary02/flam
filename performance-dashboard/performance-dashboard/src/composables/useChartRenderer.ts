import { ref, onMounted, onUnmounted, watch } from 'vue';
import type { Ref } from 'vue';
import { createOptimizedContext } from '@/utils/canvasUtils';
import { AnimationFrameScheduler } from '@/utils/performanceUtils';

export function useChartRenderer(
  canvasRef: Ref<HTMLCanvasElement | null>,
  renderFn: (ctx: CanvasRenderingContext2D, timestamp: number) => void,
  dependencies: Ref<any>[] = []
) {
  const ctx = ref<CanvasRenderingContext2D | null>(null);
  const isDirty = ref(true);
  let scheduler: AnimationFrameScheduler | null = null;

  const render = (timestamp: number) => {
    if (!ctx.value || !isDirty.value) return;

    renderFn(ctx.value, timestamp);
    isDirty.value = false;
  };

  const markDirty = () => {
    isDirty.value = true;
  };

  onMounted(() => {
    if (canvasRef.value) {
      ctx.value = createOptimizedContext(canvasRef.value);
      
      if (ctx.value) {
        scheduler = new AnimationFrameScheduler(render);
        scheduler.start();
      }
    }
  });

  onUnmounted(() => {
    scheduler?.stop();
  });

  dependencies.forEach(dep => {
    watch(dep, markDirty, { deep: true });
  });

  return {
    ctx,
    markDirty,
    render
  };
}