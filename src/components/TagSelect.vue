<template>
  <div class="tag-select">
    <!-- Chips das tags selecionadas -->
    <div v-if="modelValue.length > 0" class="selected-tags">
      <TagChip
        v-for="tag in modelValue"
        :key="tag"
        :tag="tag"
        :type="type"
        :color="findTagColor(tag)"
        @remove="removeTag(tag)"
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
      
      <!-- Dropdown com lista de tags -->
      <div v-if="showDropdown && filteredTags.length > 0" class="dropdown">
        <div
          v-for="tagOption in filteredTags"
          :key="tagOption.name"
          @mousedown="selectTag(tagOption.name)"
          class="dropdown-item"
          :class="{ 
            selected: isSelected(tagOption.name),
            [`dropdown-item--${type}`]: true
          }"
        >
          <div 
            class="tag-preview" 
            :class="`tag-preview--${type}`"
            :style="getPreviewStyles(tagOption.color)"
          >
            <span class="tag-text">{{ tagOption.name }}</span>
          </div>
          
          <div v-if="isSelected(tagOption.name)" class="check-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
          </div>
        </div>
      </div>
      
      <!-- Estado vazio -->
      <div v-else-if="showDropdown && searchQuery && filteredTags.length === 0" class="dropdown empty">
        <div class="empty-state">
          <span>Nenhuma tag encontrada</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import TagChip from './TagChip.vue'
import { getTagStyles } from '@/utils/tagColors'

const props = defineProps<{
  modelValue: string[]
  options: Array<{ name: string; color?: string | null }>
  type: 'tag' | 'tag_processo'
  placeholder?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const searchQuery = ref('')
const showDropdown = ref(false)

const filteredTags = computed(() => {
  if (!searchQuery.value) return props.options
  
  const query = searchQuery.value.toLowerCase()
  return props.options.filter(tagOption => 
    tagOption.name.toLowerCase().includes(query)
  )
})

const isSelected = (tagName: string): boolean => {
  return props.modelValue.includes(tagName)
}

const selectTag = (tagName: string) => {
  if (isSelected(tagName)) {
    removeTag(tagName)
  } else {
    emit('update:modelValue', [...props.modelValue, tagName])
  }
  searchQuery.value = ''
}

const removeTag = (tagName: string) => {
  const newValue = props.modelValue.filter(t => t !== tagName)
  emit('update:modelValue', newValue)
}

const findTagColor = (tagName: string): string | null => {
  const tagOption = props.options.find(opt => opt.name === tagName)
  return tagOption?.color || null
}

const getPreviewStyles = (color: string | null) => {
  return getTagStyles(color, props.type)
}

const handleBlur = () => {
  setTimeout(() => {
    showDropdown.value = false
    searchQuery.value = ''
  }, 200)
}

// Limpar busca quando fechar dropdown
watch(showDropdown, (isOpen) => {
  if (!isOpen) {
    searchQuery.value = ''
  }
})
</script>

<style scoped>
.tag-select {
  position: relative;
}

.selected-tags {
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
  justify-content: space-between;
  padding: 0.875rem 1rem;
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
  background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
}

.dropdown-item--tag.selected {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
}

.dropdown-item--tag_processo.selected {
  background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
}

.tag-preview {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid;
  transition: all 150ms ease;
}

/* Fallback para tags sem cor definida */
.tag-preview--tag:not([style*="background-color"]) {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  color: #1565c0;
  border-color: #90caf9;
}

.tag-preview--tag_processo:not([style*="background-color"]) {
  background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
  color: #7b1fa2;
  border-color: #ce93d8;
}

.tag-text {
  white-space: nowrap;
}

.check-icon {
  margin-left: 0.5rem;
  flex-shrink: 0;
}

.dropdown-item--tag .check-icon {
  color: #1565c0;
}

.dropdown-item--tag_processo .check-icon {
  color: #7b1fa2;
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