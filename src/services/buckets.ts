import { supabase } from './supabase'
import type { Bucket } from '@/types/kanban'

export class BucketsService {
  async getBucketsByUserLevel(userLevel: number | null): Promise<Bucket[]> {
    let query = supabase.from('buckets').select('*')

    // Levels 2, 3, 4 see all buckets.
    // Levels 1, 5, 6, 7, 8 each see only the bucket whose `nivel` matches their user level.
    const restrictedLevels = [1, 5, 6, 7, 8]
    if (userLevel !== null && restrictedLevels.includes(userLevel)) {
      query = query.eq('nivel', userLevel)
    }

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