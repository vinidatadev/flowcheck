import { computed } from 'vue'
import { useAuth } from './useAuth'
import type { Task } from '@/types/flowcheck'

export function usePermissions() {
  const auth = useAuth()

  const userLevel = computed(() => auth.state.user?.nivel || 0)
  const currentUserId = computed(() => auth.state.user?.id_user || '')

  // Níveis:
  // 1 = Usuário padrão (TaskInbox)
  // 2 = Admin (acesso total)
  // 3 = Gestor Visualizador (todos os buckets, sem reordenar relatório)
  // 4 = Gestor Ordenador (todos os buckets, pode reordenar relatório)
  // 5 = Usuário CA (Central de Atendimento)
  // 6 = Usuário PI (Planejamento Integrado)
  // 7 = Usuário PE (Planejamento Estratégico)
  // 8 = Usuário GP (Gestão de Processos)

  // Levels with restricted access (own bucket only, simplified form, no move/delete)
  const RESTRICTED = [1, 5, 6, 7, 8]

  const canCreateTask = computed(() => userLevel.value >= 1)

  const canEditTask = computed(() => {
    return (task: Task) => {
      if (userLevel.value === 2) return true
      return task.criado_por === currentUserId.value
    }
  })

  // Mesma regra de edição: admin comenta em tudo, demais só nas que criaram
  const canCommentTask = computed(() => {
    return (task: Task) => {
      if (userLevel.value === 2) return true
      return task.criado_por === currentUserId.value
    }
  })

  const canMoveTask = computed(() => userLevel.value === 2)
  const canDeleteTask = computed(() => userLevel.value === 2)
  const canReorderDashboard = computed(() => userLevel.value === 2 || userLevel.value === 4)
  const canSeeAllBuckets = computed(() => !RESTRICTED.includes(userLevel.value))
  const hasFullForm = computed(() => userLevel.value === 2)
  const canSelectBucket = computed(() => !RESTRICTED.includes(userLevel.value))
  const isAdmin = computed(() => userLevel.value === 2)
  const isRestrictedUser = computed(() => RESTRICTED.includes(userLevel.value))

  const isTaskOwner = (task: Task): boolean =>
    task.criado_por === currentUserId.value

  return {
    userLevel,
    currentUserId,
    canCreateTask,
    canEditTask,
    canCommentTask,
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