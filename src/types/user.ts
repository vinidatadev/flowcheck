export interface User {
  id: number
  created_at: string
  nome_usuario: string | null
  cargo: string | null
  foto: string | null
  id_user: string | null
  nivel: number | null
}

export interface UserState {
  isAuthenticated: boolean
  user: User | null
  loading: boolean
  error: string | null
}