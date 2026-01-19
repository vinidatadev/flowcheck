<template>
  <span 
    class="task-tag"
    :class="tagClass"
    :style="dynamicStyles"
  >
    {{ tag }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getTagStyles } from '@/utils/tagColors'

const props = defineProps<{
  tag: string
  type: 'tag' | 'tag_processo'
  color?: string | null
}>()

const tagClass = computed(() => {
  return {
    'task-tag--tag': props.type === 'tag',
    'task-tag--processo': props.type === 'tag_processo'
  }
})

const dynamicStyles = computed(() => {
  return getTagStyles(props.color, props.type)
})
</script>

<style scoped>
.task-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 10px;
  font-weight: 500;
  line-height: 1.2;
  border: 1px solid;
  white-space: nowrap;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Fallback para tags sem cor definida */
.task-tag--tag:not([style*="background-color"]) {
  background-color: #e3f2fd;
  color: #1565c0;
  border-color: #90caf9;
}

.task-tag--processo:not([style*="background-color"]) {
  background-color: #f3e5f526;
  color: #7b1fa2;
  border-color: #ce93d866;
}
</style>