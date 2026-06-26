import type { TaskWithContext } from '@/types/flowcheck'
import { bucketsService } from './buckets'
import { tasksService } from './tasks'
import { categoriesService } from './categories'
import { supabase } from './supabase'

const ACTIVE_CATEGORIES = ['Não Iniciado', 'Em Andamento']

// Nota: Apenas tasks com status_concluido = false são consideradas "ativas".
// Mesmo que uma task esteja na categoria "Concluidos" mas com status_concluido = false,
// ela não será exibida aqui (inconsistência de dados).

// Levels that only see their own bucket's "Não Iniciado",
// but see "Em Andamento" from all buckets.
const RESTRICTED_LEVELS = [1, 5, 6, 7, 8]

export class DashboardService {
  async getAllTasksWithContext(userLevel: number): Promise<TaskWithContext[]> {
    const ownBuckets = await bucketsService.getBucketsByUserLevel(userLevel)

    const results = await Promise.allSettled(
      ownBuckets.map(async (bucket) => {
        const [tasks, categories] = await Promise.all([
          tasksService.getTasksByBucket(bucket.id),
          categoriesService.getCategoriesByBucket(bucket.id)
        ])

        const categoryMap = new Map(categories.map((c) => [c.id, c.category ?? '']))

        return tasks.map((task): TaskWithContext => ({
          ...task,
          bucketName: bucket.abrev ?? bucket.bucket ?? String(bucket.id),
          categoryName: task.id_category ? (categoryMap.get(task.id_category) ?? '') : ''
        }))
      })
    )

    const allTasks: TaskWithContext[] = []
    for (const result of results) {
      if (result.status === 'fulfilled') {
        allTasks.push(...result.value)
      }
    }
    return allTasks
  }

  async getAllActiveTasks(userLevel: number): Promise<TaskWithContext[]> {
    const isRestricted = RESTRICTED_LEVELS.includes(userLevel)

    const ownBuckets = await bucketsService.getBucketsByUserLevel(userLevel)
    // Restricted levels see "Em Andamento" from all buckets
    const allBuckets = isRestricted
      ? await bucketsService.getBucketsByUserLevel(2)
      : ownBuckets

    const results = await Promise.allSettled(
      allBuckets.map(async (bucket) => {
        const isOwnBucket = ownBuckets.some(b => b.id === bucket.id)

        const [tasks, categories] = await Promise.all([
          tasksService.getTasksByBucket(bucket.id),
          categoriesService.getCategoriesByBucket(bucket.id)
        ])

        const categoryMap = new Map(categories.map((c) => [c.id, c.category ?? '']))

        return tasks
          .filter((task) => {
            // Não mostrar tasks concluídas
            if (task.status_concluido) return false
            
            const categoryName = task.id_category ? categoryMap.get(task.id_category) : null
            if (!categoryName || !ACTIVE_CATEGORIES.includes(categoryName)) return false
            // Restricted levels: only show "Não Iniciado" from their own bucket
            if (isRestricted && categoryName === 'Não Iniciado' && !isOwnBucket) return false
            return true
          })
          .map((task): TaskWithContext => ({
            ...task,
            bucketName: bucket.abrev ?? bucket.bucket ?? String(bucket.id),
            categoryName: task.id_category ? (categoryMap.get(task.id_category) ?? '') : ''
          }))
      })
    )

    const activeTasks: TaskWithContext[] = []
    for (const result of results) {
      if (result.status === 'fulfilled') {
        activeTasks.push(...result.value)
      } else {
        console.error('Erro ao carregar tasks de um bucket:', result.reason)
      }
    }

    return activeTasks
  }
}

export const dashboardService = new DashboardService()

export async function getTotalTaskCount(
  userLevel: number,
  includeStandby: boolean
): Promise<{ total: number; concluidos: number }> {
  const buckets = await bucketsService.getBucketsByUserLevel(userLevel)
  if (buckets.length === 0) return { total: 0, concluidos: 0 }

  const bucketIds = buckets.map(b => b.id)

  // Fetch tasks with tag field to filter in code
  const [totalResult, concluidosResult] = await Promise.all([
    supabase
      .from('tasks')
      .select('tag')
      .in('id_bucket', bucketIds),
    supabase
      .from('tasks')
      .select('tag')
      .in('id_bucket', bucketIds)
      .eq('status_concluido', true),
  ])

  if (totalResult.error) throw new Error(`Erro ao contar tasks: ${totalResult.error.message}`)
  if (concluidosResult.error) throw new Error(`Erro ao contar concluídos: ${concluidosResult.error.message}`)

  const filterStandby = (tasks: { tag: string[] | null }[]) => {
    if (includeStandby) return tasks.length
    // Exclude only tasks that have 'Standby' in tag array
    return tasks.filter(t => !t.tag || !t.tag.includes('Standby')).length
  }

  return {
    total: filterStandby(totalResult.data ?? []),
    concluidos: filterStandby(concluidosResult.data ?? []),
  }
}