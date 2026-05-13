<template>
  <div class="flow-board">
    <div v-if="loading" class="loading-state">
      <p>Carregando kanban...</p>
    </div>
    
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
    </div>
    
    <div v-else-if="!selectedBucket" class="empty-state">
      <p>Selecione um projeto para visualizar o kanban</p>
    </div>
    
    <div v-else class="board-container">
      <!-- Painel de Filtros -->
      <FilterPanel />
      
      <div class="board-header">
        <div class="board-title">
          <h2>{{ selectedBucket.bucket }}</h2>
          <div class="task-counter">
            <span v-if="hasActiveFilters">
              {{ filteredTasksCount }} de {{ totalTasksCount }} tasks
            </span>
            <span v-else>
              {{ totalTasksCount }} tasks
            </span>
          </div>
        </div>
        <div class="header-actions">
          <button
            v-if="permissions.isAdmin.value"
            @click="taskFilters.toggleStandby()"
            class="standby-button"
            :class="{ active: taskFilters.showStandby.value }"
            :title="taskFilters.showStandby.value ? 'Ocultar tasks Standby' : 'Mostrar tasks Standby'"
          >
            {{ taskFilters.showStandby.value ? '🔕 Ocultar Standby' : '⏸️ Mostrar Standby' }}
          </button>
          <button 
            v-if="permissions.canCreateTask.value"
            @click="$emit('new-task')" 
            class="new-task-button"
          >
            + Nova Task
          </button>
          <button @click="$emit('refresh')" class="refresh-button" :disabled="loading">
            🔄 Atualizar
          </button>
        </div>
      </div>
      
      <div v-if="filteredTasksCount === 0 && hasActiveFilters" class="no-results">
        <p>Nenhuma task encontrada com os filtros aplicados</p>
      </div>
      
      <div v-else class="columns-container">
        <KanbanColumn
          v-for="category in orderedCategories"
          :key="category.id"
          :category="category"
          :tasks="getTasksByCategory(category.id)"
          @task-click="$emit('task-click', $event)"
          @task-drop="(taskId, categoryId) => $emit('task-drop', taskId, categoryId)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePermissions } from '@/composables/usePermissions'
import { useTaskFilters } from '@/composables/useTaskFilters'
import KanbanColumn from './KanbanColumn.vue'
import FilterPanel from './FilterPanel.vue'
import type { Bucket, Category, Task } from '@/types/flowcheck'

defineProps<{
  selectedBucket: Bucket | null
  orderedCategories: Category[]
  getTasksByCategory: (categoryId: number) => Task[]
  loading: boolean
  error: string | null
  filteredTasksCount: number
  totalTasksCount: number
}>()

defineEmits<{
  'task-click': [task: Task]
  'task-drop': [taskId: number, categoryId: number]
  'new-task': []
  'refresh': []
}>()

const permissions = usePermissions()
const taskFilters = useTaskFilters()
const { hasActiveFilters } = taskFilters
</script>

<style scoped>
.flow-board {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.loading-state,
.error-state,
.empty-state {
  padding: 3rem;
  text-align: center;
  color: #666;
}

.error-state {
  color: #dc3545;
}

.board-container {
  padding: 1.5rem;
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.board-title {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.board-title h2 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.task-counter {
  font-size: 0.875rem;
  color: #666;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.new-task-button,
.refresh-button,
.standby-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.standby-button {
  background-color: #e9ecef;
  color: #495057;
  border: 1px solid #dee2e6;
}

.standby-button:hover {
  background-color: #dee2e6;
}

.standby-button.active {
  background-color: #fff3cd;
  color: #856404;
  border-color: #ffc107;
}

.new-task-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.new-task-button:hover {
  opacity: 0.9;
}

.refresh-button {
  background-color: #6c757d;
  color: white;
}

.refresh-button:hover:not(:disabled) {
  background-color: #5a6268;
}

.refresh-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.no-results {
  text-align: center;
  padding: 3rem;
  color: #666;
  font-style: italic;
}

.columns-container {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  padding-bottom: 1rem;
}

.columns-container::-webkit-scrollbar {
  height: 8px;
}

.columns-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.columns-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.columns-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>