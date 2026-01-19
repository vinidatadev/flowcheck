<template>
  <div v-if="isOpen" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>
          {{ mode === 'create' ? 'Nova' : 'Editar' }} 
          {{ type === 'tags' ? 'Tag' : 'Tag de Processo' }}
        </h2>
        <button @click="$emit('close')" class="close-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-form">
        <div class="form-group">
          <label class="form-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
              <line x1="7" y1="7" x2="7.01" y2="7"></line>
            </svg>
            Nome da {{ type === 'tags' ? 'Tag' : 'Tag de Processo' }}
          </label>
          <input
            v-model="formData.name"
            type="text"
            class="form-input"
            :placeholder="`Digite o nome da ${type === 'tags' ? 'tag' : 'tag de processo'}...`"
            required
            maxlength="50"
          />
          <div v-if="nameError" class="error-message">{{ nameError }}</div>
        </div>

        <div class="form-group">
          <label class="form-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M8 12h8"></path>
              <path d="M12 8v8"></path>
            </svg>
            Cor
          </label>
          
          <div class="color-input-group">
            <input
              v-model="colorValue"
              type="color"
              class="color-picker"
              @input="handleColorChange"
            />
            
            <input
              v-model="formData.color"
              type="text"
              class="hex-input"
              placeholder="2563eb"
              pattern="[0-9A-Fa-f]{6}"
              maxlength="6"
              @input="handleHexChange"
            />
            
            <div class="color-preview">
              <TaskTag
                :tag="formData.name || 'Preview'"
                :type="type === 'tags' ? 'tag' : 'tag_processo'"
                :color="formData.color"
              />
            </div>
          </div>
          
          <div class="color-help">
            Digite o código hexadecimal sem o "#" (ex: 2563eb)
          </div>
        </div>

        <div class="form-actions">
          <button type="button" @click="$emit('close')" class="cancel-button">
            Cancelar
          </button>
          <button type="submit" class="save-button" :disabled="loading || !isFormValid">
            <div v-if="loading" class="button-spinner"></div>
            {{ mode === 'create' ? 'Criar' : 'Salvar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { tagsService } from '@/services/tags'
import TaskTag from './TaskTag.vue'
import type { Tag, TagProcesso } from '@/services/tags'

const props = defineProps<{
  isOpen: boolean
  mode: 'create' | 'edit'
  tag: Tag | TagProcesso | null
  type: 'tags' | 'tags_processo'
}>()

const emit = defineEmits<{
  close: []
  save: []
}>()

const loading = ref(false)
const nameError = ref('')

const formData = ref({
  name: '',
  color: ''
})

const colorValue = computed({
  get: () => formData.value.color ? `#${formData.value.color}` : '#2563eb',
  set: (value: string) => {
    formData.value.color = value.replace('#', '')
  }
})

const isFormValid = computed(() => {
  return formData.value.name.trim().length > 0 && 
         formData.value.color.length === 6 &&
         /^[0-9A-Fa-f]{6}$/.test(formData.value.color)
})

const handleColorChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  formData.value.color = target.value.replace('#', '')
}

const handleHexChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value = target.value.replace(/[^0-9A-Fa-f]/g, '').substring(0, 6)
  formData.value.color = value
}

const handleOverlayClick = () => {
  emit('close')
}

const validateName = async () => {
  nameError.value = ''
  
  if (!formData.value.name.trim()) {
    return
  }

  try {
    const excludeId = props.mode === 'edit' ? props.tag?.id : undefined
    
    let exists = false
    if (props.type === 'tags') {
      exists = await tagsService.checkTagExists(formData.value.name.trim(), excludeId)
    } else {
      exists = await tagsService.checkTagProcessoExists(formData.value.name.trim(), excludeId)
    }
    
    if (exists) {
      nameError.value = `Esta ${props.type === 'tags' ? 'tag' : 'tag de processo'} já existe`
    }
  } catch (error) {
    console.error('Erro ao validar nome:', error)
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value || loading.value) return
  
  await validateName()
  if (nameError.value) return

  try {
    loading.value = true
    
    const name = formData.value.name.trim()
    const color = formData.value.color.toLowerCase()
    
    if (props.mode === 'create') {
      if (props.type === 'tags') {
        await tagsService.createTag(name, color)
      } else {
        await tagsService.createTagProcesso(name, color)
      }
    } else if (props.tag) {
      if (props.type === 'tags') {
        await tagsService.updateTag(props.tag.id, name, color)
      } else {
        await tagsService.updateTagProcesso(props.tag.id, name, color)
      }
    }
    
    emit('save')
  } catch (error) {
    console.error('Erro ao salvar tag:', error)
    nameError.value = 'Erro ao salvar. Tente novamente.'
  } finally {
    loading.value = false
  }
}

// Resetar formulário quando abrir/fechar
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    if (props.mode === 'edit' && props.tag) {
      if (props.type === 'tags') {
        const tag = props.tag as Tag
        formData.value.name = tag.tag || ''
        formData.value.color = tag.color || ''
      } else {
        const tag = props.tag as TagProcesso
        formData.value.name = tag.tag_processo || ''
        formData.value.color = tag.color || ''
      }
    } else {
      formData.value.name = ''
      formData.value.color = '2563eb'
    }
    nameError.value = ''
  }
})

// Validar nome quando mudar
watch(() => formData.value.name, () => {
  if (nameError.value) {
    validateName()
  }
})
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
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2rem 1rem 2rem;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #f8f9fa;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: #6c757d;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: #e9ecef;
  color: #495057;
}

.modal-form {
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  outline: none;
}

.form-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.color-input-group {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.color-picker {
  width: 60px;
  height: 44px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  background: none;
  outline: none;
}

.color-picker::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-picker::-webkit-color-swatch {
  border: none;
  border-radius: 4px;
}

.hex-input {
  flex: 1;
  padding: 0.875rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 0.9rem;
  font-family: 'Courier New', monospace;
  transition: all 0.2s ease;
  outline: none;
}

.hex-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.color-preview {
  flex-shrink: 0;
}

.color-help {
  font-size: 0.8rem;
  color: #6c757d;
  margin-top: 0.5rem;
}

.error-message {
  color: #dc3545;
  font-size: 0.8rem;
  margin-top: 0.5rem;
  font-weight: 500;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.cancel-button {
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

.save-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  min-width: 100px;
  justify-content: center;
}

.save-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.save-button:disabled {
  opacity: 0.6;
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
  
  .color-input-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>