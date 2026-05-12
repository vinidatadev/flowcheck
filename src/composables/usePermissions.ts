import { computed } from 'vue'
import { useAuth } from './useAuth'
import type { Task } from '@/types/flowcheck'

export function usePermissions() {
  const auth = useAuth()

  const userLevel = computed(() => auth.state.user?.nivel || 0)
  const currentUserId = computed(() => auth.state.user?.id_user || '')

  // Níveis:
  // 1 = Usuário padrão (só TaskInbox, formulário simplificado)
  // 2 = Admin (acesso total)
  // 3 = Gestor Visualizador (todos os buckets, sem reordenar relatório)
  // 4 = Gestor Ordenador (todos os buckets, pode reordenar relatório)

  const canCreateTask = computed(() => userLevel.value >= 1)

  const canEditTask = computed(() => {
    return (task: Task) => {
      if (userLevel.value === 2) return true // Admin edita tudo
      // Níveis 1, 3 e 4 só editam as próprias tasks
      return task.criado_por === currentUserId.value
    }
  })

  // Só admin (2) pode mover tasks entre colunas no kanban
  const canMoveTask = computed(() => userLevel.value === 2)

  // Só admin (2) pode excluir tasks
  const canDeleteTask = computed(() => userLevel.value === 2)

  // Pode reordenar a fila no relatório: admin (2) e gestor ordenador (4)
  const canReorderDashboard = computed(() =>
    userLevel.value === 2 || userLevel.value === 4
  )

  // Vê todos os buckets: admin (2), gestor visualizador (3), gestor ordenador (4)
  const canSeeAllBuckets = computed(() => userLevel.value >= 2)

  // Formulário completo: só admin (2)
  const hasFullForm = computed(() => userLevel.value === 2)

  // Bucket selecionável no AI: admin (2), gestor visualizador (3), gestor ordenador (4)
  const canSelectBucket = computed(() => userLevel.value >= 2)

  const isAdmin = computed(() => userLevel.value === 2)
  const isRestrictedUser = computed(() => userLevel.value === 1)

  const isTaskOwner = (task: Task): boolean =>
    task.criado_por === currentUserId.value

  return {
    userLevel,
    currentUserId,
    canCreateTask,
    canEditTask,
    canMoveTask,
    canDeleteTask,
    canReorderDashboard,
    canSeeAllBuckets,
    hasFullForm,
    canSelectBucket,
    isAdmin,
    isRestrictedUser,
    isTaskOwner,
  }
}