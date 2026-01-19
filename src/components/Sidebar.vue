<template>
  <div class="sidebar" :class="{ collapsed: !isOpen }">
    <!-- Área do usuário -->
    <div class="user-section" @click="$emit('toggle-sidebar')">
      <div v-if="isOpen" class="user-expanded">
        <div class="user-avatar">
          <img v-if="user?.foto" :src="user.foto" :alt="user.nome_usuario || 'Usuário'" />
          <div v-else class="avatar-placeholder">
            {{ getInitials(user?.nome_usuario) }}
          </div>
        </div>
        
        <div class="user-details">
          <h3 class="user-name">{{ user?.nome_usuario || 'Usuário' }}</h3>
          <p class="user-role">{{ user?.cargo || 'Sem cargo' }}</p>
          <span :class="['level-badge', getLevelClass()]">
            {{ getLevelText() }}
          </span>
        </div>
      </div>
      
      <div v-else class="user-collapsed">
        <div class="user-avatar-small">
          <img v-if="user?.foto" :src="user.foto" :alt="user.nome_usuario || 'Usuário'" />
          <div v-else class="avatar-placeholder">
            {{ getInitials(user?.nome_usuario) }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Navegação de projetos -->
    <nav class="projects-nav">
      <div v-if="isOpen" class="nav-header">
        <span class="nav-title">PROJETOS</span>
      </div>
      
      <ul class="bucket-list">
        <li 
          v-for="bucket in buckets" 
          :key="bucket.id"
          :class="['bucket-item', { active: selectedBucket?.id === bucket.id }]"
          @click="$emit('select-bucket', bucket)"
        >
          <div v-if="isOpen" class="bucket-expanded">
            <span class="bucket-name">{{ bucket.descrição || bucket.bucket }}</span>
            <span v-if="bucket.abrev" class="bucket-badge">{{ bucket.abrev }}</span>
          </div>
          
          <div v-else class="bucket-collapsed">
            <span 
              class="bucket-pill" 
              :title="bucket.descrição || bucket.bucket"
              :class="{ active: selectedBucket?.id === bucket.id }"
            >
              {{ bucket.abrev || getFirstLetters(bucket.bucket) }}
            </span>
          </div>
        </li>
      </ul>
    </nav>
    
    <!-- Seção de Administração (apenas nível 2) -->
    <div v-if="user?.nivel === 2" class="admin-section">
      <div v-if="isOpen" class="nav-header">
        <span class="nav-title">ADMINISTRAÇÃO</span>
      </div>
      
      <ul class="admin-list">
        <li class="admin-item" @click="$emit('navigate-to-tags')">
          <div v-if="isOpen" class="admin-expanded">
            <div class="admin-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                <line x1="7" y1="7" x2="7.01" y2="7"></line>
              </svg>
            </div>
            <span class="admin-name">Gerenciar Tags</span>
          </div>
          
          <div v-else class="admin-collapsed">
            <div class="admin-icon-small" title="Gerenciar Tags">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                <line x1="7" y1="7" x2="7.01" y2="7"></line>
              </svg>
            </div>
          </div>
        </li>
        
        <li class="admin-item" @click="$emit('navigate-to-users')">
          <div v-if="isOpen" class="admin-expanded">
            <div class="admin-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <span class="admin-name">Usuários</span>
          </div>
          
          <div v-else class="admin-collapsed">
            <div class="admin-icon-small" title="Gerenciar Usuários">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
          </div>
        </li>
      </ul>
    </div>
    
    <!-- Botão de logout -->
    <div class="logout-section">
      <button 
        @click="$emit('logout')" 
        class="logout-button"
        :class="{ collapsed: !isOpen }"
        :title="!isOpen ? 'Sair' : ''"
      >
        <svg class="logout-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16,17 21,12 16,7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        <span v-if="isOpen" class="logout-text">Sair</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User } from '@/types/user'
import type { Bucket } from '@/types/flowcheck'

const props = defineProps<{
  isOpen: boolean
  user: User | null
  buckets: Bucket[]
  selectedBucket: Bucket | null
}>()

defineEmits<{
  'toggle-sidebar': []
  'select-bucket': [bucket: Bucket]
  'logout': []
  'navigate-to-tags': []
  'navigate-to-users': []
}>()

const getFirstLetters = (text: string | null): string => {
  if (!text) return 'P'
  return text
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const getInitials = (name: string | null | undefined): string => {
  if (!name) return 'U'
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const getLevelText = (): string => {
  const nivel = props.user?.nivel
  switch (nivel) {
    case 2:
      return 'Admin'
    case 1:
      return 'User'
    default:
      return 'Guest'
  }
}

const getLevelClass = (): string => {
  const nivel = props.user?.nivel
  switch (nivel) {
    case 2:
      return 'level-admin'
    case 1:
      return 'level-restricted'
    default:
      return 'level-undefined'
  }
}
</script>

<style scoped>
.sidebar {
  width: 280px;
  background: linear-gradient(180deg, #1a1d29 0%, #232937 100%);
  color: #e2e8f0;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.12);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}

.sidebar.collapsed {
  width: 72px;
}

/* Seção do usuário */
.user-section {
  padding: 24px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.user-section:hover {
  background-color: rgba(255, 255, 255, 0.04);
}

.user-expanded {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.user-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.12);
  transition: border-color 0.2s ease;
}

.user-section:hover .user-avatar {
  border-color: rgba(255, 255, 255, 0.2);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
  letter-spacing: 0.5px;
}

.user-details {
  text-align: center;
  width: 100%;
}

.user-name {
  margin: 0 0 4px 0;
  color: #f8fafc;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.2;
}

.user-role {
  margin: 0 0 12px 0;
  color: #94a3b8;
  font-size: 0.875rem;
  line-height: 1.2;
}

.level-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.level-admin {
  background-color: rgba(34, 197, 94, 0.15);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.level-restricted {
  background-color: rgba(148, 163, 184, 0.15);
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.level-undefined {
  background-color: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.user-collapsed {
  display: flex;
  justify-content: center;
  align-items: center;
}

.user-avatar-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.12);
  transition: border-color 0.2s ease;
}

.user-section:hover .user-avatar-small {
  border-color: rgba(255, 255, 255, 0.2);
}

.user-avatar-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar-small .avatar-placeholder {
  font-size: 0.75rem;
}

/* Navegação de projetos */
.projects-nav {
  flex: 1;
  padding: 24px 0;
  overflow-y: auto;
}

.nav-header {
  padding: 0 20px 16px 20px;
}

.nav-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.bucket-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.bucket-item {
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.bucket-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: transparent;
  transition: background-color 0.2s ease;
}

.bucket-item.active::before {
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
}

.bucket-item:hover {
  background-color: rgba(255, 255, 255, 0.04);
}

.bucket-item.active {
  background-color: rgba(102, 126, 234, 0.08);
}

.bucket-expanded {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  gap: 12px;
}

.bucket-name {
  font-weight: 500;
  font-size: 0.875rem;
  color: #e2e8f0;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bucket-badge {
  background-color: rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.bucket-collapsed {
  display: flex;
  justify-content: center;
  padding: 8px;
}

.bucket-pill {
  background-color: rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  padding: 8px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 40px;
  text-align: center;
  transition: all 0.2s ease;
}

.bucket-pill:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

.bucket-pill.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

/* Seção de administração */
.admin-section {
  padding: 16px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.admin-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.admin-item {
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.admin-item:hover {
  background-color: rgba(255, 255, 255, 0.04);
}

.admin-expanded {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  gap: 12px;
}

.admin-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  color: #667eea;
  flex-shrink: 0;
}

.admin-name {
  font-weight: 500;
  font-size: 0.875rem;
  color: #e2e8f0;
  flex: 1;
}

.admin-collapsed {
  display: flex;
  justify-content: center;
  padding: 8px;
}

.admin-icon-small {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  color: #667eea;
  transition: all 0.2s ease;
}

.admin-icon-small:hover {
  background: rgba(102, 126, 234, 0.15);
}

/* Seção de logout */
.logout-section {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.logout-button {
  width: 100%;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 500;
}

.logout-button:hover {
  background-color: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.logout-button.collapsed {
  padding: 12px;
  justify-content: center;
}

.logout-icon {
  width: 18px;
  height: 18px;
  stroke-width: 2;
  flex-shrink: 0;
}

.logout-text {
  font-weight: 500;
}

/* Scrollbar customization */
.projects-nav::-webkit-scrollbar {
  width: 4px;
}

.projects-nav::-webkit-scrollbar-track {
  background: transparent;
}

.projects-nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.projects-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Responsividade */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .sidebar:not(.collapsed) {
    transform: translateX(0);
  }
}
</style>