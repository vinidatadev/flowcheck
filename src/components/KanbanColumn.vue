<template>
  <div 
    class="flow-column"
    :class="{ 'drag-over': isDragOver }"
    @dragover.prevent="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <div class="column-header">
      <h3 class="column-title">{{ category.category }}</h3>
      <span class="task-count">{{ tasks.length }}</span>
    </div>
    
    <div class="column-content">
      <div v-if="tasks.length === 0" class="empty-state">
        <p>Nenhuma task nesta coluna</p>
      </div>
      
      <TaskCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @click="$emit('task-click', task)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TaskCard from './TaskCard.vue'
import type { Category, Task } from '@/types/flowcheck'

const props = defineProps<{
  category: Category
  tasks: Task[]
}>()

const emit = defineEmits<{
  'task-click': [task: Task]
  'task-drop': [taskId: number, categoryId: number]
}>()

const isDragOver = ref(false)

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (event: DragEvent) => {
  // Só remove o highlight se realmente saiu da coluna
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const x = event.clientX
  const y = event.clientY
  
  if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
    isDragOver.value = false
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
  
  try {
    const data = event.dataTransfer?.getData('text/plain')
    if (data) {
      const { taskId } = JSON.parse(data)
      if (taskId && props.category.id) {
        emit('task-drop', taskId, props.category.id)
      }
    }
  } catch (error) {
    console.error('Erro ao processar drop:', error)
  }
}
</script>

<style scoped>
.flow-column {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1rem;
  min-height: 500px;
  width: 320px;
  flex-shrink: 0;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e9ecef;
}

.column-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.task-count {
  background-color: #667eea;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  min-width: 24px;
  text-align: center;
}

.column-content {
  max-height: calc(100vh - 300px);
  overflow-y: auto;
  padding-right: 0.25rem;
}

.column-content::-webkit-scrollbar {
  width: 6px;
}

.column-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.column-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.column-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.flow-column.drag-over {
  background-color: #e3f2fd;
  border: 2px dashed #2196f3;
}

.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  color: #666;
}

.empty-state p {
  margin: 0;
  font-style: italic;
}
</style>