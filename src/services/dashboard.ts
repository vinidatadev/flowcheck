import type { TaskWithContext } from '@/types/flowcheck'
import { bucketsService } from './buckets'
import { tasksService } from './tasks'
import { categoriesService } from './categories'

const ACTIVE_CATEGORIES = ['Não Iniciado', 'Em Andamento']

export class DashboardService {
  async getAllActiveTasks(userLevel: number): Promise<TaskWithContext[]> {
    // Level 1: fetch "Em Andamento" from ALL buckets + "Não Iniciado" only from TaskInbox.
    // Level 2: fetch both statuses from all buckets.
    const ownBuckets = await bucketsService.getBucketsByUserLevel(userLevel)
    const allBuckets = userLevel === 1
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
            const categoryName = task.id_category ? categoryMap.get(task.id_category) : null
            if (!categoryName || !ACTIVE_CATEGORIES.includes(categoryName)) return false
            // Level 1: only show "Não Iniciado" from their own bucket (TaskInbox);
            // "Em Andamento" is visible from any bucket.
            if (userLevel === 1 && categoryName === 'Não Iniciado' && !isOwnBucket) return false
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