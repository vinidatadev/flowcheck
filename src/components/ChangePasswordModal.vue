<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ title }}</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <div v-if="errorMsg" class="alert-error">{{ errorMsg }}</div>
        <div v-if="successMsg" class="alert-success">{{ successMsg }}</div>

        <div class="form-group">
          <label>Nova senha *</label>
          <div class="pw-wrap">
            <input
              v-model="newPassword"
              :type="showNew ? 'text' : 'password'"
              placeholder="Mínimo 6 caracteres"
              minlength="6"
              required
              :disabled="loading"
            />
            <button type="button" class="eye-btn" @click="showNew = !showNew">
              {{ showNew ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>

        <div class="form-group">
          <label>Confirmar nova senha *</label>
          <div class="pw-wrap">
            <input
              v-model="confirmPassword"
              :type="showConfirm ? 'text' : 'password'"
              placeholder="Repita a nova senha"
              minlength="6"
              required
              :disabled="loading"
            />
            <button type="button" class="eye-btn" @click="showConfirm = !showConfirm">
              {{ showConfirm ? '🙈' : '👁️' }}
            </button>
          </div>
          <p v-if="confirmPassword && newPassword !== confirmPassword" class="field-error">
            As senhas não coincidem.
          </p>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="$emit('close')" :disabled="loading">
            Cancelar
          </button>
          <button type="submit" class="btn-save" :disabled="loading || !isValid">
            {{ loading ? 'Salvando...' : 'Salvar senha' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  isOpen: boolean
  title?: string
  onSave: (newPassword: string) => Promise<void>
}>()

const emit = defineEmits<{ close: [] }>()

const newPassword    = ref('')
const confirmPassword = ref('')
const showNew        = ref(false)
const showConfirm    = ref(false)
const loading        = ref(false)
const errorMsg       = ref('')
const successMsg     = ref('')

const isValid = computed(() =>
  newPassword.value.length >= 6 &&
  newPassword.value === confirmPassword.value
)

// Reset state when modal opens
watch(() => props.isOpen, (open) => {
  if (open) {
    newPassword.value = ''
    confirmPassword.value = ''
    showNew.value = false
    showConfirm.value = false
    errorMsg.value = ''
    successMsg.value = ''
    loading.value = false
  }
})

async function handleSubmit() {
  if (!isValid.value) return
  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''
  try {
    await props.onSave(newPassword.value)
    successMsg.value = 'Senha alterada com sucesso!'
    setTimeout(() => emit('close'), 1200)
  } catch (err) {
    errorMsg.value = err instanceof Error ? err.message : 'Erro ao salvar senha.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #666;
  padding: 0.25rem;
  border-radius: 4px;
}

.close-btn:hover { background: #f8f9fa; }

.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.alert-error {
  background: #fff5f5;
  border: 1px solid #f5c6cb;
  color: #dc3545;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
}

.alert-success {
  background: #f0fff4;
  border: 1px solid #c3e6cb;
  color: #28a745;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #333;
}

.pw-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.pw-wrap input {
  flex: 1;
  padding: 0.75rem 2.5rem 0.75rem 0.875rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: border-color 0.2s;
  width: 100%;
  box-sizing: border-box;
}

.pw-wrap input:focus {
  outline: none;
  border-color: #667eea;
}

.pw-wrap input:disabled { opacity: 0.6; }

.eye-btn {
  position: absolute;
  right: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.25rem;
}

.field-error {
  margin: 0;
  font-size: 0.78rem;
  color: #dc3545;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding-top: 0.5rem;
}

.btn-cancel {
  padding: 0.7rem 1.25rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
}

.btn-cancel:hover:not(:disabled) { background: #5a6268; }

.btn-save {
  padding: 0.7rem 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
}

.btn-save:hover:not(:disabled) { opacity: 0.9; }
.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
