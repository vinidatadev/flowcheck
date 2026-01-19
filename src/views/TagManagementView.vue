<template>
  <div class="tag-management">
    <div class="management-header">
      <div class="header-content">
        <div class="header-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
            <line x1="7" y1="7" x2="7.01" y2="7"></line>
          </svg>
        </div>
        <div>
          <h1>Gerenciar Tags</h1>
          <p>Criar, editar e organizar tags do sistema</p>
        </div>
      </div>
      
      <button @click="goBack" class="back-button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5"></path>
          <path d="M12 19l-7-7 7-7"></path>
        </svg>
        Voltar
      </button>
    </div>

    <div class="tabs-container">
      <div class="tabs">
        <button 
          @click="activeTab = 'tags'"
          class="tab"
          :class="{ active: activeTab === 'tags' }"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
            <line x1="7" y1="7" x2="7.01" y2="7"></line>
          </svg>
          Tags ({{ tags.length }})
        </button>
        
        <button 
          @click="activeTab = 'tags_processo'"
          class="tab"
          :class="{ active: activeTab === 'tags_processo' }"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="9" cy="9" r="2"></circle>
            <path d="M21 15.5c-.5-1-1.5-2-3-2s-2.5 1-3 2"></path>
          </svg>
          Tags de Processo ({{ tagsProcesso.length }})
        </button>
      </div>
      
      <button @click="openCreateModal" class="create-button">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Nova {{ activeTab === 'tags' ? 'Tag' : 'Tag de Processo' }}
      </button>
    </div>

    <div class="content">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Carregando tags...</p>
      </div>

      <!-- Tags List -->
      <div v-else-if="activeTab === 'tags'" class="tags-grid">
        <div 
          v-for="tag in tags" 
          :key="tag.id"
          class="tag-item"
        >
          <div class="tag-preview">
            <TaskTag
              :tag="tag.tag || ''"
              type="tag"
              :color="tag.color"
            />
          </div>
          
          <div class="tag-info">
            <div class="tag-name">{{ tag.tag }}</div>
            <div class="tag-color">{{ tag.color ? `#${tag.color}` : 'Sem cor' }}</div>
          </div>
          
          <div class="tag-actions">
            <button @click="openEditModal(tag)" class="action-button edit">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            
            <button @click="openDeleteModal(tag)" class="action-button delete">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3,6 5,6 21,6"></polyline>
                <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <div v-if="tags.length === 0" class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
            <line x1="7" y1="7" x2="7.01" y2="7"></line>
          </svg>
          <h3>Nenhuma tag encontrada</h3>
          <p>Clique em "Nova Tag" para criar a primeira tag</p>
        </div>
      </div>

      <!-- Tags Processo List -->
      <div v-else class="tags-grid">
        <div 
          v-for="tag in tagsProcesso" 
          :key="tag.id"
          class="tag-item"
        >
          <div class="tag-preview">
            <TaskTag
              :tag="tag.tag_processo || ''"
              type="tag_processo"
              :color="tag.color"
            />
          </div>
          
          <div class="tag-info">
            <div class="tag-name">{{ tag.tag_processo }}</div>
            <div class="tag-color">{{ tag.color ? `#${tag.color}` : 'Sem cor' }}</div>
          </div>
          
          <div class="tag-actions">
            <button @click="openEditModal(tag)" class="action-button edit">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            
            <button @click="openDeleteModal(tag)" class="action-button delete">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3,6 5,6 21,6"></polyline>
                <path d="M19,6v14a2,2,0,0,1-2-2H7a2,2,0,0,1-2,2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <div v-if="tagsProcesso.length === 0" class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="9" cy="9" r="2"></circle>
            <path d="M21 15.5c-.5-1-1.5-2-3-2s-2.5 1-3 2"></path>
          </svg>
          <h3>Nenhuma tag de processo encontrada</h3>
          <p>Clique em "Nova Tag de Processo" para criar a primeira</p>
        </div>
      </div>
    </div>

    <!-- Modal de Criação/Edição -->
    <TagFormModal
      :is-open="showFormModal"
      :mode="formMode"
      :tag="selectedTag"
      :type="activeTab"
      @close="closeFormModal"
      @save="handleSave"
    />

    <!-- Modal de Confirmação de Exclusão -->
    <TagDeleteModal
      :is-open="showDeleteModal"
      :tag="selectedTag"
      :type="activeTab"
      @close="closeDeleteModal"
      @confirm="handleDelete"
    />

    <!-- Toast de Feedback -->
    <div v-if="toastMessage" class="toast" :class="toastType">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { tagsService } from '@/services/tags'
