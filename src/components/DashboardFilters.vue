<template>
  <div class="dashboard-filters">
    <!-- Header com contador e botão limpar -->
    <div class="filters-header">
      <div class="filters-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"></polygon>
        </svg>
        Filtros
        <span v-if="activeFiltersCount > 0" class="active-badge">
          {{ activeFiltersCount }} ativo{{ activeFiltersCount > 1 ? 's' : '' }}
        </span>
      </div>
      <button
        v-if="activeFiltersCount > 0"
        class="clear-btn"
        @click="clearFilters"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
        Limpar filtros
      </button>
    </div>

    <!-- Filtros inline -->
    <div class="filters-row">
      <!-- Bucket (multi-select) -->
      <div class="filter-group">
        <label class="filter-label">Bucket</label>
        <div class="multi-select-wrapper" ref="bucketDropdownRef">
          <button class="select-trigger" @click="toggleBucketDropdown">
            <span class="trigger-text">
              {{ selectedBucketIds.length === 0 ? 'Todos os buckets' : `${selectedBucketIds.length} selecionado${selectedBucketIds.length > 1 ? 's' : ''}` }}
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ rotated: showBucketDropdown }">
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </button>
          <div v-if="showBucketDropdown" class="dropdown">
            <label
              v-for="bucket in buckets"
              :key="bucket.id"
              class="dropdown-option"
            >
              <input
                type="checkbox"
                :value="bucket.id"
                :checked="selectedBucketIds.includes(bucket.id)"
                @change="toggleBucket(bucket.id)"
              />
              <span class="option-label">{{ bucket.abrev || bucket.bucket }}</span>
            </label>
            <div v-if="buckets.length === 0" class="dropdown-empty">Nenhum bucket disponível</div>
          </div>
        </div>
      </div>

      <!-- Status (single select) -->
      <div class="filter-group">
        <label class="filter-label">Status</label>
        <select class="select-native" :value="selectedStatus" @change="onStatusChange">
          <option value="all">Todos</option>
          <option value="not_started">Não Iniciado</option>
          <option value="in_progress">Em Andamento</option>
        </select>
      </div>

      <!-- Responsável (multi-select) -->
      <div class="filter-group">
        <label class="filter-label">Responsável</label>
        <div class="multi-select-wrapper" ref="userDropdownRef">
          <button class="select-trigger" @click="toggleUserDropdown">
            <span class="trigger-text">
              {{ selectedResponsaveis.length === 0 ? 'Todos' : `${selectedResponsaveis.length} selecionado${selectedResponsaveis.length > 1 ? 's' : ''}` }}
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ rotated: showUserDropdown }">
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </button>
          <div v-if="showUserDropdown" class="dropdown">
            <div class="dropdown-search">
              <input
                v-model="userSearch"
                placeholder="Buscar..."
                class="search-input"
                @click.stop
              />
            </div>
            <label
              v-for="user in filteredUsers"
              :key="user.id"
              class="dropdown-option"
            >
              <input
                type="checkbox"
                :value="user.nome_usuario"
                :checked="user.nome_usuario ? selectedResponsaveis.includes(user.nome_usuario) : false"
                @change="toggleUser(user.nome_usuario)"
              />
              <span class="option-label">{{ user.nome_usuario }}</span>
            </label>
            <div v-if="filteredUsers.length === 0" class="dropdown-empty">Nenhum usuário encontrado</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import type { Bucket } from '@/types/flowcheck'
import type { User } from '@/types/user'

interface DashboardFilterValues {
  bucketIds: number[]
  status: 'all' | 'not_started' | 'in_progress'
  responsaveis: string[]
}

const props = defineProps<{
  buckets: Bucket[]
  users: User[]
}>()

const emit = defineEmits<{
  'filter-change': [filters: DashboardFilterValues]
}>()

// State
const selectedBucketIds = ref<number[]>([])
const selectedStatus = ref<'all' | 'not_started' | 'in_progress'>('all')
const selectedResponsaveis = ref<string[]>([])
const showBucketDropdown = ref(false)
const showUserDropdown = ref(false)
const userSearch = ref('')
const bucketDropdownRef = ref<HTMLElement | null>(null)
const userDropdownRef = ref<HTMLElement | null>(null)

// Computed
const activeFiltersCount = computed(() => {
  let count = 0
  if (selectedBucketIds.value.length > 0) count++
  if (selectedStatus.value !== 'all') count++
  if (selectedResponsaveis.value.length > 0) count++
  return count
})

const filteredUsers = computed(() => {
  if (!userSearch.value) return props.users
  const q = userSearch.value.toLowerCase()
  return props.users.filter(u => u.nome_usuario?.toLowerCase().includes(q))
})

