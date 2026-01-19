import { supabase } from './supabase'
import type { Bucket } from '@/types/kanban'

export class BucketsService {
  async getBucketsByUserLevel(userLevel: number | null): Promise<Bucket[]> {
    let query = supabase.from('buckets').select('*')

    // Usuário nível 1 só vê TaskInbox
    if (userLevel === 1) {
      query = query.eq('bucket', 'TaskInbox')
    }
    // Usuário nível 2 vê todos os buckets (sem filtro adicional)

    const { data, error } = await query.order('bucket')

    if (error) {
      throw new Error(`Erro ao buscar buckets: ${error.message}`)
    }

    return data || []
  }

  async getBucketById(id: number): Promise<Bucket | null> {
    const { data, error } = await supabase
      .from('buckets')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(`Erro ao buscar bucket: ${error.message}`)
    }

    return data
  }
}

export const bucketsService = new BucketsService()