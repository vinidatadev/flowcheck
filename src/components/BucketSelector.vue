<template>
  <div class="bucket-selector">
    <h3>Projetos</h3>
    <div class="bucket-tabs">
      <button
        v-for="bucket in buckets"
        :key="bucket.id"
        :class="['bucket-tab', { active: selectedBucket?.id === bucket.id }]"
        @click="$emit('select-bucket', bucket)"
        :disabled="loading"
      >
        <span class="bucket-name">{{ bucket.bucket }}</span>
        <span v-if="bucket.abrev" class="bucket-abrev">{{ bucket.abrev }}</span>
      </button>
    </div>
    
    <div v-if="selectedBucket" class="selected-bucket-info">
      <h4>{{ selectedBucket.bucket }}</h4>
      <p v-if="selectedBucket.descrição" class="bucket-description">
        {{ selectedBucket.descrição }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Bucket } from '@/types/flowcheck'

defineProps<{
  buckets: Bucket[]
  selectedBucket: Bucket | null
  loading: boolean
}>()

defineEmits<{
  'select-bucket': [bucket: Bucket]
}>()
</script>

<style scoped>
.bucket-selector {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.bucket-selector h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.1rem;
}

.bucket-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.bucket-tab {
  padding: 0.75rem 1rem;
  border: 2px solid #e1e5e9;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  min-width: 120px;
}

.bucket-tab:hover:not(:disabled) {
  border-color: #667eea;
  background-color: #f8f9ff;
}

.bucket-tab.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.bucket-tab:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.bucket-name {
  font-weight: 500;
  font-size: 0.9rem;
}

.bucket-abrev {
  font-size: 0.75rem;
  opacity: 0.8;
  font-weight: 300;
}

.selected-bucket-info {
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.selected-bucket-info h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1rem;
}

.bucket-description {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
}
</style>