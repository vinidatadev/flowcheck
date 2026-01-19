import { supabase } from './supabase'
import type { Category } from '@/types/kanban'

export class CategoriesService {
  async getCategoriesByBucket(bucketId: number): Promise<Category[]> {
    const { data, error } = await supabase
      .from('category')
      .select('*')
      .eq('id_bucket', bucketId)
      .order('id')

    if (error) {
      throw new Error(`Erro ao buscar categorias: ${error.message}`)
    }

    return data || []
  }

  // Método para garantir que um bucket tenha as 3 categorias padrão
  async ensureDefaultCategories(bucketId: number): Promise<void> {
    const defaultCategories = [
      'Não Iniciado',
      'Em Andamento', 
      'Concluidos'
    ]

    const existingCategories = await this.getCategoriesByBucket(bucketId)
    const existingNames = existingCategories.map(cat => cat.category)

    for (const categoryName of defaultCategories) {
      if (!existingNames.includes(categoryName)) {
        const { error } = await supabase
          .from('category')
          .insert({
            category: categoryName,
            id_bucket: bucketId
          })

        if (error) {
          console.error(`Erro ao criar categoria ${categoryName}:`, error)
        }
      }
    }
  }
}

export const categoriesService = new CategoriesService()