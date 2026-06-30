import { reactive, computed } from 'vue'
import { bucketsService } from '@/services/buckets'
import { categoriesService } from '@/services/categories'
import { tasksService } from '@/services/tasks'
import { useTaskFilters } from './useTaskFilters'
import type { FlowCheckState, Bucket, Category, Task, TaskFormData } from '@/types/flowcheck'

const state = reactive<FlowCheckState>({
  buckets: [],
  selectedBucket: null,
  categories: [],
  tasks: [],
  loading: false,
  error: null
})

export function useFlowCheck() {
  const { getFilteredTasks } = useTaskFilters()

  const loadBuckets = async (userLevel: number | null) => {
    try {
      state.loading = true
      state.error = null
      
      const buckets = await bucketsService.getBucketsByUserLevel(userLevel)
      state.buckets = buckets
      
      // Se há buckets e nenhum está selecionado, selecionar o primeiro
      if (buckets.length > 0 && !state.selectedBucket) {
        await selectBucket(buckets[0])
      }
    } catch (error) {
      state.error = error instanceof Error ? error.message : 'Erro ao carregar buckets'
    } finally {
      state.loading = false
    }
  }

  const selectBucket = async (bucket: Bucket) => {
    try {
      state.loading = true
      state.error = null
      state.selectedBucket = bucket

      // Garantir que o bucket tenha as categorias padrão
      await categoriesService.ensureDefaultCategories(bucket.id)
      
      // Carregar categorias e tasks do bucket selecionado
      const [categories, tasks] = await Promise.all([
        categoriesService.getCategoriesByBucket(bucket.id),
        tasksService.getTasksByBucket(bucket.id)
      ])

      state.categories = categories
      state.tasks = tasks
    } catch (error) {
      state.error = error instanceof Error ? error.message : 'Erro ao selecionar bucket'
    } finally {
      state.loading = false
    }
  }

  const getTasksByCategory = (categoryId: number): Task[] => {
    const filteredTasks = getFilteredTasks(state.tasks)
    return filteredTasks.filter(task => task.id_category === categoryId)
  }

  const refreshTasks = async () => {
    if (!state.selectedBucket) return

    try {
      const tasks = await tasksService.getTasksByBucket(state.selectedBucket.id)
      state.tasks = tasks
    } catch (error) {
      state.error = error instanceof Error ? error.message : 'Erro ao atualizar tasks'
    }
  }

  const moveTask = async (taskId: number, newCategoryId: number, userLevel: number) => {
    try {
      // Encontrar a task e a nova categoria
      const task = state.tasks.find(t => t.id === taskId)
      const newCategory = state.categories.find(c => c.id === newCategoryId)
      
      if (!task || !newCategory) {
        throw new Error('Task ou categoria não encontrada')
      }

      // Determinar se deve marcar como concluído
      const statusConcluido = newCategory.category === 'Concluidos'

      // Calcular datas reais baseado na fase destino
      const now = new Date().toISOString()
      const oldCategory = state.categories.find(c => c.id === task.id_category)
      const oldCategoryName = oldCategory?.category ?? ''
      const newCategoryName = newCategory.category ?? ''

      let data_inicio = task.data_inicio
      let data_fim = task.data_fim
      let percenti_concluido = task.percenti_concluido ?? 0

      if (newCategoryName === 'Em Andamento') {
        // Preenche início real apenas se ainda não tiver
        if (!data_inicio) data_inicio = now
        // Volta de Concluidos: limpa data de fim e zera progresso
        if (oldCategoryName === 'Concluidos') {
          data_fim = null
          percenti_concluido = 0
        }
      } else if (newCategoryName === 'Concluidos') {
        // Garante início real preenchido, seta fim real e 100%
        if (!data_inicio) data_inicio = now
        data_fim = now
        percenti_concluido = 100
      } else if (newCategoryName === 'Não Iniciado') {
        // Volta para o início: limpa datas reais e zera progresso
        data_inicio = null
        data_fim = null
        percenti_concluido = 0
      }

      // Backup do estado anterior para rollback em caso de erro
      const oldCategoryId = task.id_category
      const oldStatusConcluido = task.status_concluido
      const oldDataInicio = task.data_inicio
      const oldDataFim = task.data_fim
      const oldPercenti = task.percenti_concluido

      // Atualização otimista na UI
      task.id_category = newCategoryId
      task.status_concluido = statusConcluido
      task.data_inicio = data_inicio
      task.data_fim = data_fim
      task.percenti_concluido = percenti_concluido

      try {
        // Atualizar no Supabase
        await tasksService.updateTaskCategory(taskId, newCategoryId, statusConcluido, userLevel, data_inicio, data_fim, percenti_concluido)
      } catch (error) {
        // Rollback em caso de erro
        task.id_category = oldCategoryId
        task.status_concluido = oldStatusConcluido
        task.data_inicio = oldDataInicio
        task.data_fim = oldDataFim
        task.percenti_concluido = oldPercenti
        throw error
      }
    } catch (error) {
      state.error = error instanceof Error ? error.message : 'Erro ao mover task'
      throw error
    }
  }

  const addTask = async (taskData: TaskFormData, userId: string, userLevel: number): Promise<Task> => {
    if (!state.selectedBucket) {
      throw new Error('Nenhum bucket selecionado')
    }

    // Usar a primeira categoria (Não Iniciado) como padrão
    const defaultCategory = orderedCategories.value[0]
    if (!defaultCategory) {
      throw new Error('Nenhuma categoria encontrada')
    }

    try {
      const newTask = await tasksService.createTask(
        taskData,
        state.selectedBucket.id,
        defaultCategory.id,
        userId,
        userLevel
      )

      // Adicionar à lista local
      state.tasks.unshift(newTask)
      
      return newTask
    } catch (error) {
      state.error = error instanceof Error ? error.message : 'Erro ao criar task'
      throw error
    }
  }

  const updateTask = async (taskId: number, taskData: TaskFormData, userId: string, userLevel: number): Promise<Task> => {
    try {
      const updatedTask = await tasksService.updateTask(taskId, taskData, userId, userLevel)
      
      // Atualizar na lista local
      const index = state.tasks.findIndex(t => t.id === taskId)
      if (index !== -1) {
        state.tasks[index] = updatedTask
      }
      
      return updatedTask
    } catch (error) {
      state.error = error instanceof Error ? error.message : 'Erro ao atualizar task'
      throw error
    }
  }

  // Atualiza uma task já existente na lista local (ex: após adicionar comentário)
  const patchLocalTask = (updatedTask: Task) => {
    const index = state.tasks.findIndex(t => t.id === updatedTask.id)
    if (index !== -1) {
      state.tasks[index] = updatedTask
    }
  }

  const removeTask = async (taskId: number, userLevel: number): Promise<void> => {
    try {
      await tasksService.deleteTask(taskId, userLevel)
      
      // Remover da lista local
      const index = state.tasks.findIndex(t => t.id === taskId)
      if (index !== -1) {
        state.tasks.splice(index, 1)
      }
    } catch (error) {
      state.error = error instanceof Error ? error.message : 'Erro ao deletar task'
      throw error
    }
  }

  // Computed para organizar categorias na ordem correta
  const orderedCategories = computed(() => {
    const order = ['Não Iniciado', 'Em Andamento', 'Concluidos']
    return state.categories.sort((a, b) => {
      const indexA = order.indexOf(a.category || '')
      const indexB = order.indexOf(b.category || '')
      return indexA - indexB
    })
  })

  // Computed para contar tasks filtradas
  const filteredTasksCount = computed(() => {
    return getFilteredTasks(state.tasks).length
  })

  const totalTasksCount = computed(() => {
    return state.tasks.length
  })

  return {
    state,
    loadBuckets,
    selectBucket,
    getTasksByCategory,
    refreshTasks,
    moveTask,
    addTask,
    updateTask,
    patchLocalTask,
    removeTask,
    orderedCategories,
    filteredTasksCount,
    totalTasksCount
  }
}