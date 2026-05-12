<template>
  <div class="user-management">
    <div class="management-header">
      <div class="header-content">
        <div class="header-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <div>
          <h1>Gerenciar Usuários</h1>
          <p>Criar e administrar usuários do sistema</p>
        </div>
      </div>
      
      <button @click="goBack" class="back-button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5"></path>
          <path d="M12 19l-7-7 7-7"></path>
        </svg>
        Voltar
      </button>
    </div>

    <div class="content-container">
      <!-- Formulário de Criação -->
      <div class="create-user-section">
        <div class="section-header">
          <h2>Criar Novo Usuário</h2>
          <p>Preencha os dados para criar um novo usuário no sistema</p>
        </div>

        <form @submit.prevent="handleCreateUser" class="user-form">
          <div class="form-grid">
            <!-- Email -->
            <div class="form-group">
              <label class="form-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                Email *
              </label>
              <input
                v-model="formData.email"
                type="email"
                class="form-input"
                placeholder="usuario@empresa.com"
                required
                :disabled="loading"
              />
              <div v-if="errors.email" class="error-message">{{ errors.email }}</div>
            </div>

            <!-- Senha -->
            <div class="form-group">
              <label class="form-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <circle cx="12" cy="16" r="1"></circle>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                Senha *
              </label>
              <div class="password-input-group">
                <input
                  v-model="formData.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-input"
                  placeholder="Mínimo 6 caracteres"
                  required
                  minlength="6"
                  :disabled="loading"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="password-toggle"
                  :disabled="loading"
                >
                  <svg v-if="showPassword" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                  <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>
              <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
            </div>

            <!-- Nome do Usuário -->
            <div class="form-group">
              <label class="form-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Nome do Usuário *
              </label>
              <input
                v-model="formData.nome_usuario"
                type="text"
                class="form-input"
                placeholder="Nome completo do usuário"
                required
                maxlength="100"
                :disabled="loading"
              />
              <div v-if="errors.nome_usuario" class="error-message">{{ errors.nome_usuario }}</div>
            </div>

            <!-- Cargo -->
            <div class="form-group">
              <label class="form-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
                Cargo *
              </label>
              <input
                v-model="formData.cargo"
                type="text"
                class="form-input"
                placeholder="Ex: Analista, Desenvolvedor, Gerente"
                required
                maxlength="100"
                :disabled="loading"
              />
              <div v-if="errors.cargo" class="error-message">{{ errors.cargo }}</div>
            </div>

            <!-- Nível de Acesso -->
            <div class="form-group">
              <label class="form-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
                Nível de Acesso *
              </label>
              <select
                v-model="formData.nivel"
                class="form-select"
                required
                :disabled="loading"
              >
                <option value="">Selecione o nível</option>
                <option value="1">1 - Usuário Padrão</option>
                <option value="2">2 - Administrador</option>
                <option value="3">3 - Gestor Visualizador</option>
                <option value="4">4 - Gestor Ordenador</option>
              </select>
              <div v-if="errors.nivel" class="error-message">{{ errors.nivel }}</div>
            </div>

            <!-- Foto (Opcional) -->
            <div class="form-group">
              <label class="form-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="9" cy="9" r="2"></circle>
                  <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                </svg>
                Foto (URL) - Opcional
              </label>
              <input
                v-model="formData.foto"
                type="url"
                class="form-input"
                placeholder="https://exemplo.com/foto.jpg"
                :disabled="loading"
              />
              <div class="form-help">URL da foto de perfil do usuário</div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="resetForm" class="cancel-button" :disabled="loading">
              Limpar
            </button>
            <button type="submit" class="create-button" :disabled="loading || !isFormValid">
              <div v-if="loading" class="button-spinner"></div>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <line x1="23" y1="11" x2="16" y2="18"></line>
                <line x1="16" y1="11" x2="23" y2="18"></line>
              </svg>
              Criar Usuário
            </button>
          </div>
        </form>
      </div>

      <!-- Informações Adicionais -->
      <div class="info-section">
        <div class="info-card">
          <div class="info-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <h3>Informações Importantes</h3>
          </div>
          
          <ul class="info-list">
            <li>
              <strong>Segurança:</strong> A senha é armazenada de forma segura no Supabase Auth
            </li>
            <li>
              <strong>Email:</strong> Será usado para login no sistema
            </li>
            <li>
              <strong>Nível 1:</strong> Usuário padrão com acesso limitado
            </li>
            <li>
              <strong>Nível 2:</strong> Administrador com acesso total
            </li>
            <li>
              <strong>Foto:</strong> Campo opcional, pode ser adicionado posteriormente
            </li>
          </ul>
        </div>

        <!-- Reset de senha -->
        <div class="info-card">
          <div class="info-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <h3>Resetar Senha</h3>
          </div>
          <p class="reset-hint">Redefine a senha do usuário para <strong>gac@123</strong>. O usuário deverá trocar após o login.</p>

          <div v-if="loadingUsers" class="reset-loading">Carregando usuários...</div>
          <ul v-else class="user-reset-list">
            <li v-for="u in userList" :key="u.id" class="user-reset-item">
              <span class="user-reset-name">{{ u.nome_usuario }}</span>
              <button
                class="reset-pw-btn"
                :disabled="resettingId === u.id_user"
                @click="handleResetPassword(u)"
              >
                {{ resettingId === u.id_user ? 'Resetando...' : '🔑 Resetar' }}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Toast de Feedback -->
    <div v-if="toastMessage" class="toast" :class="toastType">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usersService, type CreateUserData } from '@/services/users'
