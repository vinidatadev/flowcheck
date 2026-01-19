<template>
  <div class="filter-panel">
    <div class="filter-header">
      <div class="header-content">
        <div class="filter-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"></polygon>
          </svg>
        </div>
        <h3>Filtros</h3>
      </div>
      
      <div class="filter-actions">
        <div v-if="hasActiveFilters" class="filter-status">
          <div class="filter-count">
            {{ getActiveFiltersCount }} filtro{{ getActiveFiltersCount > 1 ? 's' : '' }} ativo{{ getActiveFiltersCount > 1 ? 's' : '' }}
          </div>
          <button 
            @click="handleResetFilters"
            class="clear-filters-btn"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            Limpar filtros
          </button>
        </div>
        
        <div v-else class="filter-hint">
          Selecione filtros para refinar os resultados
        </div>
      </div>
    </div>

    <div class="filters-grid">
      <!-- Filtro por Responsável -->
      <div class="filter-group">
        <label class="filter-label">
          <div class="label-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          Responsável
        </label>
        <UserMultiSelect
          :model-value="filters.responsavel"
          :users="users"
          @update:model-value="handleResponsavelChange"
          placeholder="Buscar responsáveis..."
          :disabled="loading"
        />
      </div>

      <!-- Filtro por Solicitante -->
      <div class="filter-group">
        <label class="filter-label">
          <div class="label-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          Solicitante
        </label>
        <UserMultiSelect
          :model-value="filters.solicitante"
          :users="users"
          @update:model-value="handleSolicitanteChange"
          placeholder="Buscar solicitantes..."
          :disabled="loading"
        />
      </div>

      <!-- Filtro por Tags -->
      <div class="filter-group">
        <label class="filter-label">
          <div class="label-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
              <line x1="7" y1="7" x2="7.01" y2="7"></line>
            </svg>
          </div>
          Tags
        </label>
        <TagSelect
          :model-value="filters.tags"
          :options="availableTags"
          type="tag"
          @update:model-value="handleTagsChange"
          placeholder="Buscar tags..."
          :disabled="loading"
        />
      </div>

      <!-- Filtro por Tags de Processo -->
      <div class="filter-group">
        <label class="filter-label">
          <div class="label-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="9" cy="9" r="2"></circle>
              <path d="M21 15.5c-.5-1-1.5-2-3-2s-2.5 1-3 2"></path>
            </svg>
          </div>
          Tags de Processo
        </label>
        <TagSelect
          :model-value="filters.tags_processo"
          :options="availableTagsProcesso"
          type="tag_processo"
          @update:model-value="handleTagsProcessoChange"
          placeholder="Buscar tags de processo..."
          :disabled="loading"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTaskFilters } from '@/composables/useTaskFilters'
import { usersService } from '@/services/users'
import { tagsService } from '@/services/tags'
import UserMultiSelect from './UserMultiSelect.vue'
import TagSelect from './TagSelect.vue'
import type { User } from '@/types/user'
import type { Tag, TagProcesso } from '@/services/tags'

const {
  filters,
  setResponsavelFilter,
  setSolicitanteFilter,
  setTagsFilter,
  setTagsProcessoFilter,
  resetFilters,
  hasActiveFilters,
  getActiveFiltersCount
} = useTaskFilters()

const users = ref<User[]>([])
const availableTags = ref<Array<{ name: string; color: string | null }>>([])
const availableTagsProcesso = ref<Array<{ name: string; color: string | null }>>([])
const loading = ref(false)

const handleResponsavelChange = (responsaveis: string[]) => {
  setResponsavelFilter(responsaveis)
}

const handleSolicitanteChange = (solicitantes: string[]) => {
  setSolicitanteFilter(solicitantes)
}

const handleTagsChange = (tags: string[]) => {
  setTagsFilter(tags)
}

const handleTagsProcessoChange = (tagsProcesso: string[]) => {
  setTagsProcessoFilter(tagsProcesso)
}

const handleResetFilters = () => {
  resetFilters()
}

const loadFilterData = async () => {
  try {
    loading.value = true
    
    const [usersData, tagsData, tagsProcessoData] = await Promise.all([
      usersService.getUsers(),
      tagsService.getTags(),
      tagsService.getTagsProcesso()
    ])

    users.value = usersData
    availableTags.value = tagsData
      .filter(tag => tag.tag)
      .map(tag => ({ name: tag.tag!, color: tag.color }))
    availableTagsProcesso.value = tagsProcessoData
      .filter(tag => tag.tag_processo)
      .map(tag => ({ name: tag.tag_processo!, color: tag.color }))
  } catch (error) {
    console.error('Erro ao carregar dados dos filtros:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadFilterData()
})
</script>

<style scoped>
.filter-panel {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid #e9ecef;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #f1f3f4;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filter-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.filter-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
  font-weight: 700;
}

.filter-actions {
  display: flex;
  align-items: center;
}

.filter-status {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.filter-count {
  font-size: 0.875rem;
  color: #667eea;
  font-weight: 600;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: 1px solid #90caf9;
}

.filter-hint {
  font-size: 0.875rem;
  color: #6c757d;
  font-style: italic;
}

.clear-filters-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.2);
}

.clear-filters-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(220, 53, 69, 0.3);
  background: linear-gradient(135deg, #c82333 0%, #a71e2a 100%);
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  color: #333;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
}

.label-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 6px;
  color: #667eea;
}

@media (max-width: 1024px) {
  .filter-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .filters-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
  }
  
  .filter-panel {
    padding: 1.5rem;
  }
}

@media (max-width: 768px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-header {
    text-align: center;
  }
  
  .header-content {
    justify-content: center;
  }
  
  .filter-status {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>