<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  (e: 'update:timeRange', value: number): void;
}>();

const props = defineProps<{
  modelValue: number;
}>();

const timeRange = ref(props.modelValue);

const updateTimeRange = () => {
  emit('update:timeRange', timeRange.value);
};
</script>

<template>
  <div class="time-range-selector">
    <label class="selector-label">Time Range</label>
    <select
      v-model="timeRange"
      @change="updateTimeRange"
      class="selector-input"
    >
      <option :value="30000">30 seconds</option>
      <option :value="60000">1 minute</option>
      <option :value="300000">5 minutes</option>
      <option :value="600000">10 minutes</option>
      <option :value="1800000">30 minutes</option>
      <option :value="3600000">1 hour</option>
    </select>
  </div>
</template>

<style scoped>
.time-range-selector {
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
</style>