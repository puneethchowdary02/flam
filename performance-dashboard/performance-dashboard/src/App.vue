<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useDataStream } from '@/composables/useDataStream';
import { usePerformanceMonitor } from '@/composables/usePerformanceMonitor';
import LineChart from '@/components/charts/LineChart.vue';
import BarChart from '@/components/charts/BarChart.vue';
import ScatterPlot from '@/components/charts/ScatterPlot.vue';
import Heatmap from '@/components/charts/Heatmap.vue';
import FilterPanel from '@/components/controls/FilterPanel.vue';
import TimeRangeSelector from '@/components/controls/TimeRangeSelector.vue';
import DataTable from '@/components/DataTable.vue';
import type { ChartConfig, AggregationType, FilterOptions } from '@/types/dashboard.types';

const timeRange = ref(60000);
const aggregation = ref<AggregationType>('1min');
const filters = ref<FilterOptions>({});

const { data, isPlaying, toggle, clear } = useDataStream(100, 10000, timeRange.value);
const { metrics, updateDataPointCount } = usePerformanceMonitor();

watch(() => data.value.length, (count) => {
  updateDataPointCount(count);
});

const chartConfig: ChartConfig = {
  width: 600,
  height: 300,
  margin: { top: 20, right: 20, bottom: 40, left: 60 }
};

const filteredData = computed(() => {
  let result = data.value;

  if (filters.value.minValue !== undefined) {
    result = result.filter(d => d.value >= filters.value.minValue!);
  }

  if (filters.value.maxValue !== undefined) {
    result = result.filter(d => d.value <= filters.value.maxValue!);
  }

  return result;
});

const aggregatedData = computed(() => {
  const intervalMs =
    aggregation.value === '1min' ? 60000 : aggregation.value === '5min' ? 300000 : 3600000;
  const buckets = new Map<number, typeof data.value>();

  filteredData.value.forEach(point => {
    const bucket = Math.floor(point.timestamp / intervalMs) * intervalMs;
    if (!buckets.has(bucket)) buckets.set(bucket, []);
    buckets.get(bucket)!.push(point);
  });

  return Array.from(buckets.entries()).map(([timestamp, points]) => ({
    timestamp,
    value: points.reduce((sum, p) => sum + p.value, 0) / points.length,
    id: `agg-${timestamp}`
  }));
});

const updateFilters = (newFilters: FilterOptions) => {
  filters.value = newFilters;
};

const updateTimeRange = (newRange: number) => {
  timeRange.value = newRange;
};
</script>

<template>
  <div class="dashboard">
    <!-- Header -->
    <header class="dashboard-header">
      <div class="header-content">
        <div>
          <h1 class="dashboard-title">Performance Dashboard</h1>
          <p class="dashboard-subtitle">Real-time data visualization with 60 FPS rendering</p>
        </div>
        <div class="header-icon">📊</div>
      </div>
    </header>

    <!-- Performance Metrics -->
    <section class="metrics-section">
      <div class="metric-card fps">
        <div class="metric-label">FPS</div>
        <div class="metric-value">{{ metrics.fps }}</div>
        <div class="metric-target">Target: 60</div>
      </div>
      <div class="metric-card render-time">
        <div class="metric-label">Render Time</div>
        <div class="metric-value">{{ metrics.renderTime }}ms</div>
        <div class="metric-target">Target: &lt;16ms</div>
      </div>
      <div class="metric-card data-points">
        <div class="metric-label">Data Points</div>
        <div class="metric-value">{{ metrics.dataPoints.toLocaleString() }}</div>
        <div class="metric-target">Max: 10,000</div>
      </div>
      <div class="metric-card memory">
        <div class="metric-label">Memory</div>
        <div class="metric-value">{{ metrics.memoryUsage }}MB</div>
        <div class="metric-target">JS Heap</div>
      </div>
    </section>

    <!-- Controls -->
    <section class="controls-section">
      <button @click="toggle" class="btn btn-play">
        {{ isPlaying ? '⏸ Pause' : '▶ Play' }}
      </button>

      <TimeRangeSelector :model-value="timeRange" @update:time-range="updateTimeRange" />

      <div class="aggregation-selector">
        <label class="selector-label">Aggregation</label>
        <select v-model="aggregation" class="selector-input">
          <option value="1min">1 minute</option>
          <option value="5min">5 minutes</option>
          <option value="1hour">1 hour</option>
        </select>
      </div>

      <button @click="clear" class="btn btn-clear">Clear Data</button>
    </section>

    <!-- Charts Grid -->
    <section class="charts-section">
      <div class="chart-container">
        <h3 class="chart-title">📈 Line Chart</h3>
        <LineChart
          v-if="filteredData.length > 0"
          :data="filteredData"
          :config="chartConfig"
          color="#06b6d4"
        />
        <div v-else class="chart-empty">No data available</div>
      </div>

      <div class="chart-container">
        <h3 class="chart-title">📊 Bar Chart (Distribution)</h3>
        <BarChart
          v-if="filteredData.length > 0"
          :data="filteredData"
          :config="chartConfig"
          color="#22c55e"
        />
        <div v-else class="chart-empty">No data available</div>
      </div>

      <div class="chart-container">
        <h3 class="chart-title">⚡ Scatter Plot</h3>
        <ScatterPlot
          v-if="filteredData.length > 0"
          :data="filteredData"
          :config="chartConfig"
          color="#a855f7"
        />
        <div v-else class="chart-empty">No data available</div>
      </div>

      <div class="chart-container">
        <h3 class="chart-title">🔥 Heatmap (Density)</h3>
        <Heatmap
          v-if="filteredData.length > 0"
          :data="filteredData"
          :config="chartConfig"
        />
        <div v-else class="chart-empty">No data available</div>
      </div>
    </section>

    <!-- Filters and Data Table -->
    <section class="data-section">
      <div class="filter-container">
        <FilterPanel @update:filters="updateFilters" />
      </div>

      <div class="table-container">
        <h3 class="section-title">Recent Data Points</h3>
        <DataTable :data="filteredData" :max-rows="20" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
  padding: 2rem;
}

