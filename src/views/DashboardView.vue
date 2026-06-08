<template>
  <div class="home-container">
    <Sidebar
      :is-open="sidebar.sidebarOpen.value"
      :user="auth.state.user"
      :buckets="dashboard.state.buckets"
      :selected-bucket="null"
      @toggle-sidebar="sidebar.toggleSidebar"
      @select-bucket="router.push('/home')"
      @logout="handleLogout"
      @navigate-to-tags="router.push('/tags')"
      @navigate-to-users="router.push('/users')"
      @navigate-to-dashboard="router.push('/dashboard')"
      @navigate-to-ai="router.push('/ai-assistant')"
      @change-password="showChangePassword = true"
    />

    <main class="main-content" :class="{ 'sidebar-open': sidebar.sidebarOpen.value }">
      <!-- Header -->
      <header class="content-header">
        <div class="header-left">
          <h1>Relatório</h1>
        </div>
        <div class="header-actions">
          <button
            v-if="permissions.isAdmin.value"
            @click="taskFilters.toggleStandby()"
            class="standby-button"
            :class="{ 'standby-active': taskFilters.showStandby.value }"
          >
            {{ taskFilters.showStandby.value ? '🔕 Ocultar Standby' : '⏸️ Mostrar Standby' }}
          </button>
          <button
            class="refresh-button"
            :disabled="dashboard.state.loading"
            @click="reload"
          >
            🔄 Atualizar
          </button>
        </div>
      </header>

      <div class="dashboard-body">
        <!-- Loading state (req 6.2) -->
        <div v-if="dashboard.state.loading" class="state-center">
          <div class="spinner"></div>
          <p class="state-text">Carregando atividades...</p>
        </div>

        <!-- Error state (req 6.3) -->
        <div v-else-if="dashboard.state.error" class="state-center">
          <p class="error-icon">⚠️</p>
          <p class="state-text error-text">{{ dashboard.state.error }}</p>
          <button class="retry-button" @click="reload">Tentar novamente</button>
        </div>

        <template v-else>
          <!-- KPI Cards (req 3.1–3.5) -->
          <div class="kpi-row">
            <DashboardKpiCard
              label="Total Geral"
              :value="dashboard.totalCount.value"
              icon="📊"
              color="purple"
            />
            <DashboardKpiCard
              label="Total Pendente"
              :value="dashboard.kpis.value.total"
              icon="📋"
              color="blue"
            />
            <DashboardKpiCard
              label="Em Andamento"
              :value="dashboard.kpis.value.emAndamento"
              icon="⚡"
              color="orange"
            />
            <DashboardKpiCard
              label="Não Iniciado"
              :value="dashboard.kpis.value.naoIniciado"
              icon="🕐"
              color="gray"
            />
            <DashboardKpiCard
              label="Alta Prioridade"
              :value="dashboard.kpis.value.altaPrioridade"
              icon="🔥"
              color="red"
            />
            <DashboardKpiCard
              label="Concluídos"
              :value="dashboard.concluidosCount.value"
              icon="✅"
              color="green"
            />
          </div>

          <!-- Filters (req 4.1–4.5) -->
          <DashboardFilters
            :buckets="dashboard.state.buckets"
            :users="metadata.state.users"
            @filter-change="dashboard.setFilters"
          />

          <!-- Queue header -->
          <div class="queue-header">
            <span class="queue-title">
              Fila de Atividades
              <span class="queue-count">({{ dashboard.filteredTasks.value.length }})</span>
            </span>
          </div>

          <!-- Empty state -->
          <div v-if="dashboard.filteredTasks.value.length === 0" class="state-center empty">
            <p class="empty-icon">✅</p>
            <p class="state-text">Nenhuma atividade pendente</p>
          </div>

          <template v-else>
            <!-- Em Andamento group -->
            <div v-if="inProgressTasks.length > 0">
              <div class="group-label">
                <span class="group-dot in-progress-dot"></span>
                Em Andamento ({{ inProgressTasks.length }})
                <span v-if="isLevel2" class="drag-hint">· arraste para reordenar</span>
              </div>
              <draggable
                :list="inProgressTasks"
                item-key="id"
                handle=".drag-handle"
                :disabled="!isLevel2"
                ghost-class="drag-ghost"
                @end="onDragEnd"
              >
                <template #item="{ element }">
                  <div class="draggable-row">
                    <span v-if="isLevel2" class="drag-handle" title="Arrastar">⠿</span>
                    <div class="draggable-item">
                      <DashboardQueueItem :task="element" @click="openTaskDetail" />
                    </div>
                  </div>
                </template>
              </draggable>
            </div>

            <!-- Divider -->
            <div v-if="inProgressTasks.length > 0 && notStartedTasks.length > 0" class="group-divider">
              <span class="divider-label">Não Iniciado</span>
            </div>

            <!-- Não Iniciado group -->
            <div v-if="notStartedTasks.length > 0">
              <div v-if="inProgressTasks.length === 0" class="group-label">
                <span class="group-dot not-started-dot"></span>
                Não Iniciado ({{ notStartedTasks.length }})
                <span v-if="isLevel2" class="drag-hint">· arraste para reordenar</span>
              </div>
              <draggable
                :list="notStartedTasks"
                item-key="id"
                handle=".drag-handle"
                :disabled="!isLevel2"
                ghost-class="drag-ghost"
                @end="onDragEnd"
              >
                <template #item="{ element }">
                  <div class="draggable-row">
                    <span v-if="isLevel2" class="drag-handle" title="Arrastar">⠿</span>
                    <div class="draggable-item">
                      <DashboardQueueItem :task="element" @click="openTaskDetail" />
                    </div>
                  </div>
                </template>
              </draggable>
            </div>
          </template>
        </template>
      </div>

      <!-- Task detail modal (req 5.1, 5.2) -->
      <TaskDetailModal
        :is-open="showTaskDetail"
        :task="selectedTask"
        @close="closeTaskDetail"
        @edit="() => {}"
      />
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useDashboard } from '@/composables/useDashboard'
import { useSidebar } from '@/composables/useSidebar'
import { useMetadata } from '@/composables/useMetadata'
import { usePermissions } from '@/composables/usePermissions'
import { useTaskFilters } from '@/composables/useTaskFilters'
import draggable from 'vuedraggable'
import Sidebar from '@/components/Sidebar.vue'
import DashboardKpiCard from '@/components/DashboardKpiCard.vue'
import DashboardFilters from '@/components/DashboardFilters.vue'
import DashboardQueueItem from '@/components/DashboardQueueItem.vue'
import TaskDetailModal from '@/components/TaskDetailModal.vue'
import ChangePasswordModal from '@/components/ChangePasswordModal.vue'
import { authService } from '@/services/auth'
import type { TaskWithContext } from '@/types/flowcheck'

