<template>
  <div class="home-container">
    <Sidebar
      :is-open="sidebar.sidebarOpen.value"
      :user="auth.state.user"
      :buckets="flowcheck.state.buckets"
      :selected-bucket="flowcheck.state.selectedBucket"
      @toggle-sidebar="sidebar.toggleSidebar"
      @select-bucket="flowcheck.selectBucket"
      @logout="handleLogout"
      @navigate-to-tags="navigateToTags"
      @navigate-to-users="navigateToUsers"
      @navigate-to-dashboard="navigateToDashboard"
      @navigate-to-ai="navigateToAi"
      @change-password="showChangePassword = true"
    />
    
    <main class="main-content" :class="{ 'sidebar-open': sidebar.sidebarOpen.value }">
      <header class="content-header">
        <div class="header-left">
          <h1>{{ flowcheck.state.selectedBucket?.descrição || flowcheck.state.selectedBucket?.bucket || 'FlowCheck' }}</h1>
        </div>
        
        <div class="header-actions">
          <button @click="flowcheck.refreshTasks" class="refresh-button" :disabled="flowcheck.state.loading">
            🔄 Atualizar
          </button>
        </div>
      </header>
      
      <div class="flowcheck-container">
        <KanbanBoard
          :selected-bucket="flowcheck.state.selectedBucket"
          :ordered-categories="flowcheck.orderedCategories.value"
          :get-tasks-by-category="flowcheck.getTasksByCategory"
          :loading="flowcheck.state.loading"
          :error="flowcheck.state.error"
          :filtered-tasks-count="flowcheck.filteredTasksCount.value"
          :total-tasks-count="flowcheck.totalTasksCount.value"
          @task-click="openTaskDetail"
          @task-drop="handleTaskDrop"
          @new-task="openTaskForm"
          @refresh="flowcheck.refreshTasks"
        />
      </div>
      
      <!-- Modal de detalhes da task -->
      <TaskDetailModal
        :is-open="showTaskDetail"
        :task="selectedTask"
        @close="closeTaskDetail"
        @edit="openTaskEditForm"
        @comment-added="handleCommentAdded"
      />
      
      <!-- Modal de formulário da task -->
      <TaskForm
        :is-open="showTaskForm"
        :mode="taskFormMode"
        :task="taskFormTask"
        :current-user="auth.state.user"
        :user-level="auth.state.user?.nivel"
        @close="closeTaskForm"
        @save="handleTaskSave"
        @delete="openDeleteConfirm"
      />
      
      <!-- Modal de confirmação de exclusão -->
      <TaskDeleteConfirm
        :is-open="showDeleteConfirm"
        :task="taskToDelete"
        @close="closeDeleteConfirm"
        @confirm="handleTaskDelete"
      />
      
      <!-- Toast para feedback de ações -->
      <div v-if="toastMessage" class="toast" :class="toastType">
        {{ toastMessage }}
      </div>
    </main>

    <ChangePasswordModal
      :is-open="showChangePassword"
      title="Alterar minha senha"
      :on-save="handleChangePassword"
      @close="showChangePassword = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useFlowCheck } from '@/composables/useFlowCheck'
import { useSidebar } from '@/composables/useSidebar'
import { useMetadata } from '@/composables/useMetadata'
import { usePermissions } from '@/composables/usePermissions'
import Sidebar from '@/components/Sidebar.vue'
import KanbanBoard from '@/components/KanbanBoard.vue'
import TaskDetailModal from '@/components/TaskDetailModal.vue'
import TaskForm from '@/components/TaskForm.vue'
import TaskDeleteConfirm from '@/components/TaskDeleteConfirm.vue'
import ChangePasswordModal from '@/components/ChangePasswordModal.vue'
import { authService } from '@/services/auth'
import { uploadTaskAttachments } from '@/services/attachments'
import { tasksService } from '@/services/tasks'
import type { Task, TaskFormData, TaskWithContext } from '@/types/flowcheck'

