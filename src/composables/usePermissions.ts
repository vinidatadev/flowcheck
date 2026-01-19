import { computed } from 'vue'
import { useAuth } from './useAuth'
import type { Task } from '@/types/flowcheck'

export function usePermissions() {
  const auth = useAuth()

  const userLevel = computed(() => auth.state.user?.nivel || 0)
  const currentUserId = computed(() => auth.state.user?.id_user || '')

  // Permissões baseadas no nível do usuário
  const canCreateTask = computed(() => {
    return userLevel.value >= 1 // Nível 1 e 2 podem criar
  })

  const canEditTask = computed(() => {
    return (task: Task) => {
      if (userLevel.value >= 2) {
        return true // Admin pode editar qualquer task
      }
      if (userLevel.value === 1) {
        return task.criado_por === currentUserId.value // User só edita próprias tasks
      }
      return false
    }
  })

  const canMoveTask = computed(() => {
    return userLevel.value >= 2 // Apenas nível 2 pode mover
  })

  const canDeleteTask = computed(() => {
    return userLevel.value >= 2 // Apenas nível 2 pode excluir
  })

  // Função para verificar se o usuário é admin
  const isAdmin = computed(() => {
    return userLevel.value === 2
  })

  // Função para verificar se o usuário tem acesso restrito
  const isRestrictedUser = computed(() => {
    return userLevel.value === 1
  })

  // Função para verificar se o usuário é o criador da task
  const isTaskOwner = (task: Task): boolean => {
    return task.criado_por === currentUserId.value
  }

  return {
    userLevel,
    currentUserId,
    canCreateTask,
    canEditTask,
    canMoveTask,
    canDeleteTask,
    isAdmin,
    isRestrictedUser,
    isTaskOwner
  }
}