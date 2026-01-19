<template>
  <div 
    class="tag-chip" 
    :class="chipClass"
    :style="dynamicStyles"
  >
    <span class="tag-text">{{ tag }}</span>
    
    <button 
      @click="$emit('remove')"
      class="remove-button"
      type="button"
      :disabled="disabled"
    >
      ×
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getTagStyles } from '@/utils/tagColors'

const props = defineProps<{
  tag: string
  type: 'tag' | 'tag_processo'
  color?: string | null
  disabled?: boolean
}>()

defineEmits<{
  remove: []
}>()

const chipClass = computed(() => {
  return {
    'tag-chip--tag': props.type === 'tag',
    'tag-chip--processo': props.type === 'tag_processo'
  }
})

const dynamicStyles = computed(() => {
  return getTagStyles(props.color, props.type)
})
</script>

<style scoped>
.tag-chip {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  padding: 4px 10px;
  gap: 0.5rem;
  font-size: 12px;
  font-weight: 500;
  transition: all 150ms ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid;
  cursor: default;
}

.tag-chip:hover {
  background-color: var(--hover-bg) !important;
  border-color: var(--hover-border) !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.tag-text {
  white-space: nowrap;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.remove-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  padding: 0;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease;
  margin-left: 2px;
  opacity: 0.8;
  color: inherit;
}

.remove-button:hover:not(:disabled) {
  opacity: 1;
  transform: scale(1.1);
  background-color: rgba(0, 0, 0, 0.1);
}

.remove-button:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

/* Fallback para tags sem cor definida */
.tag-chip--tag:not([style*="background-color"]) {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  color: #1565c0;
  border-color: #90caf9;
}

.tag-chip--processo:not([style*="background-color"]) {
  background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
  color: #7b1fa2;
  border-color: #ce93d8;
}
</style>