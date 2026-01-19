<template>
  <div class="user-chip">
    <div class="user-avatar">
      <img 
        v-if="user.foto" 
        :src="user.foto" 
        :alt="user.nome_usuario || 'Usuário'"
        class="avatar-image"
      />
      <div v-else class="avatar-placeholder">
        {{ getInitials(user.nome_usuario) }}
      </div>
    </div>
    
    <span class="user-name">{{ user.nome_usuario }}</span>
    
    <button 
      @click="$emit('remove')"
      class="remove-button"
      type="button"
      :disabled="disabled"
    >
      ×
    </button>
  </div>
</template>

<script setup lang="ts">
import type { User } from '@/types/user'

defineProps<{
  user: User
  disabled?: boolean
}>()

defineEmits<{
  remove: []
}>()

const getInitials = (name: string | null): string => {
  if (!name) return '?'
  
  const words = name.trim().split(' ')
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase()
  }
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
}
</script>

<style scoped>
.user-chip {
  display: inline-flex;
  align-items: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid #dee2e6;
  border-radius: 20px;
  padding: 0.4rem 0.75rem 0.4rem 0.4rem;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #495057;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.user-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border-color: #adb5bd;
}

.user-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
}

.user-name {
  white-space: nowrap;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.remove-button {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  font-size: 1.1rem;
  line-height: 1;
  padding: 0;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  margin-left: 0.25rem;
}

.remove-button:hover:not(:disabled) {
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  transform: scale(1.1);
}

.remove-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>