.dashboard-header {
  background: rgba(30, 30, 60, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dashboard-title {
  font-size: 2rem;
  font-weight: 700;
  color: #e2e8f0;
  margin-bottom: 0.5rem;
}

.dashboard-subtitle {
  color: #94a3b8;
  font-size: 1rem;
}

.header-icon {
  font-size: 3rem;
}

.metrics-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: rgba(30, 30, 60, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid;
}

.metric-card.fps {
  border-color: rgba(34, 197, 94, 0.3);
}

.metric-card.render-time {
  border-color: rgba(59, 130, 246, 0.3);
}

.metric-card.data-points {
  border-color: rgba(168, 85, 247, 0.3);
}

.metric-card.memory {
  border-color: rgba(234, 179, 8, 0.3);
}

.metric-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 0.5rem;
}

.metric-value {
  font-size: 2rem;
  font-weight: 700;
  color: #e2e8f0;
  margin-bottom: 0.25rem;
}

.metric-target {
  font-size: 0.75rem;
  color: #64748b;
}

.controls-section {
  background: rgba(30, 30, 60, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-play {
  background: #8b5cf6;
  color: white;
}

.btn-play:hover {
  background: #7c3aed;
}

.btn-clear {
  background: #ef4444;
  color: white;
  margin-left: auto;
}

.btn-clear:hover {
  background: #dc2626;
}

.aggregation-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.selector-label {
  color: #cbd5e1;
  font-size: 0.875rem;
  font-weight: 500;
}

.selector-input {
  background: #1e293b;
  border: 1px solid #475569;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  color: #e2e8f0;
  font-size: 0.875rem;
  cursor: pointer;
}

.selector-input:focus {
  outline: none;
  border-color: #8b5cf6;
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(600px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.chart-container {
  background: rgba(30, 30, 60, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
}

.chart-title {
  color: #e2e8f0;
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  }
.chart-empty {
height: 300px;
display: flex;
align-items: center;
justify-content: center;
color: #64748b;
font-size: 1rem;
}
.data-section {
display: grid;
grid-template-columns: 300px 1fr;
gap: 2rem;
}
.filter-container {
height: fit-content;
}
.table-container {
background: rgba(30, 30, 60, 0.5);
backdrop-filter: blur(10px);
border: 1px solid rgba(139, 92, 246, 0.2);
border-radius: 12px;
padding: 1.5rem;
}
.section-title {
color: #e2e8f0;
font-size: 1.125rem;
font-weight: 600;
margin-bottom: 1rem;
}
@media (max-width: 1024px) {
.charts-section {
grid-template-columns: 1fr;
}
.data-section {
grid-template-columns: 1fr;
}
}
</style>