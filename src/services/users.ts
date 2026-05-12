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
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Sessão não encontrada. Faça login novamente.')

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const response = await fetch(`${supabaseUrl}/functions/v1/create-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(userData),
    })

    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.error ?? `Erro ${response.status}`)
    }

    return result.user as User
  }

  async checkEmailExists(email: string): Promise<boolean> {
    // Check via the Edge Function is not needed here — we just attempt creation
    // and let the Auth layer reject duplicate emails. For the pre-validation UI
    // check we query the public user table by joining on a known email pattern,
    // but since email is only in Auth (not in public.user), we skip this check
    // and rely on the Edge Function returning a clear error on duplicate email.
    return false
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

  async resetUserPassword(userId: string, newPassword: string): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Sessão não encontrada. Faça login novamente.')

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const response = await fetch(`${supabaseUrl}/functions/v1/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ userId, newPassword }),
    })

    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.error ?? `Erro ${response.status}`)
    }
  }
}

export const usersService = new UsersService()