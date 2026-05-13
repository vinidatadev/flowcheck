import { supabase } from './supabase'
import type { ObsProcesso } from '@/types/flowcheck'

export class ObsProcessoService {
  async getAll(): Promise<ObsProcesso[]> {
    const { data, error } = await supabase
      .from('observacao_processo')
      .select('*')
      .order('observacao_processo')

    if (error) throw new Error(`Erro ao buscar observações: ${error.message}`)
    return data || []
  }
}

export const obsProcessoService = new ObsProcessoService()
