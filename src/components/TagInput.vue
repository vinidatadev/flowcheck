<template>
  <div class="tag-input">
    <div class="tags-container">
      <span
        v-for="(tag, index) in modelValue"
        :key="index"
        class="tag"
      >
        {{ tag }}
        <button
          @click="removeTag(index)"
          type="button"
          class="tag-remove"
          :disabled="disabled"
        >
          ×
        </button>
      </span>
      
      <input
        v-model="inputValue"
        @keydown.enter.prevent="addTag"
        @keydown.comma.prevent="addTag"
        :placeholder="placeholder"
        :disabled="disabled"
        class="tag-input-field"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  modelValue: string[]
  placeholder?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const inputValue = ref('')

const addTag = () => {
  const value = inputValue.value.trim()
  if (value && !props.modelValue.includes(value)) {
    emit('update:modelValue', [...props.modelValue, value])
    inputValue.value = ''
  }
}

const removeTag = (index: number) => {
  const newTags = [...props.modelValue]
  newTags.splice(index, 1)
  emit('update:modelValue', newTags)
}
</script>

<style scoped>
.tag-input {
  width: 100%;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  min-height: 44px;
  align-items: center;
  transition: border-color 0.2s;
}

.tags-container:focus-within {
  border-color: #667eea;
}

.tag {
  display: inline-flex;
  align-items: center;
  background-color: #e3f2fd;
  color: #1565c0;
  padding: 0.25rem 0.5rem;
  border-radius: 16px;
  font-size: 0.85rem;
  font-weight: 500;
  gap: 0.25rem;
}

.tag-remove {
  background: none;
  border: none;
  color: #1565c0;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 0;
  margin-left: 0.25rem;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.tag-remove:hover:not(:disabled) {
  background-color: rgba(21, 101, 192, 0.1);
}

.tag-remove:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.tag-input-field {
  border: none;
  outline: none;
  flex: 1;
  min-width: 120px;
  font-size: 0.9rem;
  padding: 0.25rem;
}

.tag-input-field:disabled {
  background-color: transparent;
  cursor: not-allowed;
}

.tag-input-field::placeholder {
  color: #999;
}
</style>