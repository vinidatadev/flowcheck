<template>
  <div class="ai-assistant-container">
    <Sidebar
      :is-open="sidebar.sidebarOpen.value"
      :user="auth.state.user"
      :buckets="flowcheck.state.buckets"
      :selected-bucket="flowcheck.state.selectedBucket"
      @toggle-sidebar="sidebar.toggleSidebar"
      @select-bucket="handleSelectBucket"
      @logout="handleLogout"
      @navigate-to-tags="router.push('/tags')"
      @navigate-to-users="router.push('/users')"
      @navigate-to-dashboard="router.push('/dashboard')"
      @navigate-to-ai="router.push('/ai-assistant')"
      @change-password="showChangePassword = true"
    />

    <main class="main-content" :class="{ 'sidebar-open': sidebar.sidebarOpen.value }">
      <!-- Loading state -->
      <div v-if="metadataLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Carregando assistente...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="metadataError" class="error-state">
        <p>⚠️ {{ metadataError }}</p>
        <button @click="loadData" class="retry-btn">Tentar novamente</button>
      </div>

      <!-- Chat -->
      <div v-else class="chat-wrapper">
        <AiChat
          :messages="assistant.messages.value"
          :loading="assistant.loading.value"
          :is-complete="assistant.isComplete.value"
          @send="assistant.sendMessage"
          @reset="assistant.reset"
          @open-form="openTaskForm"
        />
      </div>
    </main>

    <!-- TaskForm modal -->
    <TaskForm
      :is-open="showTaskForm"
      mode="create"
      :task="prefillTask"
      :current-user="auth.state.user"
      :user-level="auth.state.user?.nivel"
      @close="showTaskForm = false"
      @save="handleTaskSave"
    />

    <!-- Toast -->
    <div v-if="toastMessage" class="toast" :class="toastType">
      {{ toastMessage }}
    </div>

    <ChangePasswordModal
      :is-open="showChangePassword"
      title="Alterar minha senha"
      :on-save="handleChangePassword"
      @close="showChangePassword = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useFlowCheck } from '@/composables/useFlowCheck'
import { useSidebar } from '@/composables/useSidebar'
import { useMetadata } from '@/composables/useMetadata'
import { useAiAssistant } from '@/composables/useAiAssistant'
import { bucketsService } from '@/services/buckets'
import { tasksService } from '@/services/tasks'
import { categoriesService } from '@/services/categories'
import Sidebar from '@/components/Sidebar.vue'
import AiChat from '@/components/AiChat.vue'
import TaskForm from '@/components/TaskForm.vue'
import ChangePasswordModal from '@/components/ChangePasswordModal.vue'
import { authService } from '@/services/auth'
import type { TaskFormData, Task, Bucket } from '@/types/flowcheck'

const router = useRouter()
const auth = useAuth()
const flowcheck = useFlowCheck()
const sidebar = useSidebar()
const metadata = useMetadata()

// ── Local state ──────────────────────────────────────────────────────────────

const metadataLoading = ref(false)
const metadataError = ref<string | null>(null)
const buckets = ref<Bucket[]>([])

const showTaskForm = ref(false)
// TaskForm expects a Task | null for pre-fill; we pass null and rely on
// the watch inside TaskForm that resets the form on open. Instead we
// intercept via a reactive prefill object cast as Task so the form
// populates correctly when mode === 'create'.
const prefillTask = ref<Task | null>(null)

const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

// ── Computed context for the assistant ───────────────────────────────────────

const userLevel = computed(() => auth.state.user?.nivel ?? null)

// ── Load data ────────────────────────────────────────────────────────────────

async function loadData() {
  metadataLoading.value = true
  metadataError.value = null
  try {
    await Promise.all([
      metadata.loadMetadata(),
      loadBuckets(),
    ])
  } catch (err) {
    metadataError.value = err instanceof Error ? err.message : 'Erro ao carregar dados'
  } finally {
    metadataLoading.value = false
  }
}

async function loadBuckets() {
  buckets.value = await bucketsService.getBucketsByUserLevel(userLevel.value)
}

// ── Assistant (initialised after data is loaded) ─────────────────────────────

// We use a lazy ref pattern: assistant is created once metadata is ready.
// Since useAiAssistant calls init() immediately in its constructor, we
// initialise it after loadData() resolves so the system prompt has real data.
const assistant = useAiAssistant({
  get users() { return metadata.state.users },
  get tags() { return metadata.state.tags },
  get tagsProcesso() { return metadata.state.tagsProcesso },
  get buckets() { return buckets.value },
  get userLevel() { return userLevel.value },
})

// ── Task form ────────────────────────────────────────────────────────────────

