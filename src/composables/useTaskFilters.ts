import { reactive, computed } from 'vue'
import type { Task } from '@/types/flowcheck'

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

  const getFilteredTasks = (tasks: Task[]): Task[] => {
    return tasks.filter(task => {
      // Filtro por responsável (OR logic)
      if (filters.responsavel.length > 0) {
        if (!task.responsavel || !task.responsavel.some(resp => filters.responsavel.includes(resp))) {
          return false
        }
      }

      // Filtro por solicitante (OR logic)
      if (filters.solicitante.length > 0) {
        if (!task.solicitante || !task.solicitante.some(sol => filters.solicitante.includes(sol))) {
          return false
        }
      }

      // Filtro por tags (OR logic)
      if (filters.tags.length > 0) {
        if (!task.tag || !task.tag.some(tag => filters.tags.includes(tag))) {
          return false
        }
      }

      // Filtro por tags de processo (OR logic)
      if (filters.tags_processo.length > 0) {
        if (!task.tag_processo || !task.tag_processo.some(tagProcesso => filters.tags_processo.includes(tagProcesso))) {
          return false
        }
      }

      return true
    })
  }

  const hasActiveFilters = computed(() => {
    return !!(
      filters.responsavel.length > 0 ||
      filters.solicitante.length > 0 ||
      filters.tags.length > 0 ||
      filters.tags_processo.length > 0
    )
  })

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
    setResponsavelFilter,
    setSolicitanteFilter,
    setTagsFilter,
    setTagsProcessoFilter,
    resetFilters,
    getFilteredTasks,
    hasActiveFilters,
    getActiveFiltersCount
  }
}