const router = useRouter()
const auth = useAuth()
const flowcheck = useFlowCheck()
const sidebar = useSidebar()
const metadata = useMetadata()
const permissions = usePermissions()

// Estados dos modais
const showTaskDetail = ref(false)
const selectedTask = ref<TaskWithContext | null>(null)

const showTaskForm = ref(false)
const taskFormMode = ref<'create' | 'edit'>('create')
const taskFormTask = ref<Task | null>(null)

const showDeleteConfirm = ref(false)
const taskToDelete = ref<Task | null>(null)

// Estados de feedback
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

const showChangePassword = ref(false)

async function handleChangePassword(newPassword: string) {
  await authService.updatePassword(newPassword)
}

const handleLogout = async () => {
  await auth.logout()
  router.push('/login')
}

const navigateToTags = () => {
  router.push('/tags')
}

const navigateToUsers = () => {
  router.push('/users')
}

const navigateToDashboard = () => {
  router.push('/dashboard')
}

const navigateToAi = () => {
  router.push('/ai-assistant')
}

// Gerenciamento de detalhes da task
const openTaskDetail = (task: Task) => {
  // Enrich with categoryName so TaskDetailModal shows the correct status
  const category = flowcheck.state.categories.find(c => c.id === task.id_category)
  const bucket = flowcheck.state.selectedBucket
  selectedTask.value = {
    ...task,
    categoryName: category?.category ?? '',
    bucketName: bucket?.abrev ?? bucket?.bucket ?? '',
  }
  showTaskDetail.value = true
}

const closeTaskDetail = () => {
  showTaskDetail.value = false
  selectedTask.value = null
}

// Gerenciamento do formulário de task
const openTaskForm = () => {
  taskFormMode.value = 'create'
  taskFormTask.value = null
  showTaskForm.value = true
}

const openTaskEditForm = () => {
  if (selectedTask.value) {
    // Verificar se o usuário pode editar esta task
    if (!permissions.canEditTask.value(selectedTask.value)) {
      showToast('Você só pode editar atividades que você criou.', 'error')
      return
    }
    
    taskFormMode.value = 'edit'
    taskFormTask.value = selectedTask.value
    showTaskForm.value = true
    closeTaskDetail() // Fechar modal de detalhes
  }
}

const closeTaskForm = () => {
  showTaskForm.value = false
  taskFormMode.value = 'create'
  taskFormTask.value = null
}

// Gerenciamento de exclusão
const openDeleteConfirm = () => {
  if (taskFormTask.value) {
    taskToDelete.value = taskFormTask.value
    showDeleteConfirm.value = true
    closeTaskForm() // Fechar formulário
  }
}

const closeDeleteConfirm = () => {
  showDeleteConfirm.value = false
  taskToDelete.value = null
}

// Operações CRUD
const handleTaskSave = async (taskData: TaskFormData, files: File[] = []) => {
  try {
    const userId = auth.state.user?.id_user
    const userLevel = auth.state.user?.nivel || 0
    
    if (!userId) {
      throw new Error('Usuário não autenticado')
    }

    if (taskFormMode.value === 'create') {
      const newTask = await flowcheck.addTask(taskData, userId, userLevel)
      // Upload dos anexos após criação (temos o id agora)
      if (files.length > 0) {
        const urls = await uploadTaskAttachments(newTask.id, files)
        await tasksService.updateTaskAttachments(newTask.id, urls)
        flowcheck.patchLocalTask({ ...newTask, anexo_task: urls })
      }
      showToast('Task criada com sucesso!', 'success')
    } else if (taskFormTask.value) {
      const updated = await flowcheck.updateTask(taskFormTask.value.id, taskData, userId, userLevel)
      // Upload de novos anexos (mantém os existentes)
      if (files.length > 0) {
        const existing = taskFormTask.value.anexo_task ?? []
        const newUrls = await uploadTaskAttachments(updated.id, files)
        const allUrls = [...existing, ...newUrls]
        await tasksService.updateTaskAttachments(updated.id, allUrls)
        flowcheck.patchLocalTask({ ...updated, anexo_task: allUrls })
      }
      showToast('Task atualizada com sucesso!', 'success')
    }
    
    closeTaskForm()
  } catch (error) {
    // Tratamento específico para erros de permissão
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    
    if (errorMessage.includes('não pode') || errorMessage.includes('permissão')) {
      showToast(errorMessage, 'error')
    } else {
      showToast('Erro ao salvar task. Tente novamente.', 'error')
    }
    
    console.error('Erro ao salvar task:', error)
  }
}