function openTaskForm() {
  // Build a partial Task object so TaskForm pre-populates in create mode.
  // TaskForm reads props.task only when mode === 'edit', but we pass the
  // collected data as a Task-shaped object so the watcher in TaskForm
  // can pick it up. Since TaskForm resets on open, we patch formData
  // by passing the collected values through the task prop.
  const formData = assistant.buildTaskFormData()

  // Cast to Task so the prop type is satisfied; TaskForm only reads the
  // fields that overlap with TaskFormData when mode === 'edit'.
  prefillTask.value = {
    id: 0,
    created_at: '',
    titulo_task: formData.titulo_task,
    descricao: formData.descricao,
    ganhos: formData.ganhos,
    responsavel: formData.responsavel,
    tag: formData.tag,
    tag_processo: formData.tag_processo,
    projeto: formData.projeto,
    prioridade: formData.prioridade,
    percenti_concluido: formData.percenti_concluido,
    data_inicio: formData.data_inicio,
    data_fim: formData.data_fim,
    subtask: formData.subtask,
    subtask_bool: formData.subtask_bool,
    solicitante: formData.solicitante,
    pos_s4hana: formData.pos_s4hana,
    id_bucket: null,
    id_category: null,
    status_concluido: false,
    comentarios: null,
    criado_por: null,
    modificado_por: null,
  }

  showTaskForm.value = true
}

async function handleTaskSave(taskData: TaskFormData) {
  const userId = auth.state.user?.id_user
  const level = userLevel.value ?? 0

  if (!userId) {
    showToast('Usuário não autenticado.', 'error')
    return
  }

  try {
    // Determine target bucket
    let targetBucketId: number

    if (level === 1) {
      // Level 1: always use TaskInbox
      const inbox = buckets.value.find(b => b.bucket === 'TaskInbox')
      if (!inbox) throw new Error('Bucket TaskInbox não encontrado.')
      targetBucketId = inbox.id
    } else {
      // Level 2: use bucket chosen by the assistant, fallback to first bucket
      const collectedBucketId = assistant.collectedData.value?.bucketId
      if (collectedBucketId) {
        targetBucketId = collectedBucketId
      } else if (buckets.value.length > 0) {
        targetBucketId = buckets.value[0].id
      } else {
        throw new Error('Nenhum bucket disponível.')
      }
    }

    // Ensure default categories exist and get the first one ("Não Iniciado")
    await categoriesService.ensureDefaultCategories(targetBucketId)
    const categories = await categoriesService.getCategoriesByBucket(targetBucketId)
    const order = ['Não Iniciado', 'Em Andamento', 'Concluidos']
    const sorted = [...categories].sort(
      (a, b) => order.indexOf(a.category ?? '') - order.indexOf(b.category ?? '')
    )
    const defaultCategory = sorted[0]
    if (!defaultCategory) throw new Error('Nenhuma categoria encontrada no bucket.')

    await tasksService.createTask(taskData, targetBucketId, defaultCategory.id, userId, level)

    showTaskForm.value = false
    showToast('Task criada com sucesso!', 'success')
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao criar task.'
    showToast(msg, 'error')
    console.error('Erro ao criar task via assistente:', err)
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function showToast(message: string, type: 'success' | 'error') {
  toastMessage.value = message
  toastType.value = type
  setTimeout(() => { toastMessage.value = '' }, 3000)
}

const showChangePassword = ref(false)

async function handleChangePassword(newPassword: string) {
  await authService.updatePassword(newPassword)
}

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}

function handleSelectBucket(bucket: import('@/types/flowcheck').Bucket) {
  flowcheck.selectBucket(bucket)
  router.push('/home')
}

// ── Lifecycle ────────────────────────────────────────────────────────────────

onMounted(async () => {
  // Load sidebar buckets for the Sidebar component
  flowcheck.loadBuckets(userLevel.value)
  await loadData()
  // Re-initialise assistant now that metadata is populated
  assistant.reset()
})
</script>

<style scoped>
.ai-assistant-container {
  min-height: 100vh;
  background-color: #0f1117;
  display: flex;
}

.main-content {
  flex: 1;
  margin-left: 280px;
  transition: margin-left 0.3s ease;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  min-height: 100vh;
  box-sizing: border-box;
}

.main-content:not(.sidebar-open) {
  margin-left: 80px;
}

/* ── Loading / Error ── */
.loading-state,
.error-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: #94a3b8;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(102, 126, 234, 0.2);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.retry-btn {
  padding: 0.5rem 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
}

.retry-btn:hover {
  opacity: 0.9;
}

/* ── Chat wrapper ── */
.chat-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  min-height: 0;
}

/* AiChat fills the wrapper */
.chat-wrapper :deep(.ai-chat) {
  flex: 1;
  min-height: 0;
  height: calc(100vh - 3rem);
}

/* ── Toast ── */
.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  z-index: 1100;
  animation: slideIn 0.3s ease;
}

.toast.success { background-color: #28a745; }
.toast.error   { background-color: #dc3545; }

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .main-content,
  .main-content:not(.sidebar-open) {
    margin-left: 0;
    padding: 0.75rem;
  }

  .chat-wrapper :deep(.ai-chat) {
    height: calc(100vh - 1.5rem);
  }
}
</style>
