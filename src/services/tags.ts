import { supabase } from './supabase'

export interface Tag {
  id: number
  created_at: string
  tag: string | null
  color: string | null
}

export interface TagProcesso {
  id: number
  created_at: string
  tag_processo: string | null
  color: string | null
}

export class TagsService {
  async getTags(): Promise<Tag[]> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('tag')

    if (error) {
      throw new Error(`Erro ao buscar tags: ${error.message}`)
    }

    return data || []
  }

  async getTagsProcesso(): Promise<TagProcesso[]> {
    const { data, error } = await supabase
      .from('tags_processo')
      .select('*')
      .order('tag_processo')

    if (error) {
      throw new Error(`Erro ao buscar tags de processo: ${error.message}`)
    }

    return data || []
  }

  async createTag(tag: string, color: string): Promise<Tag> {
    const { data, error } = await supabase
      .from('tags')
      .insert([{ tag, color }])
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao criar tag: ${error.message}`)
    }

    return data
  }

  async createTagProcesso(tagProcesso: string, color: string): Promise<TagProcesso> {
    const { data, error } = await supabase
      .from('tags_processo')
      .insert([{ tag_processo: tagProcesso, color }])
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao criar tag de processo: ${error.message}`)
    }

    return data
  }

  async updateTag(id: number, tag: string, color: string): Promise<Tag> {
    const { data, error } = await supabase
      .from('tags')
      .update({ tag, color })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao atualizar tag: ${error.message}`)
    }

    return data
  }

  async updateTagProcesso(id: number, tagProcesso: string, color: string): Promise<TagProcesso> {
    const { data, error } = await supabase
      .from('tags_processo')
      .update({ tag_processo: tagProcesso, color })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao atualizar tag de processo: ${error.message}`)
    }

    return data
  }

  async deleteTag(id: number): Promise<void> {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Erro ao deletar tag: ${error.message}`)
    }
  }

  async deleteTagProcesso(id: number): Promise<void> {
    const { error } = await supabase
      .from('tags_processo')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Erro ao deletar tag de processo: ${error.message}`)
    }
  }

  async checkTagExists(tag: string, excludeId?: number): Promise<boolean> {
    let query = supabase
      .from('tags')
      .select('id')
      .eq('tag', tag)

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Erro ao verificar tag: ${error.message}`)
    }

    return (data?.length || 0) > 0
  }

  async checkTagProcessoExists(tagProcesso: string, excludeId?: number): Promise<boolean> {
    let query = supabase
      .from('tags_processo')
      .select('id')
      .eq('tag_processo', tagProcesso)

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Erro ao verificar tag de processo: ${error.message}`)
    }

    return (data?.length || 0) > 0
  }
}

export const tagsService = new TagsService()