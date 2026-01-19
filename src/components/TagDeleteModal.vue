<template>
  <div v-if="isOpen" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <div class="warning-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <h2>Confirmar Exclusão</h2>
      </div>

      <div class="modal-body">
        <div class="tag-preview-section">
          <p>Você está prestes a excluir a {{ type === 'tags' ? 'tag' : 'tag de processo' }}:</p>
          
          <div class="tag-to-delete">
            <TaskTag
              v-if="tag"
              :tag="tagName"
              :type="type === 'tags' ? 'tag' : 'tag_processo'"
              :color="tagColor"
            />
          </div>
        </div>

        <div class="warning-message">
          <div class="warning-content">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <div>
              <strong>Atenção!</strong>
              <p>Esta {{ type === 'tags' ? 'tag' : 'tag de processo' }} pode estar associada a tasks existentes. A exclusão é permanente e não pode ser desfeita.</p>
            </div>
          </div>
        </div>

        <div class="confirmation-question">
          <p>Deseja realmente excluir esta {{ type === 'tags' ? 'tag' : 'tag de processo' }}?</p>
        </div>
      </div>

      <div class="modal-actions">
        <button @click="$emit('close')" class="cancel-button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          Cancelar
        </button>
        
        <button @click="handleDelete" class="delete-button" :disabled="loading">
          <div v-if="loading" class="button-spinner"></div>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3,6 5,6 21,6"></polyline>
            <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
          </svg>
          Excluir
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { tagsService } from '@/services/tags'
import TaskTag from './TaskTag.vue'
import type { Tag, TagProcesso } from '@/services/tags'

const props = defineProps<{
  isOpen: boolean
  tag: Tag | TagProcesso | null
  type: 'tags' | 'tags_processo'
}>()

const emit = defineEmits<{
  close: []
  confirm: []
}>()

const loading = ref(false)

const tagName = computed(() => {
  if (!props.tag) return ''
  
  if (props.type === 'tags') {
    return (props.tag as Tag).tag || ''
  } else {
    return (props.tag as TagProcesso).tag_processo || ''
  }
})

const tagColor = computed(() => {
  return props.tag?.color || null
})

const handleOverlayClick = () => {
  if (!loading.value) {
    emit('close')
  }
}

const handleDelete = async () => {
  if (!props.tag || loading.value) return

  try {
    loading.value = true
    
    if (props.type === 'tags') {
      await tagsService.deleteTag(props.tag.id)
    } else {
      await tagsService.deleteTagProcesso(props.tag.id)
    }
    
    emit('confirm')
  } catch (error) {
    console.error('Erro ao excluir tag:', error)
    // Aqui você pode adicionar um toast de erro se necessário
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
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 2rem 2rem 1rem 2rem;
  border-bottom: 1px solid #e9ecef;
}

.warning-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
  border-radius: 12px;
  color: white;
  flex-shrink: 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
}

.modal-body {
  padding: 2rem;
}

.tag-preview-section {
  text-align: center;
  margin-bottom: 2rem;
}

.tag-preview-section p {
  margin: 0 0 1rem 0;
  color: #666;
  font-size: 0.95rem;
}

.tag-to-delete {
  display: flex;
  justify-content: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px dashed #dee2e6;
}

.warning-message {
  margin-bottom: 1.5rem;
}

.warning-content {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 12px;
  color: #856404;
}

.warning-content svg {
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.warning-content strong {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 600;
}

.warning-content p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
}

.confirmation-question {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
}

.confirmation-question p {
  margin: 0;
  font-weight: 600;
  color: #333;
  font-size: 1rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1rem 2rem 2rem 2rem;
  border-top: 1px solid #e9ecef;
}

.cancel-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.cancel-button:hover {
  background: #5a6268;
}

.delete-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  min-width: 120px;
  justify-content: center;
}

.delete-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(220, 53, 69, 0.3);
}

.delete-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.button-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .modal-content {
    margin: 1rem;
    max-width: none;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .modal-header {
    flex-direction: column;
    text-align: center;
  }
}
</style>