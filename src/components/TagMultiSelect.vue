<template>
  <div class="tag-multi-select">
    <div class="selected-tags" v-if="selectedTags.length > 0">
      <span
        v-for="tag in selectedTags"
        :key="tag"
        class="selected-tag"
      >
        {{ tag }}
        <button
          @click="removeTag(tag)"
          type="button"
          class="remove-button"
          :disabled="disabled"
        >
          ×
        </button>
      </span>
    </div>

    <div class="search-container">
      <input
        v-model="searchQuery"
        @focus="showDropdown = true"
        @blur="handleBlur"
        :placeholder="placeholder"
        :disabled="disabled"
        class="search-input"
      />
      
      <div v-if="showDropdown && filteredTags.length > 0" class="dropdown">
        <div
          v-for="tag in filteredTags"
          :key="tag"
          @mousedown="selectTag(tag)"
          class="dropdown-item"
          :class="{ selected: isSelected(tag) }"
        >
          <span class="tag-name">{{ tag }}</span>
          <span v-if="isSelected(tag)" class="check-icon">✓</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  modelValue: string[]
  options: string[]
  placeholder?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const searchQuery = ref('')
const showDropdown = ref(false)

const selectedTags = computed(() => {
  return props.modelValue
})

const filteredTags = computed(() => {
  if (!searchQuery.value) return props.options
  
  const query = searchQuery.value.toLowerCase()
  return props.options.filter(tag => 
    tag.toLowerCase().includes(query)
  )
})

const isSelected = (tag: string): boolean => {
  return props.modelValue.includes(tag)
}

const selectTag = (tag: string) => {
  if (isSelected(tag)) {
    removeTag(tag)
  } else {
    emit('update:modelValue', [...props.modelValue, tag])
  }
  searchQuery.value = ''
}

const removeTag = (tag: string) => {
  const newValue = props.modelValue.filter(t => t !== tag)
  emit('update:modelValue', newValue)
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
.tag-multi-select {
  position: relative;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.selected-tag {
  display: inline-flex;
  align-items: center;
  background-color: #e3f2fd;
  color: #1565c0;
  padding: 0.4rem 0.6rem;
  border-radius: 16px;
  font-size: 0.85rem;
  font-weight: 500;
  gap: 0.5rem;
}

.remove-button {
  background: none;
  border: none;
  color: #1565c0;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 0;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.remove-button:hover:not(:disabled) {
  background-color: rgba(21, 101, 192, 0.1);
}

.remove-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.search-container {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.search-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
}

.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.dropdown-item.selected {
  background-color: #e3f2fd;
}

.tag-name {
  font-size: 0.9rem;
  color: #333;
}

.check-icon {
  color: #2196f3;
  font-weight: bold;
}
</style>