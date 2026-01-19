<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Confirmar Exclusão</h2>
      </div>
      
      <div class="modal-body">
        <div class="warning-icon">⚠️</div>
        <p class="warning-text">
          Tem certeza que deseja excluir a task 
          <strong>"{{ task?.titulo_task }}"</strong>?
        </p>
        <p class="warning-subtext">
          Esta ação não pode ser desfeita.
        </p>
      </div>
      
      <div class="modal-actions">
        <button
          @click="closeModal"
          class="cancel-button"
          :disabled="loading"
        >
          Cancelar
        </button>
        
        <button
          @click="confirmDelete"
          class="delete-button"
          :disabled="loading"
        >
          {{ loading ? 'Excluindo...' : 'Excluir Task' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Task } from '@/types/kanban'

defineProps<{
  isOpen: boolean
  task: Task | null
}>()

const emit = defineEmits<{
  close: []
  confirm: []
}>()

const loading = ref(false)

const closeModal = () => {
  if (!loading.value) {
    emit('close')
  }
}

const confirmDelete = async () => {
  loading.value = true
  try {
    emit('confirm')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 1.5rem 1.5rem 0 1.5rem;
}

.modal-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.25rem;
  text-align: center;
}

.modal-body {
  padding: 1.5rem;
  text-align: center;
}

.warning-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.warning-text {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1rem;
  line-height: 1.5;
}

.warning-subtext {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  padding: 0 1.5rem 1.5rem 1.5rem;
}

.cancel-button,
.delete-button {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-button {
  background-color: #6c757d;
  color: white;
}

.cancel-button:hover:not(:disabled) {
  background-color: #5a6268;
}

.delete-button {
  background-color: #dc3545;
  color: white;
}

.delete-button:hover:not(:disabled) {
  background-color: #c82333;
}

.cancel-button:disabled,
.delete-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>