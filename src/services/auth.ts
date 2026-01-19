import { supabase } from './supabase'
import type { User } from '@/types/user'

export class AuthService {
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser) {
      return null
    }

    // Buscar dados do usuário na tabela user usando id_user
    const { data: userData, error } = await supabase
      .from('user')
      .select('*')
      .eq('id_user', authUser.id)
      .single()

    if (error) {
      console.error('Erro ao buscar dados do usuário:', error)
      return null
    }

    return userData
  }

  onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null)
    })
  }
}

export const authService = new AuthService()