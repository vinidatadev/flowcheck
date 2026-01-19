<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>{{ task?.titulo_task || 'Detalhes da Task' }}</h2>
        <div class="header-actions">
          <button 
            v-if="canEditThisTask"
            @click="$emit('edit')" 
            class="edit-button"
          >
            ✏️ Editar
          </button>
          <button @click="closeModal" class="close-button">✕</button>
        </div>
      </div>
      
      <div v-if="task" class="modal-body">
        <div class="detail-section">
          <label>Título:</label>
          <p>{{ task.titulo_task || 'Não informado' }}</p>
        </div>
        
        <div v-if="task.descricao" class="detail-section">
          <label>Descrição:</label>
          <p class="description">{{ task.descricao }}</p>
        </div>
        
        <div v-if="responsaveis.length > 0" class="detail-section">
          <label>Responsáveis:</label>
          <div class="user-list">
            <div 
              v-for="user in responsaveis" 
              :key="user.id"
              class="user-item"
            >
              <div class="user-avatar">
                <img v-if="user.foto" :src="user.foto" :alt="user.nome_usuario || 'Usuário'" />
                <div v-else class="avatar-placeholder">
                  {{ getInitials(user.nome_usuario) }}
                </div>
              </div>
              <div class="user-info">
                <span class="user-name">{{ user.nome_usuario }}</span>
                <span class="user-role">{{ user.cargo }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="solicitantes.length > 0" class="detail-section">
          <label>Solicitantes:</label>
          <div class="user-list">
            <div 
              v-for="user in solicitantes" 
              :key="user.id"
              class="user-item"
            >
              <div class="user-avatar">
                <img v-if="user.foto" :src="user.foto" :alt="user.nome_usuario || 'Usuário'" />
                <div v-else class="avatar-placeholder">
                  {{ getInitials(user.nome_usuario) }}
                </div>
              </div>
              <div class="user-info">
                <span class="user-name">{{ user.nome_usuario }}</span>
                <span class="user-role">{{ user.cargo }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="task.tag && task.tag.length > 0" class="detail-section">
          <label>Tags:</label>
          <div class="tag-list">
            <span 
              v-for="tag in task.tag" 
              :key="tag"
              class="tag"
            >
              {{ tag }}
            </span>
          </div>
        </div>
        
        <div v-if="task.tag_processo && task.tag_processo.length > 0" class="detail-section">
          <label>Tags de Processo:</label>
          <div class="tag-list">
            <span 
              v-for="tag in task.tag_processo" 
              :key="tag"
              class="tag tag-processo"
            >
              {{ tag }}
            </span>
          </div>
        </div>
        
        <div class="detail-row">
          <div class="detail-section">
            <label>Progresso:</label>
            <div class="progress-container">
              <div class="progress-bar">
                <div 
                  class="progress-fill"
                  :style="{ width: `${task.percenti_concluido || 0}%` }"
                ></div>
              </div>
              <span class="progress-text">{{ task.percenti_concluido || 0 }}%</span>
            </div>
          </div>
          
          <div class="detail-section">
            <label>Prioridade:</label>
            <span :class="['priority-badge', { high: task.prioridade }]">
              {{ task.prioridade ? '🔥 Alta' : '📋 Normal' }}
            </span>
          </div>
        </div>
        
        <div v-if="task.data_inicio || task.data_fim" class="detail-row">
          <div v-if="task.data_inicio" class="detail-section">
            <label>Data de Início:</label>
            <p>{{ formatDate(task.data_inicio) }}</p>
          </div>
          
          <div v-if="task.data_fim" class="detail-section">
            <label>Data de Fim:</label>
            <p>{{ formatDate(task.data_fim) }}</p>
          </div>
        </div>
        
        <div class="detail-row">
          <div class="detail-section">
            <label>Status:</label>
            <span :class="['status-badge', { completed: task.status_concluido }]">
              {{ task.status_concluido ? '✅ Concluído' : '⏳ Em andamento' }}
            </span>
          </div>
          
          <div class="detail-section">
            <label>Tipo:</label>
            <div class="type-indicators">
              <span v-if="task.projeto" class="type-badge">📋 Projeto</span>
              <span v-if="task.pos_s4hana" class="type-badge">🔧 SAP S/4HANA</span>
              <span v-if="!task.projeto && !task.pos_s4hana" class="type-badge">📝 Task</span>
            </div>
          </div>
        </div>
        
        <div class="detail-section">
          <label>Criado em:</label>
          <p>{{ formatDate(task.created_at) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useMetadata } from '@/composables/useMetadata'
import { usePermissions } from '@/composables/usePermissions'
import type { Task } from '@/types/flowcheck'

const props = defineProps<{
  isOpen: boolean
  task: Task | null
}>()

const emit = defineEmits<{
  close: []
  edit: []
}>()

const metadata = useMetadata()
const permissions = usePermissions()

// Verificar se pode editar esta task específica
const canEditThisTask = computed(() => {
  if (!props.task) return false
  return permissions.canEditTask.value(props.task)
})

// Carregar metadados se necessário
onMounted(() => {
  if (metadata.state.users.length === 0) {
    metadata.loadMetadata()
  }
})

const responsaveis = computed(() => {
  if (!props.task?.responsavel) return []
  return metadata.getUsersByNames(props.task.responsavel)
})

const solicitantes = computed(() => {
  if (!props.task?.solicitante) return []
  return metadata.getUsersByNames(props.task.solicitante)
})

const closeModal = () => {
  emit('close')
}

const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'Não informado'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return 'Data inválida'
  }
}

const getInitials = (name: string | null | undefined): string => {
  if (!name) return 'U'
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
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
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.25rem;
  flex: 1;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.edit-button,
.close-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.edit-button {
  color: #667eea;
  font-weight: 500;
}

.edit-button:hover {
  background-color: rgba(102, 126, 234, 0.1);
}

.close-button {
  font-size: 1.5rem;
  color: #666;
}

.close-button:hover {
  background-color: #f8f9fa;
}

.modal-body {
  padding: 1.5rem;
}

.detail-section {
  margin-bottom: 1.5rem;
}

.detail-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.detail-section label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.detail-section p {
  margin: 0;
  color: #555;
  line-height: 1.5;
}

.description {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
}

.user-role {
  color: #666;
  font-size: 0.8rem;
}

.responsavel-list,
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.responsavel-tag {
  background-color: #e3f2fd;
  color: #1565c0;
  padding: 0.4rem 0.8rem;
  border-radius: 16px;
  font-size: 0.85rem;
  font-weight: 500;
}

.tag {
  background-color: #f0f0f0;
  color: #666;
  padding: 0.4rem 0.8rem;
  border-radius: 16px;
  font-size: 0.8rem;
}

.tag.tag-processo {
  background-color: #fff3e0;
  color: #ef6c00;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s;
}

.progress-text {
  font-weight: 500;
  color: #333;
  min-width: 40px;
}

.priority-badge,
.status-badge,
.type-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 16px;
  font-size: 0.85rem;
  font-weight: 500;
}

.priority-badge {
  background-color: #e8f5e8;
  color: #2e7d32;
}

.priority-badge.high {
  background-color: #ffebee;
  color: #c62828;
}

.status-badge {
  background-color: #fff3e0;
  color: #ef6c00;
}

.status-badge.completed {
  background-color: #e8f5e8;
  color: #2e7d32;
}

.type-badge {
  background-color: #f3e5f5;
  color: #7b1fa2;
  margin-right: 0.5rem;
}

.type-indicators {
  display: flex;
  flex-wrap: wrap;
}
</style>