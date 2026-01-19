import { supabase } from './supabase'
import type { User } from '@/types/user'

export interface CreateUserData {
  email: string
  password: string
  nome_usuario: string
  cargo: string
  nivel: number
  foto?: string
}

export class UsersService {
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('user')
      .select('*')
      .order('nome_usuario')

    if (error) {
      throw new Error(`Erro ao buscar usuários: ${error.message}`)
    }

    return data || []
  }

  async getUsersByNames(names: string[]): Promise<User[]> {
    if (names.length === 0) return []

    const { data, error } = await supabase
      .from('user')
      .select('*')
      .in('nome_usuario', names)

    if (error) {
      throw new Error(`Erro ao buscar usuários por nomes: ${error.message}`)
    }

    return data || []
  }

  async createUser(userData: CreateUserData): Promise<User> {
    try {
      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          nome_usuario: userData.nome_usuario,
          cargo: userData.cargo
        }
      })

      if (authError) {
        throw new Error(`Erro ao criar usuário no Auth: ${authError.message}`)
      }

      if (!authData.user) {
        throw new Error('Usuário não foi criado no Auth')
      }

      // 2. Inserir dados na tabela public.user
      const { data: dbData, error: dbError } = await supabase
        .from('user')
        .insert([{
          id_user: authData.user.id,
          nome_usuario: userData.nome_usuario,
          cargo: userData.cargo,
          nivel: userData.nivel,
          foto: userData.foto || null
        }])
        .select()
        .single()

      if (dbError) {
        // Se falhar ao inserir na tabela, tentar deletar o usuário do Auth
        try {
          await supabase.auth.admin.deleteUser(authData.user.id)
        } catch (cleanupError) {
          console.error('Erro ao limpar usuário do Auth:', cleanupError)
        }
        throw new Error(`Erro ao salvar dados do usuário: ${dbError.message}`)
      }

      return dbData
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Erro desconhecido ao criar usuário')
    }
  }

  async checkEmailExists(email: string): Promise<boolean> {
    try {
      // Verificar no Auth se o email já existe
      const { data, error } = await supabase.auth.admin.listUsers()
      
      if (error) {
        throw new Error(`Erro ao verificar email: ${error.message}`)
      }

      return data.users.some(user => user.email === email)
    } catch (error) {
      console.error('Erro ao verificar email:', error)
      return false
    }
  }

  async checkUsernameExists(username: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('user')
      .select('id')
      .eq('nome_usuario', username)
      .limit(1)

    if (error) {
      throw new Error(`Erro ao verificar nome de usuário: ${error.message}`)
    }

    return (data?.length || 0) > 0
  }
}

export const usersService = new UsersService()