// Helpers
const emitChange = () => {
  emit('filter-change', {
    bucketIds: selectedBucketIds.value,
    status: selectedStatus.value,
    responsaveis: selectedResponsaveis.value
  })
}

const toggleBucket = (id: number) => {
  const idx = selectedBucketIds.value.indexOf(id)
  if (idx === -1) {
    selectedBucketIds.value = [...selectedBucketIds.value, id]
  } else {
    selectedBucketIds.value = selectedBucketIds.value.filter(b => b !== id)
  }
  emitChange()
}

const toggleUser = (name: string | null) => {
  if (!name) return
  const idx = selectedResponsaveis.value.indexOf(name)
  if (idx === -1) {
    selectedResponsaveis.value = [...selectedResponsaveis.value, name]
  } else {
    selectedResponsaveis.value = selectedResponsaveis.value.filter(r => r !== name)
  }
  emitChange()
}

const onStatusChange = (e: Event) => {
  selectedStatus.value = (e.target as HTMLSelectElement).value as 'all' | 'not_started' | 'in_progress'
  emitChange()
}

const toggleBucketDropdown = () => {
  showBucketDropdown.value = !showBucketDropdown.value
  if (showBucketDropdown.value) showUserDropdown.value = false
}

const toggleUserDropdown = () => {
  showUserDropdown.value = !showUserDropdown.value
  if (showUserDropdown.value) showBucketDropdown.value = false
}

const clearFilters = () => {
  selectedBucketIds.value = []
  selectedStatus.value = 'all'
  selectedResponsaveis.value = []
  emitChange()
}

// Close dropdowns on outside click
const handleOutsideClick = (e: MouseEvent) => {
  if (bucketDropdownRef.value && !bucketDropdownRef.value.contains(e.target as Node)) {
    showBucketDropdown.value = false
  }
  if (userDropdownRef.value && !userDropdownRef.value.contains(e.target as Node)) {
    showUserDropdown.value = false
    userSearch.value = ''
  }
}

onMounted(() => document.addEventListener('mousedown', handleOutsideClick))
onBeforeUnmount(() => document.removeEventListener('mousedown', handleOutsideClick))
</script>

<style scoped>
.dashboard-filters {
  background: white;
  border-radius: 10px;
  padding: 1rem 1.25rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
}

.filters-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.875rem;
}

.filters-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  color: #495057;
}

.active-badge {
  background: #667eea;
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 20px;
}

.clear-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: none;
  border: 1px solid #dc3545;
  color: #dc3545;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.clear-btn:hover {
  background: #dc3545;
  color: white;
}

.filters-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  min-width: 160px;
  flex: 1;
}

.filter-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* Native select for status */
.select-native {
  padding: 0.5rem 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #495057;
  background: white;
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s ease;
  height: 36px;
}

.select-native:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.15);
}

/* Custom multi-select */
.multi-select-wrapper {
  position: relative;
}

.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #495057;
  background: white;
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s ease;
  height: 36px;
  text-align: left;
}

.select-trigger:hover,
.select-trigger:focus {
  border-color: #667eea;
}

.trigger-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.select-trigger svg {
  flex-shrink: 0;
  transition: transform 0.15s ease;
  color: #6c757d;
}

.select-trigger svg.rotated {
  transform: rotate(180deg);
}

.dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  max-height: 220px;
  overflow-y: auto;
  z-index: 100;
}

.dropdown-search {
  padding: 0.5rem;
  border-bottom: 1px solid #f1f3f4;
  position: sticky;
  top: 0;
  background: white;
}

.search-input {
  width: 100%;
  padding: 0.375rem 0.625rem;
  border: 1px solid #dee2e6;
  border-radius: 5px;
  font-size: 0.8rem;
  outline: none;
}

.search-input:focus {
  border-color: #667eea;
}

.dropdown-option {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #495057;
  transition: background 0.1s ease;
}

.dropdown-option:hover {
  background: #f8f9fa;
}

.dropdown-option input[type="checkbox"] {
  accent-color: #667eea;
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  cursor: pointer;
}

.option-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-empty {
  padding: 0.75rem;
  text-align: center;
  font-size: 0.8rem;
  color: #adb5bd;
  font-style: italic;
}

/* Scrollbar */
.dropdown::-webkit-scrollbar {
  width: 4px;
}
.dropdown::-webkit-scrollbar-thumb {
  background: #dee2e6;
  border-radius: 2px;
}

@media (max-width: 640px) {
  .filters-row {
    flex-direction: column;
  }
  .filter-group {
    min-width: unset;
  }
}
</style>
