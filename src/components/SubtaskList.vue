<template>
  <div class="subtask-list">
    <div
      v-for="(subtask, index) in subtasks"
      :key="index"
      class="subtask-item"
    >
      <input
        v-model="completed[index]"
        type="checkbox"
        :disabled="disabled"
        @change="updateCompleted"
      />
      
      <input
        v-model="subtasks[index]"
        type="text"
        placeholder="Digite a subtask"
        :disabled="disabled"
        @input="updateSubtasks"
        class="subtask-input"
      />
      
      <button
        @click="removeSubtask(index)"
        type="button"
        class="remove-button"
        :disabled="disabled"
      >
        🗑️
      </button>
    </div>
    
    <button
      @click="addSubtask"
      type="button"
      class="add-button"
      :disabled="disabled"
    >
      + Adicionar Subtask
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  subtasks: string[]
  completed: boolean[]
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:subtasks': [value: string[]]
  'update:completed': [value: boolean[]]
}>()

const subtasks = ref([...props.subtasks])
const completed = ref([...props.completed])

// Sincronizar com props
watch(() => props.subtasks, (newSubtasks) => {
  subtasks.value = [...newSubtasks]
}, { deep: true })

watch(() => props.completed, (newCompleted) => {
  completed.value = [...newCompleted]
}, { deep: true })

const updateSubtasks = () => {
  emit('update:subtasks', [...subtasks.value])
}

const updateCompleted = () => {
  emit('update:completed', [...completed.value])
}

const addSubtask = () => {
  subtasks.value.push('')
  completed.value.push(false)
  updateSubtasks()
  updateCompleted()
}

const removeSubtask = (index: number) => {
  subtasks.value.splice(index, 1)
  completed.value.splice(index, 1)
  updateSubtasks()
  updateCompleted()
}
</script>

<style scoped>
.subtask-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.subtask-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.subtask-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
}

.subtask-input:focus {
  outline: none;
  border-color: #667eea;
}

.subtask-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.remove-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.remove-button:hover:not(:disabled) {
  background-color: rgba(220, 53, 69, 0.1);
}

.remove-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.add-button {
  padding: 0.75rem;
  background-color: #f8f9fa;
  border: 2px dashed #ddd;
  border-radius: 8px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.add-button:hover:not(:disabled) {
  background-color: #e9ecef;
  border-color: #667eea;
  color: #667eea;
}

.add-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>