import type { User } from '@/types/user'

const DEFAULT_PASSWORD = 'gac@123'

const router = useRouter()
const loading = ref(false)
const showPassword = ref(false)
const loadingUsers = ref(false)
const userList = ref<User[]>([])
const resettingId = ref<string | null>(null)

const formData = ref<CreateUserData>({
  email: '',
  password: '',
  nome_usuario: '',
  cargo: '',
  nivel: 1,
  foto: ''
})

const errors = ref({
  email: '',
  password: '',
  nome_usuario: '',
  cargo: '',
  nivel: ''
})

const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

const isFormValid = computed(() => {
  return !!(
    formData.value.email &&
    formData.value.password &&
    formData.value.nome_usuario &&
    formData.value.cargo &&
    formData.value.nivel &&
    formData.value.password.length >= 6
  )
})

const goBack = () => {
  router.push('/home')
}

const resetForm = () => {
  formData.value = {
    email: '',
    password: '',
    nome_usuario: '',
    cargo: '',
    nivel: 1,
    foto: ''
  }
  errors.value = {
    email: '',
    password: '',
    nome_usuario: '',
    cargo: '',
    nivel: ''
  }
}

const validateForm = async (): Promise<boolean> => {
  // Limpar erros anteriores
  errors.value = {
    email: '',
    password: '',
    nome_usuario: '',
    cargo: '',
    nivel: ''
  }

  let isValid = true

  // Validar email
  if (!formData.value.email) {
    errors.value.email = 'Email é obrigatório'
    isValid = false
  } else {
    try {
      const emailExists = await usersService.checkEmailExists(formData.value.email)
      if (emailExists) {
        errors.value.email = 'Este email já está em uso'
        isValid = false
      }
    } catch (error) {
      console.error('Erro ao verificar email:', error)
    }
  }

  // Validar senha
  if (!formData.value.password) {
    errors.value.password = 'Senha é obrigatória'
    isValid = false
  } else if (formData.value.password.length < 6) {
    errors.value.password = 'Senha deve ter pelo menos 6 caracteres'
    isValid = false
  }

  // Validar nome de usuário
  if (!formData.value.nome_usuario) {
    errors.value.nome_usuario = 'Nome do usuário é obrigatório'
    isValid = false
  } else {
    try {
      const usernameExists = await usersService.checkUsernameExists(formData.value.nome_usuario)
      if (usernameExists) {
        errors.value.nome_usuario = 'Este nome de usuário já está em uso'
        isValid = false
      }
    } catch (error) {
      console.error('Erro ao verificar nome de usuário:', error)
    }
  }

  // Validar cargo
  if (!formData.value.cargo) {
    errors.value.cargo = 'Cargo é obrigatório'
    isValid = false
  }

  // Validar nível
  if (!formData.value.nivel) {
    errors.value.nivel = 'Nível de acesso é obrigatório'
    isValid = false
  }

  return isValid
}

