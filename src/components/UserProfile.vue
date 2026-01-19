<template>
  <div class="user-profile" :class="{ collapsed: !isExpanded }">
    <div v-if="isExpanded" class="user-info-expanded">
      <div class="user-avatar">
        <img 
          v-if="user?.foto" 
          :src="user.foto" 
          :alt="user.nome_usuario || 'Usuário'" 
        />
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
    
    <div v-else class="user-info-collapsed">
      <div class="user-avatar-small">
        <img 
          v-if="user?.foto" 
          :src="user.foto" 
          :alt="user.nome_usuario || 'Usuário'" 
        />
        <div v-else class="avatar-placeholder-small">
          {{ getInitials(user?.nome_usuario) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User } from '@/types/user'

const props = defineProps<{
  user: User | null
  isExpanded: boolean
}>()

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
      return 'Restrito'
    default:
      return 'N/D'
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
.user-profile {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 1rem;
}

.user-info-expanded {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.2);
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
  font-weight: bold;
  font-size: 1.2rem;
}

.user-details {
  text-align: center;
}

.user-name {
  margin: 0 0 0.25rem 0;
  color: white;
  font-size: 1rem;
  font-weight: 600;
}

.user-role {
  margin: 0 0 0.5rem 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.85rem;
}

.level-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
}

.level-admin {
  background-color: rgba(212, 237, 218, 0.2);
  color: #4caf50;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.level-restricted {
  background-color: rgba(255, 243, 205, 0.2);
  color: #ff9800;
  border: 1px solid rgba(255, 152, 0, 0.3);
}

.level-undefined {
  background-color: rgba(248, 215, 218, 0.2);
  color: #f44336;
  border: 1px solid rgba(244, 67, 54, 0.3);
}

.user-info-collapsed {
  display: flex;
  justify-content: center;
}

.user-avatar-small {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.user-avatar-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder-small {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
}
</style>