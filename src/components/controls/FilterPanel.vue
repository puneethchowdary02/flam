<script setup lang="ts">
import { ref } from 'vue';
import type { FilterOptions } from '@/types/dashboard.types';

const emit = defineEmits<{
  (e: 'update:filters', value: FilterOptions): void;
}>();

const minValue = ref<number | undefined>(undefined);
const maxValue = ref<number | undefined>(undefined);

const applyFilters = () => {
  emit('update:filters', {
    minValue: minValue.value,
    maxValue: maxValue.value
  });
};

const resetFilters = () => {
  minValue.value = undefined;
  maxValue.value = undefined;
  emit('update:filters', {});
};
</script>

<template>
  <div class="filter-panel">
    <h3 class="filter-title">Filters</h3>
    
    <div class="filter-group">
      <label class="filter-label">Min Value</label>
      <input
        v-model.number="minValue"
        type="number"
        class="filter-input"
        placeholder="Min"
      />
    </div>

    <div class="filter-group">
      <label class="filter-label">Max Value</label>
      <input
        v-model.number="maxValue"
        type="number"
        class="filter-input"
        placeholder="Max"
      />
    </div>

    <div class="filter-actions">
      <button @click="applyFilters" class="btn btn-primary">
        Apply
      </button>
      <button @click="resetFilters" class="btn btn-secondary">
        Reset
      </button>
    </div>
  </div>
</template>

<style scoped>
.filter-panel {
  background: rgba(30, 30, 60, 0.5);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 8px;
  padding: 1rem;
}

.filter-title {
  color: #e2e8f0;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.filter-group {
  margin-bottom: 1rem;
}

.filter-label {
  display: block;
  color: #cbd5e1;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.filter-input {
  width: 100%;
  background: #1e293b;
  border: 1px solid #475569;
  border-radius: 6px;
  padding: 0.5rem;
  color: #e2e8f0;
  font-size: 0.875rem;
}

.filter-input:focus {
  outline: none;
  border-color: #8b5cf6;
}

.filter-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  flex: 1;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #8b5cf6;
  color: white;
}

.btn-primary:hover {
  background: #7c3aed;
}

.btn-secondary {
  background: #475569;
  color: white;
}

.btn-secondary:hover {
  background: #64748b;
}
</style>