import { reactive, computed, ref } from 'vue'
import { dashboardService } from '@/services/dashboard'
import { bucketsService } from '@/services/buckets'
import { tasksService } from '@/services/tasks'
import { useTaskFilters } from './useTaskFilters'
import type { TaskWithContext, Bucket } from '@/types/flowcheck'

interface DashboardState {
  tasks: TaskWithContext[]
  buckets: Bucket[]
  loading: boolean
  error: string | null
}

interface DashboardFilters {
  bucketIds: number[]
  status: 'all' | 'not_started' | 'in_progress'
  responsaveis: string[]
}

const STATUS_MAP: Record<'not_started' | 'in_progress', string> = {
  not_started: 'Não Iniciado',
  in_progress: 'Em Andamento'
}

const state = reactive<DashboardState>({
  tasks: [],
  buckets: [],
  loading: false,
  error: null
})

const allTasks = ref<TaskWithContext[]>([])
const lastUserLevel = ref(0)

const filters = reactive<DashboardFilters>({
  bucketIds: [],
  status: 'all',
  responsaveis: []
})

export function useDashboard() {
  const { getFilteredTasks, showStandby } = useTaskFilters()

  const filteredTasks = computed<TaskWithContext[]>(() => {
    let result = state.tasks

    if (filters.bucketIds.length > 0) {
      result = result.filter(t => t.id_bucket !== null && filters.bucketIds.includes(t.id_bucket))
    }

    if (filters.status !== 'all') {
      const targetCategory = STATUS_MAP[filters.status]
      result = result.filter(t => t.categoryName === targetCategory)
    }

    if (filters.responsaveis.length > 0) {
      result = result.filter(t =>
        t.responsavel && t.responsavel.some(r => filters.responsaveis.includes(r))
      )
    }

    // Apply Standby visibility from useTaskFilters (shared state)
    result = getFilteredTasks(result) as TaskWithContext[]

    // Sort: Em Andamento first, then Não Iniciado.
    // Within each group: by display_order (nulls last), then created_at asc.
    return [...result].sort((a, b) => {
      const aInProgress = a.categoryName === 'Em Andamento'
      const bInProgress = b.categoryName === 'Em Andamento'
      if (aInProgress && !bInProgress) return -1
      if (!aInProgress && bInProgress) return 1

      const aOrder = a.display_order ?? Number.MAX_SAFE_INTEGER
      const bOrder = b.display_order ?? Number.MAX_SAFE_INTEGER
      if (aOrder !== bOrder) return aOrder - bOrder

      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    })
  })

  const kpis = computed(() => {
    const tasks = filteredTasks.value
    // Filtrar apenas tasks não concluídas para contagens de pendência
    const tarefasPendentes = tasks.filter(t => !t.status_concluido)
    
    const emAndamento = tarefasPendentes.filter(t => t.categoryName === 'Em Andamento')
    const naoIniciado = tarefasPendentes.filter(t => t.categoryName === 'Não Iniciado')
    const altaPrioridade = tarefasPendentes.filter(t => t.prioridade === true)

    const progressValues = emAndamento.map(t => t.percenti_concluido ?? 0)
    const mediaProgresso = progressValues.length > 0
      ? Math.round(progressValues.reduce((sum, v) => sum + v, 0) / progressValues.length)
      : 0

    return {
      total: tarefasPendentes.length,
      emAndamento: emAndamento.length,
      naoIniciado: naoIniciado.length,
      altaPrioridade: altaPrioridade.length,
      mediaProgresso
    }
  })

  // filteredAllTasks: applies the same bucket/status/responsavel/standby filters
  // but over ALL tasks (including concluídos) so totalCount and concluidosCount
  // react to filter changes instead of always showing the global DB value.
  const filteredAllTasks = computed<TaskWithContext[]>(() => {
    let result = allTasks.value

    if (filters.bucketIds.length > 0) {
      result = result.filter(t => t.id_bucket !== null && filters.bucketIds.includes(t.id_bucket))
    }

    if (filters.responsaveis.length > 0) {
      result = result.filter(t =>
        t.responsavel && t.responsavel.some(r => filters.responsaveis.includes(r))
      )
    }

    return getFilteredTasks(result) as TaskWithContext[]
  })

  const totalCount = computed(() => filteredAllTasks.value.length)

  const concluidosCount = computed(() =>
    filteredAllTasks.value.filter(t => t.status_concluido).length
  )

  const hasActiveFilters = computed(() =>
    filters.bucketIds.length > 0 ||
    filters.status !== 'all' ||
    filters.responsaveis.length > 0
  )

  const loadAllTasks = async (userLevel: number) => {
    try {
      state.loading = true
      state.error = null

      const [tasks, allTasksData, buckets] = await Promise.all([
        dashboardService.getAllActiveTasks(userLevel),
        dashboardService.getAllTasksWithContext(userLevel),
        bucketsService.getBucketsByUserLevel(userLevel),
      ])

      state.tasks = tasks
      allTasks.value = allTasksData
      state.buckets = buckets
      lastUserLevel.value = userLevel
    } catch (error) {
      state.error = error instanceof Error ? error.message : 'Erro ao carregar dados do dashboard'
    } finally {
      state.loading = false
    }
  }

  /**
   * Called after a drag-and-drop reorder.
   * `orderedIds` is the full list of task IDs in the new desired order
   * (Em Andamento group first, then Não Iniciado group).
   * Assigns sequential display_order values and persists to Supabase.
   */
  const reorderTasks = async (orderedIds: number[]) => {
    // Optimistic update
    const orderMap = new Map(orderedIds.map((id, i) => [id, i + 1]))
    for (const task of state.tasks) {
      const newOrder = orderMap.get(task.id)
      if (newOrder !== undefined) task.display_order = newOrder
    }

    // Persist
    const updates = orderedIds.map((id, i) => ({ id, display_order: i + 1 }))
    await tasksService.updateDisplayOrder(updates)
  }

  const setFilters = (newFilters: Partial<DashboardFilters>) => {
    if (newFilters.bucketIds !== undefined) filters.bucketIds = newFilters.bucketIds
    if (newFilters.status !== undefined) filters.status = newFilters.status
    if (newFilters.responsaveis !== undefined) filters.responsaveis = newFilters.responsaveis
  }

  const resetFilters = () => {
    filters.bucketIds = []
    filters.status = 'all'
    filters.responsaveis = []
  }

  return {
    state,
    filters,
    filteredTasks,
    kpis,
    totalCount,
    concluidosCount,
    hasActiveFilters,
    loadAllTasks,
    reorderTasks,
    setFilters,
    resetFilters
  }
}