const handleTaskDelete = async () => {
  try {
    const userLevel = auth.state.user?.nivel || 0
    
    if (taskToDelete.value) {
      await flowcheck.removeTask(taskToDelete.value.id, userLevel)
      showToast('Task excluída com sucesso!', 'success')
      closeDeleteConfirm()
    }
  } catch (error) {
    // Tratamento específico para erros de permissão
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    
    if (errorMessage.includes('não pode') || errorMessage.includes('permissão')) {
      showToast(errorMessage, 'error')
    } else {
      showToast('Erro ao excluir task. Tente novamente.', 'error')
    }
    
    console.error('Erro ao excluir task:', error)
  }
}

const handleCommentAdded = (updatedTask: Task) => {
  flowcheck.patchLocalTask(updatedTask)
  // Atualizar a task selecionada no modal também
  if (selectedTask.value && selectedTask.value.id === updatedTask.id) {
    const category = flowcheck.state.categories.find(c => c.id === updatedTask.id_category)
    const bucket = flowcheck.state.selectedBucket
    selectedTask.value = {
      ...updatedTask,
      categoryName: category?.category ?? '',
      bucketName: bucket?.abrev ?? bucket?.bucket ?? '',
    }
  }
}

const handleTaskDrop = async (taskId: number, categoryId: number) => {  try {
    const userLevel = auth.state.user?.nivel || 0
    await flowcheck.moveTask(taskId, categoryId, userLevel)
    showToast('Task movida com sucesso!', 'success')
  } catch (error) {
    // Tratamento específico para erros de permissão de movimentação
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    
    if (errorMessage.includes('não pode mover')) {
      showToast('Você não tem permissão para mover tasks entre categorias', 'error')
    } else if (errorMessage.includes('permissão')) {
      showToast('Você não tem permissão para esta ação', 'error')
    } else {
      showToast('Erro ao mover task. Tente novamente.', 'error')
    }
    
    console.error('Erro ao mover task:', error)
  }
}

const showToast = (message: string, type: 'success' | 'error') => {
  toastMessage.value = message
  toastType.value = type
  
  setTimeout(() => {
    toastMessage.value = ''
  }, 3000)
}

onMounted(() => {
  // Carregar buckets baseado no nível do usuário
  flowcheck.loadBuckets(auth.state.user?.nivel || null)
  
  // Carregar metadados (usuários, tags, etc.)
  metadata.loadMetadata()
})
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  display: flex;
}

.main-content {
  flex: 1;
  margin-left: 280px;
  transition: margin-left 0.3s ease;
  display: flex;
  flex-direction: column;
}

.main-content:not(.sidebar-open) {
  margin-left: 80px;
}

.content-header {
  background: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
}

.content-header h1 {
  color: #333;
  margin: 0;
  font-size: 1.5rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.refresh-button {
  padding: 0.5rem 1rem;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.refresh-button:hover:not(:disabled) {
  background-color: #5a6268;
}

.refresh-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.flowcheck-container {
  flex: 1;
  padding: 2rem;
  overflow: hidden;
}

.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

.toast.success {
  background-color: #28a745;
}

.toast.error {
  background-color: #dc3545;
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

/* Responsividade */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
  
  .main-content:not(.sidebar-open) {
    margin-left: 0;
  }
}
</style>