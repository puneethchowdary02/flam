import { ref, onMounted, onUnmounted, computed } from 'vue';
import type { Ref } from 'vue';
import type { DataPoint } from '@/types/dashboard.types';
import { DataGenerator } from '@/utils/dataGenerator';

export function useDataStream(
  updateInterval = 100,
  maxPoints = 10000,
  timeWindow = 60000
) {
  const data: Ref<DataPoint[]> = ref([]);
  const isPlaying = ref(true);
  const generator = new DataGenerator();
  
  let intervalId: ReturnType<typeof setInterval> | null = null;

  const addDataPoint = () => {
    const now = Date.now();
    const point = generator.generatePoint(now);
    
    data.value = [...data.value, point];
    
    const cutoff = now - timeWindow;
    data.value = data.value.filter(p => p.timestamp > cutoff);
    
    if (data.value.length > maxPoints) {
      data.value = data.value.slice(-maxPoints);
    }
    
    generator.updateState(0.5);
  };

  const start = () => {
    if (intervalId !== null) return;
    
    isPlaying.value = true;
    intervalId = setInterval(addDataPoint, updateInterval);
  };

  const stop = () => {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
    isPlaying.value = false;
  };

  const toggle = () => {
    if (isPlaying.value) {
      stop();
    } else {
      start();
    }
  };

  const clear = () => {
    data.value = [];
  };

  const dataCount = computed(() => data.value.length);
  const latestValue = computed(() => 
    data.value.length > 0 ? data.value[data.value.length - 1].value : 0
  );

  onMounted(() => {
    const now = Date.now();
    data.value = generator.generateBatch(100, now - 10000, 100);
    start();
  });

  onUnmounted(() => {
    stop();
  });

  return {
    data,
    isPlaying,
    dataCount,
    latestValue,
    start,
    stop,
    toggle,
    clear,
    addDataPoint
  };
}