const router = useRouter()
const auth = useAuth()
const dashboard = useDashboard()
const sidebar = useSidebar()
const metadata = useMetadata()

const permissions = usePermissions()
const isLevel2 = computed(() => permissions.canReorderDashboard.value)
const taskFilters = useTaskFilters()

// Split filtered tasks into two groups for rendering
const inProgressTasks = computed(() =>
  dashboard.filteredTasks.value.filter(t => t.categoryName === 'Em Andamento')
)
const notStartedTasks = computed(() =>
  dashboard.filteredTasks.value.filter(t => t.categoryName === 'Não Iniciado')
)

// Task detail modal state
const showTaskDetail = ref(false)
const selectedTask = ref<TaskWithContext | null>(null)

const openTaskDetail = (task: TaskWithContext) => {
  selectedTask.value = task
  showTaskDetail.value = true
}

const closeTaskDetail = () => {
  showTaskDetail.value = false
  selectedTask.value = null
}

const reload = () => {
  const userLevel = auth.state.user?.nivel ?? 0
  dashboard.loadAllTasks(userLevel)
}

const showChangePassword = ref(false)

async function handleChangePassword(newPassword: string) {
  await authService.updatePassword(newPassword)
}

const handleLogout = async () => {
  await auth.logout()
  router.push('/login')
}

// After any drag ends, persist the combined order: Em Andamento first, then Não Iniciado
const onDragEnd = async () => {
  const orderedIds = [
    ...inProgressTasks.value.map(t => t.id),
    ...notStartedTasks.value.map(t => t.id),
  ]
  try {
    await dashboard.reorderTasks(orderedIds)
  } catch (e) {
    console.error('Erro ao salvar ordem:', e)
  }
}

onMounted(() => {
  reload()
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

/* Header */
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

.content-header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
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

.standby-button {
  padding: 0.5rem 1rem;
  background-color: #e9ecef;
  color: #495057;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
}

.standby-button:hover { background-color: #dee2e6; }

.standby-button.standby-active {
  background-color: #fff3cd;
  color: #856404;
  border-color: #ffc107;
}

/* Body */
.dashboard-body {
  flex: 1;
  padding: 1.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* KPI row */
.kpi-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Queue */
.queue-header {
  display: flex;
  align-items: center;
}

.queue-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #495057;
}

.queue-count {
  color: #6c757d;
  font-weight: 400;
  margin-left: 0.25rem;
}

.queue-list {
  display: flex;
  flex-direction: column;
}

/* Drag and drop */
.draggable-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.drag-handle {
  color: #adb5bd;
  cursor: grab;
  font-size: 1.1rem;
  padding: 0 2px;
  flex-shrink: 0;
  user-select: none;
  line-height: 1;
}

.drag-handle:active {
  cursor: grabbing;
}

.draggable-item {
  flex: 1;
  min-width: 0;
}

.drag-ghost {
  opacity: 0.4;
  background: #e8eaf6;
}

/* Group labels */
.group-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.group-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.in-progress-dot { background-color: #f59e0b; }
.not-started-dot  { background-color: #94a3b8; }

.drag-hint {
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
  color: #adb5bd;
}

/* Divider between groups */
.group-divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1rem 0 0.75rem;
  color: #adb5bd;
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.group-divider::before,
.group-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e9ecef;
}

.divider-label {
  white-space: nowrap;
}

/* States */
.state-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 0.75rem;
}

.state-center.empty {
  background: white;
  border-radius: 10px;
  border: 1px solid #e9ecef;
}

.state-text {
  margin: 0;
  color: #6c757d;
  font-size: 0.95rem;
}

.error-text {
  color: #dc3545;
}

.empty-icon,
.error-icon {
  font-size: 2.5rem;
  margin: 0;
}

/* Spinner */
.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e9ecef;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Retry button */
.retry-button {
  padding: 0.5rem 1.25rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.2s;
}

.retry-button:hover {
  background: #5a6fd6;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }

  .main-content:not(.sidebar-open) {
    margin-left: 0;
  }

  .dashboard-body {
    padding: 1rem;
  }

  .kpi-row {
    flex-direction: column;
  }
}
</style>
