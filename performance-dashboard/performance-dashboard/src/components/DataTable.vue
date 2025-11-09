<script setup lang="ts">
import { computed } from 'vue';
import type { DataPoint } from '@/types/dashboard.types';

const props = defineProps<{
  data: DataPoint[];
  maxRows?: number;
}>();

const displayData = computed(() => {
  const max = props.maxRows || 20;
  return props.data.slice(-max).reverse();
});

const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString();
};

const calculateDelta = (current: number, previous: number | undefined): number => {
  return previous !== undefined ? current - previous : 0;
};
</script>

<template>
  <div class="data-table-container">
    <table class="data-table">
      <thead>
        <tr>
          <th>Timestamp</th>
          <th>Value</th>
          <th>Delta</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(point, index) in displayData" :key="point.id || point.timestamp">
          <td class="timestamp">{{ formatTimestamp(point.timestamp) }}</td>
          <td class="value">{{ point.value.toFixed(2) }}</td>
          <td
            class="delta"
            :class="{
              positive: calculateDelta(point.value, displayData[index + 1]?.value) > 0,
              negative: calculateDelta(point.value, displayData[index + 1]?.value) < 0,
              neutral: calculateDelta(point.value, displayData[index + 1]?.value) === 0
            }"
          >
            {{ calculateDelta(point.value, displayData[index + 1]?.value) > 0 ? '+' : '' }}
            {{ calculateDelta(point.value, displayData[index + 1]?.value).toFixed(2) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.data-table-container {
  overflow-x: auto;
  overflow-y: auto;
  max-height: 400px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.data-table thead {
  position: sticky;
  top: 0;
  background: #1e293b;
  z-index: 1;
}

.data-table th {
  text-align: left;
  padding: 0.75rem 1rem;
  color: #94a3b8;
  font-weight: 600;
  border-bottom: 2px solid #334155;
}

.data-table td {
  padding: 0.75rem 1rem;
  color: #e2e8f0;
  border-bottom: 1px solid rgba(51, 65, 85, 0.5);
}

.data-table tr:hover {
  background: rgba(139, 92, 246, 0.1);
}

.timestamp {
  font-family: monospace;
}

.value {
  font-family: monospace;
  font-weight: 500;
}

.delta {
  font-family: monospace;
  font-weight: 600;
}

.delta.positive {
  color: #22c55e;
}

.delta.negative {
  color: #ef4444;
}

.delta.neutral {
  color: #94a3b8;
}
</style>