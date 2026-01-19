import { ref, reactive } from 'vue'
import { authService } from '@/services/auth'
import type { User, UserState } from '@/types/user'

const state = reactive<UserState>({
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null
})

export function useAuth() {
  const login = async (email: string, password: string) => {
    try {
      state.loading = true
      state.error = null
      
      await authService.login(email, password)
      
      // Após login, buscar dados do usuário
      const userData = await authService.getCurrentUser()
      
      if (userData) {
        state.user = userData
        state.isAuthenticated = true
      }
    } catch (error) {
      state.error = error instanceof Error ? error.message : 'Erro no login'
      throw error
    } finally {
      state.loading = false
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
      state.user = null
      state.isAuthenticated = false
    } catch (error) {
      state.error = error instanceof Error ? error.message : 'Erro no logout'
    }
  }

  const checkAuth = async () => {
    try {
      state.loading = true
      const userData = await authService.getCurrentUser()
      
      if (userData) {
        state.user = userData
        state.isAuthenticated = true
      } else {
        state.user = null
        state.isAuthenticated = false
      }
    } catch (error) {
      state.user = null
      state.isAuthenticated = false
    } finally {
      state.loading = false
    }
  }

  const hasFullAccess = () => {
    return state.user?.nivel === 2
  }

  const hasRestrictedAccess = () => {
    return state.user?.nivel === 1
  }

  return {
    state,
    login,
    logout,
    checkAuth,
    hasFullAccess,
    hasRestrictedAccess
  }
}