<template>
  <div class="avatar-group" v-if="users.length > 0">
    <div
      v-for="(user, index) in visibleUsers"
      :key="user.id"
      class="avatar"
      :style="{ zIndex: users.length - index }"
      :title="`${user.nome_usuario} - ${user.cargo}`"
    >
      <img v-if="user.foto" :src="user.foto" :alt="user.nome_usuario || 'Usuário'" />
      <div v-else class="avatar-placeholder">
        {{ getInitials(user.nome_usuario) }}
      </div>
    </div>
    
    <div
      v-if="remainingCount > 0"
      class="avatar remaining-count"
      :title="`+${remainingCount} usuários`"
    >
      +{{ remainingCount }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { User } from '@/types/user'

const props = defineProps<{
  users: User[]
  maxVisible?: number
  size?: 'small' | 'medium' | 'large'
}>()

const maxVisible = computed(() => props.maxVisible || 3)

const visibleUsers = computed(() => {
  return props.users.slice(0, maxVisible.value)
})

const remainingCount = computed(() => {
  return Math.max(0, props.users.length - maxVisible.value)
})

const getInitials = (name: string | null | undefined): string => {
  if (!name) return 'U'
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>

<style scoped>
.avatar-group {
  display: flex;
  align-items: center;
}

.avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid white;
  margin-left: -8px;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
}

.avatar:first-child {
  margin-left: 0;
}

.avatar img {
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
  font-size: 0.6rem;
}

.remaining-count {
  background-color: #6c757d;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  font-weight: bold;
}

/* Variações de tamanho */
.avatar-group[data-size="small"] .avatar {
  width: 20px;
  height: 20px;
  margin-left: -6px;
}

.avatar-group[data-size="small"] .avatar:first-child {
  margin-left: 0;
}

.avatar-group[data-size="small"] .avatar-placeholder,
.avatar-group[data-size="small"] .remaining-count {
  font-size: 0.5rem;
}

.avatar-group[data-size="large"] .avatar {
  width: 32px;
  height: 32px;
  margin-left: -10px;
}

.avatar-group[data-size="large"] .avatar:first-child {
  margin-left: 0;
}

.avatar-group[data-size="large"] .avatar-placeholder,
.avatar-group[data-size="large"] .remaining-count {
  font-size: 0.7rem;
}
</style>