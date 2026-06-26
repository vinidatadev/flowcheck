import { supabase } from './supabase'
import type { Task, TaskFormData, TaskComment } from '@/types/flowcheck'

export class TasksService {
  async getTasksByBucket(bucketId: number): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id_bucket', bucketId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Erro ao buscar tasks: ${error.message}`)
    }

    return data || []
  }

  async getTasksByCategory(categoryId: number): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id_category', categoryId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Erro ao buscar tasks por categoria: ${error.message}`)
    }

    return data || []
  }

  async getTaskById(id: number): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(`Erro ao buscar task: ${error.message}`)
    }

    return data
  }

  async createTask(taskData: TaskFormData, bucketId: number, categoryId: number, userId: string, userLevel: number): Promise<Task> {
    // Validar permissão no frontend
    if (userLevel < 1) {
      throw new Error('Você não tem permissão para criar tasks')
    }

    const statusConcluido = taskData.percenti_concluido === 100

    const payload = {
      titulo_task: taskData.titulo_task,
      descricao: taskData.descricao,
      id_bucket: bucketId,
      id_category: categoryId,
      tag: taskData.tag.length > 0 ? taskData.tag : null,
      tag_processo: taskData.tag_processo.length > 0 ? taskData.tag_processo : null,
      responsavel: taskData.responsavel.length > 0 ? taskData.responsavel : null,
      data_inicio: taskData.data_inicio || null,
      data_fim: taskData.data_fim || null,
      prioridade: taskData.prioridade,
      status_concluido: statusConcluido,
      subtask: taskData.subtask.length > 0 ? taskData.subtask : null,
      subtask_bool: taskData.subtask_bool.length > 0 ? taskData.subtask_bool : null,
      solicitante: taskData.solicitante.length > 0 ? taskData.solicitante : null,
      percenti_concluido: taskData.percenti_concluido,
      ganhos: taskData.ganhos || null,
      projeto: taskData.projeto,
      pos_s4hana: taskData.pos_s4hana,
      id_obs_processo: taskData.id_obs_processo ?? null,
      criado_por: userId,
      modificado_por: userId
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert(payload)
      .select()
      .single()

    if (error) {
      // Tratar erros específicos do RLS/trigger
      if (error.message?.includes('não pode')) {
        throw new Error('Você não tem permissão para criar tasks')
      }
      if (error.code === '42501' || error.message.includes('permission')) {
        throw new Error('Você não tem permissão para criar tasks')
      }
      throw new Error(`Erro ao criar task: ${error.message}`)
    }

    return data
  }

  async updateTask(taskId: number, taskData: TaskFormData, userId: string, userLevel: number): Promise<Task> {
    // Validar permissão no frontend
    if (userLevel < 1) {
      throw new Error('Você não tem permissão para editar tasks')
    }

    const statusConcluido = taskData.percenti_concluido === 100

    const payload = {
      titulo_task: taskData.titulo_task,
      descricao: taskData.descricao,
      tag: taskData.tag.length > 0 ? taskData.tag : null,
      tag_processo: taskData.tag_processo.length > 0 ? taskData.tag_processo : null,
      responsavel: taskData.responsavel.length > 0 ? taskData.responsavel : null,
      data_inicio: taskData.data_inicio || null,
      data_fim: taskData.data_fim || null,
      prioridade: taskData.prioridade,
      status_concluido: statusConcluido,
      subtask: taskData.subtask.length > 0 ? taskData.subtask : null,
      subtask_bool: taskData.subtask_bool.length > 0 ? taskData.subtask_bool : null,
      solicitante: taskData.solicitante.length > 0 ? taskData.solicitante : null,
      percenti_concluido: taskData.percenti_concluido,
      ganhos: taskData.ganhos || null,
      projeto: taskData.projeto,
      pos_s4hana: taskData.pos_s4hana,
      id_obs_processo: taskData.id_obs_processo ?? null,
      modificado_por: userId
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(payload)
      .eq('id', taskId)
      .select()
      .single()

    if (error) {
      // Tratar erros específicos do RLS/trigger
      if (error.message?.includes('não pode') || error.code === '42501') {
        throw new Error('Você só pode editar atividades que você criou')
      }
      if (error.message.includes('permission')) {
        throw new Error('Você não tem permissão para editar esta task')
      }
      throw new Error(`Erro ao atualizar task: ${error.message}`)
    }

    return data
  }

  async updateTaskCategory(taskId: number, newCategoryId: number, statusConcluido: boolean, userLevel: number): Promise<void> {
    // Validar permissão no frontend
    if (userLevel < 2) {
      throw new Error('Você não tem permissão para mover tasks entre categorias')
    }

    const { error } = await supabase
      .from('tasks')
      .update({
        id_category: newCategoryId,
        status_concluido: statusConcluido
      })
      .eq('id', taskId)

    if (error) {
      // Tratar erros específicos do trigger
      if (error.message?.includes('não pode mover')) {
        throw new Error('Você não tem permissão para mover tasks')
      }
      if (error.code === '42501' || error.message.includes('permission')) {
        throw new Error('Você não tem permissão para mover tasks')
      }
      throw new Error(`Erro ao mover task: ${error.message}`)
    }
  }

  async updateDisplayOrder(updates: { id: number; display_order: number }[]): Promise<void> {
    // Fire all updates in parallel — each is a single-row patch
    const promises = updates.map(({ id, display_order }) =>
      supabase.from('tasks').update({ display_order }).eq('id', id)
    )
    const results = await Promise.all(promises)
    for (const { error } of results) {
      if (error) throw new Error(`Erro ao salvar ordem: ${error.message}`)
    }
  }

  async addComment(taskId: number, comment: TaskComment, existingComments: TaskComment[]): Promise<Task> {
    const updated = [...existingComments, comment]

    const { data, error } = await supabase
      .from('tasks')
      .update({ comentarios: updated })
      .eq('id', taskId)
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao salvar comentário: ${error.message}`)
    }

    return data
  }

  async deleteTask(taskId: number, userLevel: number): Promise<void> {    // Validar permissão no frontend
    if (userLevel < 2) {
      throw new Error('Você não tem permissão para excluir tasks')
    }

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)

    if (error) {
      // Tratar erros específicos do RLS/trigger
      if (error.message?.includes('não pode')) {
        throw new Error('Você não tem permissão para excluir tasks')
      }
      if (error.code === '42501' || error.message.includes('permission')) {
        throw new Error('Você não tem permissão para excluir tasks')
      }
      throw new Error(`Erro ao excluir task: ${error.message}`)
    }
  }
}

export const tasksService = new TasksService()