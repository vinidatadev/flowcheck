<template>
  <div class="user-select">
    <!-- Chips dos usuários selecionados -->
    <div v-if="selectedUsers.length > 0" class="selected-users">
      <UserChip
        v-for="user in selectedUsers"
        :key="user.id"
        :user="user"
        @remove="removeUser(user)"
        :disabled="disabled"
      />
    </div>

    <!-- Campo de busca -->
    <div class="search-container">
      <input
        v-model="searchQuery"
        @focus="showDropdown = true"
        @blur="handleBlur"
        :placeholder="placeholder"
        :disabled="disabled"
        class="search-input"
        autocomplete="off"
      />
      
      <div class="search-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
      </div>
      
      <!-- Dropdown com lista de usuários -->
      <div v-if="showDropdown && filteredUsers.length > 0" class="dropdown">
        <div
          v-for="user in filteredUsers"
          :key="user.id"
          @mousedown="selectUser(user)"
          class="dropdown-item"
          :class="{ selected: isSelected(user) }"
        >
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
          
          <div class="user-info">
            <div class="user-name">{{ user.nome_usuario }}</div>
            <div v-if="user.cargo" class="user-role">{{ user.cargo }}</div>
          </div>
          
          <div v-if="isSelected(user)" class="check-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
          </div>
        </div>
      </div>
      
      <!-- Estado vazio -->
      <div v-else-if="showDropdown && searchQuery && filteredUsers.length === 0" class="dropdown empty">
        <div class="empty-state">
          <span>Nenhum usuário encontrado</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import UserChip from './UserChip.vue'
import type { User } from '@/types/user'

const props = defineProps<{
  modelValue: string | null
  users: User[]
  placeholder?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const searchQuery = ref('')
const showDropdown = ref(false)

const selectedUsers = computed(() => {
  if (!props.modelValue) return []
  return props.users.filter(user => user.nome_usuario === props.modelValue)
})

const filteredUsers = computed(() => {
  if (!searchQuery.value) return props.users
  
  const query = searchQuery.value.toLowerCase()
  return props.users.filter(user => 
    user.nome_usuario?.toLowerCase().includes(query) ||
    user.cargo?.toLowerCase().includes(query)
  )
})

const isSelected = (user: User): boolean => {
  return user.nome_usuario === props.modelValue
}

const selectUser = (user: User) => {
  if (isSelected(user)) {
    emit('update:modelValue', null)
  } else {
    emit('update:modelValue', user.nome_usuario)
  }
  searchQuery.value = ''
  showDropdown.value = false
}

const removeUser = (user: User) => {
  if (user.nome_usuario === props.modelValue) {
    emit('update:modelValue', null)
  }
}

const handleBlur = () => {
  setTimeout(() => {
    showDropdown.value = false
    searchQuery.value = ''
  }, 200)
}

const getInitials = (name: string | null): string => {
  if (!name) return '?'
  
  const words = name.trim().split(' ')
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase()
  }
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
}

// Limpar busca quando fechar dropdown
watch(showDropdown, (isOpen) => {
  if (!isOpen) {
    searchQuery.value = ''
  }
})
</script>

<style scoped>
.user-select {
  position: relative;
}

.selected-users {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.search-container {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 0.875rem 2.5rem 0.875rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 0.9rem;
  background: white;
  transition: all 0.2s ease;
  outline: none;
}

.search-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-input:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
  opacity: 0.7;
}

.search-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  pointer-events: none;
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  max-height: 280px;
  overflow-y: auto;
  z-index: 1000;
  margin-top: 0.5rem;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid #f8f9fa;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.dropdown-item.selected {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-color: #2196f3;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  color: white;
  font-size: 1rem;
  font-weight: 600;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
  margin-bottom: 0.125rem;
}

.user-role {
  font-size: 0.8rem;
  color: #6c757d;
  opacity: 0.8;
}

.check-icon {
  color: #2196f3;
  margin-left: 0.5rem;
}

.empty {
  padding: 0;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: #6c757d;
  font-style: italic;
}

/* Scrollbar customizada */
.dropdown::-webkit-scrollbar {
  width: 6px;
}

.dropdown::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.dropdown::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.dropdown::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>