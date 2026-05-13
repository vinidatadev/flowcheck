import { reactive, computed, ref } from 'vue'
import type { Task } from '@/types/flowcheck'

const STANDBY_TAG = 'Standby'

export interface TaskFilters {
  responsavel: string[]
  solicitante: string[]
  tags: string[]
  tags_processo: string[]
}

const filters = reactive<TaskFilters>({
  responsavel: [],
  solicitante: [],
  tags: [],
  tags_processo: []
})

// Hidden by default — Standby tasks are not shown unless toggled on
const showStandby = ref(false)

export function useTaskFilters() {
  const setResponsavelFilter = (responsaveis: string[]) => {
    filters.responsavel = [...responsaveis]
  }

  const setSolicitanteFilter = (solicitantes: string[]) => {
    filters.solicitante = [...solicitantes]
  }

  const setTagsFilter = (tags: string[]) => {
    filters.tags = [...tags]
  }

  const setTagsProcessoFilter = (tagsProcesso: string[]) => {
    filters.tags_processo = [...tagsProcesso]
  }

  const resetFilters = () => {
    filters.responsavel = []
    filters.solicitante = []
    filters.tags = []
    filters.tags_processo = []
  }

  const toggleStandby = () => {
    showStandby.value = !showStandby.value
  }

  const getFilteredTasks = (tasks: Task[]): Task[] => {
    return tasks.filter(task => {
      // Hide Standby tasks unless toggled on
      const isStandby = task.tag?.includes(STANDBY_TAG) ?? false
      if (isStandby && !showStandby.value) return false

      if (filters.responsavel.length > 0) {
        if (!task.responsavel || !task.responsavel.some(r => filters.responsavel.includes(r))) return false
      }

      if (filters.solicitante.length > 0) {
        if (!task.solicitante || !task.solicitante.some(s => filters.solicitante.includes(s))) return false
      }

      if (filters.tags.length > 0) {
        if (!task.tag || !task.tag.some(t => filters.tags.includes(t))) return false
      }

      if (filters.tags_processo.length > 0) {
        if (!task.tag_processo || !task.tag_processo.some(tp => filters.tags_processo.includes(tp))) return false
      }

      return true
    })
  }

  const hasActiveFilters = computed(() =>
    filters.responsavel.length > 0 ||
    filters.solicitante.length > 0 ||
    filters.tags.length > 0 ||
    filters.tags_processo.length > 0
  )

  const getActiveFiltersCount = computed(() => {
    let count = 0
    if (filters.responsavel.length > 0) count++
    if (filters.solicitante.length > 0) count++
    if (filters.tags.length > 0) count++
    if (filters.tags_processo.length > 0) count++
    return count
  })

  return {
    filters,
    showStandby,
    toggleStandby,
    setResponsavelFilter,
    setSolicitanteFilter,
    setTagsFilter,
    setTagsProcessoFilter,
    resetFilters,
    getFilteredTasks,
    hasActiveFilters,
    getActiveFiltersCount,
  }
}