const handleCreateUser = async () => {
  if (loading.value) return

  try {
    loading.value = true

    // Validar formulário
    const isValid = await validateForm()
    if (!isValid) {
      return
    }

    // Criar usuário
    await usersService.createUser({
      ...formData.value,
      nivel: Number(formData.value.nivel)
    })

    showToast('Usuário criado com sucesso!', 'success')
    resetForm()
  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao criar usuário'
    showToast(errorMessage, 'error')
  } finally {
    loading.value = false
  }
}

const showToast = (message: string, type: 'success' | 'error') => {
  toastMessage.value = message
  toastType.value = type
  
  setTimeout(() => {
    toastMessage.value = ''
  }, 5000)
}

async function loadUsers() {
  loadingUsers.value = true
  try {
    userList.value = await usersService.getUsers()
  } finally {
    loadingUsers.value = false
  }
}

async function handleResetPassword(user: User) {
  if (!user.id_user) return
  resettingId.value = user.id_user
  try {
    await usersService.resetUserPassword(user.id_user, DEFAULT_PASSWORD)
    showToast(`Senha de ${user.nome_usuario} resetada para "${DEFAULT_PASSWORD}"`, 'success')
  } catch (err) {
    showToast(err instanceof Error ? err.message : 'Erro ao resetar senha', 'error')
  } finally {
    resettingId.value = null
  }
}

onMounted(loadUsers)
</script>

<style scoped>
.user-management {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem;
}

.management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.management-header h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #333;
}

.management-header p {
  margin: 0.25rem 0 0 0;
  color: #666;
  font-size: 0.9rem;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.back-button:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

.content-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.create-user-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.section-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.section-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
}

.section-header p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.user-form {
  display: flex;
  flex-direction: column;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.form-input,
.form-select {
  padding: 0.875rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  outline: none;
  background: white;
}

.form-input:focus,
.form-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input:disabled,
.form-select:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
  opacity: 0.7;
}

.password-input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #6c757d;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.password-toggle:hover:not(:disabled) {
  color: #495057;
  background-color: #f8f9fa;
}

.password-toggle:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.form-help {
  font-size: 0.8rem;
  color: #6c757d;
}

.error-message {
  color: #dc3545;
  font-size: 0.8rem;
  font-weight: 500;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.cancel-button {
  padding: 0.875rem 1.5rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.cancel-button:hover:not(:disabled) {
  background: #5a6268;
}

.create-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  min-width: 140px;
  justify-content: center;
}

.create-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(40, 167, 69, 0.3);
}

.create-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.button-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.info-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  color: #667eea;
}

.info-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.info-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-list li {
  font-size: 0.9rem;
  line-height: 1.4;
  color: #666;
}

.info-list strong {
  color: #333;
  font-weight: 600;
}

.reset-hint {
  font-size: 0.85rem;
  color: #666;
  margin: 0 0 1rem 0;
  line-height: 1.4;
}

.reset-loading {
  font-size: 0.85rem;
  color: #adb5bd;
}

.user-reset-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.user-reset-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.user-reset-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #333;
}

.reset-pw-btn {
  padding: 4px 12px;
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffc107;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.reset-pw-btn:hover:not(:disabled) {
  background: #ffc107;
  color: #333;
}

.reset-pw-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  color: white;
  font-weight: 500;
  z-index: 1000;
  animation: slideIn 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  max-width: 400px;
}

.toast.success {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.toast.error {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 1024px) {
  .content-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .user-management {
    padding: 1rem;
  }
  
  .management-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>