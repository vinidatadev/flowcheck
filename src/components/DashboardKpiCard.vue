<template>
  <div class="kpi-card" :class="`kpi-card--${color}`">
    <div class="kpi-card__icon">{{ icon }}</div>
    <div class="kpi-card__content">
      <div class="kpi-card__value">{{ value }}</div>
      <div class="kpi-card__label">{{ label }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: number | string
  icon: string
  color: 'blue' | 'orange' | 'gray' | 'red' | 'green'
}>()
</script>

<style scoped>
.kpi-card {
  background: white;
  border-radius: 10px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  border-left: 4px solid transparent;
  flex: 1;
  min-width: 0;
}

.kpi-card__icon {
  font-size: 1.75rem;
  line-height: 1;
  flex-shrink: 0;
}

.kpi-card__content {
  min-width: 0;
}

.kpi-card__value {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.kpi-card__label {
  font-size: 0.8rem;
  color: #6c757d;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Color variants */
.kpi-card--blue {
  border-left-color: #667eea;
}
.kpi-card--blue .kpi-card__value {
  color: #667eea;
}

.kpi-card--orange {
  border-left-color: #f59e0b;
}
.kpi-card--orange .kpi-card__value {
  color: #f59e0b;
}

.kpi-card--gray {
  border-left-color: #6c757d;
}
.kpi-card--gray .kpi-card__value {
  color: #6c757d;
}

.kpi-card--red {
  border-left-color: #dc3545;
}
.kpi-card--red .kpi-card__value {
  color: #dc3545;
}

.kpi-card--green {
  border-left-color: #28a745;
}
.kpi-card--green .kpi-card__value {
  color: #28a745;
}
</style>
