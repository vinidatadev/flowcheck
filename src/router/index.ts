import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import LoginView from '@/views/LoginView.vue'
import HomeView from '@/views/HomeView.vue'
import TagManagementView from '@/views/TagManagementView.vue'
import UserManagementView from '@/views/UserManagementView.vue'
import DashboardView from '@/views/DashboardView.vue'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresGuest: true }
  },
  {
    path: '/home',
    name: 'Home',
    component: HomeView,
    meta: { requiresAuth: true }
  },
  {
    path: '/tags',
    name: 'TagManagement',
    component: TagManagementView,
    meta: { requiresAuth: true, requiresLevel2: true }
  },
  {
    path: '/users',
    name: 'UserManagement',
    component: UserManagementView,
    meta: { requiresAuth: true, requiresLevel2: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/ai-assistant',
    name: 'AiAssistant',
    component: () => import('@/views/AiAssistantView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard de autenticação
router.beforeEach(async (to, from, next) => {
  const auth = useAuth()
  
  // Verificar autenticação apenas na primeira navegação
  if (auth.state.loading) {
    await auth.checkAuth()
  }
  
  const requiresAuth = to.meta.requiresAuth
  const requiresGuest = to.meta.requiresGuest
  const requiresLevel2 = to.meta.requiresLevel2
  const isAuthenticated = auth.state.isAuthenticated
  const userLevel = auth.state.user?.nivel || 0
  
  if (requiresAuth && !isAuthenticated) {
    // Rota protegida, usuário não autenticado
    next('/login')
  } else if (requiresGuest && isAuthenticated) {
    // Rota de guest (login), usuário já autenticado
    next('/home')
  } else if (requiresLevel2 && userLevel < 2) {
    // Rota requer nível 2, usuário não tem permissão
    next('/home')
  } else {
    // Permitir navegação
    next()
  }
})

export default router