import { useMetadata } from '@/composables/useMetadata'
import TaskTag from '@/components/TaskTag.vue'
import TagFormModal from '@/components/TagFormModal.vue'
import TagDeleteModal from '@/components/TagDeleteModal.vue'
import type { Tag, TagProcesso } from '@/services/tags'

const router = useRouter()
const metadata = useMetadata()

const activeTab = ref<'tags' | 'tags_processo'>('tags')
const loading = ref(false)

const tags = ref<Tag[]>([])
const tagsProcesso = ref<TagProcesso[]>([])

const showFormModal = ref(false)
const showDeleteModal = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const selectedTag = ref<Tag | TagProcesso | null>(null)

const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

const goBack = () => {
  router.push('/home')
}

const loadTags = async () => {
  try {
    loading.value = true
    const [tagsData, tagsProcessoData] = await Promise.all([
      tagsService.getTags(),
      tagsService.getTagsProcesso()
    ])
    
    tags.value = tagsData
    tagsProcesso.value = tagsProcessoData
  } catch (error) {
    showToast('Erro ao carregar tags', 'error')
    console.error('Erro ao carregar tags:', error)
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  selectedTag.value = null
  formMode.value = 'create'
  showFormModal.value = true
}

const openEditModal = (tag: Tag | TagProcesso) => {
  selectedTag.value = tag
  formMode.value = 'edit'
  showFormModal.value = true
}

const openDeleteModal = (tag: Tag | TagProcesso) => {
  selectedTag.value = tag
  showDeleteModal.value = true
}

const closeFormModal = () => {
  showFormModal.value = false
  selectedTag.value = null
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  selectedTag.value = null
}

const handleSave = async () => {
  await loadTags()
  // Recarregar metadata para atualizar o resto do sistema
  await metadata.loadMetadata()
  closeFormModal()
  showToast(
    formMode.value === 'create' ? 'Tag criada com sucesso!' : 'Tag atualizada com sucesso!',
    'success'
  )
}

const handleDelete = async () => {
  await loadTags()
  // Recarregar metadata para atualizar o resto do sistema
  await metadata.loadMetadata()
  closeDeleteModal()
  showToast('Tag excluída com sucesso!', 'success')
}

const showToast = (message: string, type: 'success' | 'error') => {
  toastMessage.value = message
  toastType.value = type
  
  setTimeout(() => {
    toastMessage.value = ''
  }, 3000)
}

onMounted(() => {
  loadTags()
})
</script>

<style scoped>
.tag-management {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem;
}

.management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.management-header h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #333;
}

.management-header p {
  margin: 0.25rem 0 0 0;
  color: #666;
  font-size: 0.9rem;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.back-button:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

.tabs-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.tabs {
  display: flex;
  gap: 0.5rem;
}

.tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: #f8f9fa;
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 500;
  color: #6c757d;
  transition: all 0.2s ease;
}

.tab:hover {
  background: #e9ecef;
  color: #495057;
}

.tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
}

.create-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.2);
}

.create-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(40, 167, 69, 0.3);
}

.content {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  min-height: 400px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: #666;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.tags-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.tag-item:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.tag-preview {
  flex-shrink: 0;
}

.tag-info {
  flex: 1;
  min-width: 0;
}

.tag-name {
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
}

.tag-color {
  font-size: 0.8rem;
  color: #666;
  font-family: 'Courier New', monospace;
}

.tag-actions {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button.edit {
  background: #e3f2fd;
  color: #1565c0;
}

.action-button.edit:hover {
  background: #bbdefb;
  transform: scale(1.05);
}

.action-button.delete {
  background: #ffebee;
  color: #d32f2f;
}

.action-button.delete:hover {
  background: #ffcdd2;
  transform: scale(1.05);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  text-align: center;
  color: #666;
}

.empty-state svg {
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  color: #333;
}

.empty-state p {
  margin: 0;
  font-size: 0.9rem;
}

.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  color: white;
  font-weight: 500;
  z-index: 1000;
  animation: slideIn 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.toast.success {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.toast.error {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .tag-management {
    padding: 1rem;
  }
  
  .management-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .tabs-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .tags-grid {
    grid-template-columns: 1fr;
  }
  
  .tag-item {
    flex-direction: column;
    text-align: center;
  }
}
</style>