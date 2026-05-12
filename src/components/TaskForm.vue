<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>{{ mode === 'create' ? 'Nova Task' : 'Editar Task' }}</h2>
        <button @click="closeModal" type="button" class="close-button">✕</button>
      </div>

      <form @submit.prevent="handleSubmit" class="task-form">

        <!-- ── Seção: Informações Básicas (todos os níveis) ── -->
        <div class="form-section">
          <h3>Informações Básicas</h3>

          <div class="form-group">
            <label for="titulo_task">Título *</label>
            <input
              id="titulo_task"
              v-model="formData.titulo_task"
              type="text"
              required
              placeholder="Digite o título da task"
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label for="descricao">Descrição *</label>
            <textarea
              id="descricao"
              v-model="formData.descricao"
              required
              rows="4"
              placeholder="Descreva a task detalhadamente"
              :disabled="loading"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>
                <input v-model="formData.prioridade" type="checkbox" :disabled="loading" />
                Prioridade Alta
              </label>
            </div>

            <!-- Progresso: só nível 2 -->
            <div v-if="isLevel2" class="form-group">
              <label for="percenti_concluido">Progresso: {{ formData.percenti_concluido }}%</label>
              <input
                id="percenti_concluido"
                v-model.number="formData.percenti_concluido"
                type="range" min="0" max="100" step="5"
                :disabled="loading"
              />
            </div>
          </div>
        </div>

        <!-- ── Seção: Detalhes (só nível 2) ── -->
        <div v-if="isLevel2" class="form-section">
          <h3>Detalhes</h3>

          <div class="form-row">
            <div class="form-group">
              <label for="data_inicio">Data de Início</label>
              <input id="data_inicio" v-model="formData.data_inicio" type="datetime-local" :disabled="loading" />
            </div>
            <div class="form-group">
              <label for="data_fim">Data de Fim</label>
              <input id="data_fim" v-model="formData.data_fim" type="datetime-local" :disabled="loading" />
            </div>
          </div>

          <div class="form-group">
            <label for="ganhos">Ganhos Esperados</label>
            <textarea
              id="ganhos"
              v-model="formData.ganhos"
              rows="2"
              placeholder="Descreva os ganhos esperados"
              :disabled="loading"
            ></textarea>
          </div>
        </div>

        <!-- Ganhos: nível 1 vê aqui (fora da seção Detalhes) -->
        <div v-if="!isLevel2" class="form-section">
          <h3>Detalhes</h3>
          <div class="form-group">
            <label for="ganhos_l1">Ganhos Esperados</label>
            <textarea
              id="ganhos_l1"
              v-model="formData.ganhos"
              rows="2"
              placeholder="Descreva os ganhos esperados"
              :disabled="loading"
            ></textarea>
          </div>
        </div>

        <!-- ── Seção: Pessoas e Tags ── -->
        <div class="form-section">
          <h3>Pessoas{{ isLevel2 ? ' e Tags' : '' }}</h3>

          <div class="form-group">
            <label>Responsáveis</label>
            <UserMultiSelect
              v-model="formData.responsavel"
              :users="metadata.state.users"
              placeholder="Busque e selecione responsáveis"
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label>Solicitantes *</label>
            <UserMultiSelect
              v-model="formData.solicitante"
              :users="metadata.state.users"
              placeholder="Busque e selecione solicitantes"
              :disabled="loading"
            />
            <p v-if="formData.solicitante.length === 0" class="field-hint">Obrigatório — você já foi adicionado por padrão.</p>
          </div>

          <!-- Tags: só nível 2 -->
          <template v-if="isLevel2">
            <div class="form-group">
              <label>Tags</label>
              <TagMultiSelect
                v-model="formData.tag"
                :options="tagOptions"
                placeholder="Busque e selecione tags"
                :disabled="loading"
              />
            </div>

            <div class="form-group">
              <label>Tags de Processo</label>
              <TagMultiSelect
                v-model="formData.tag_processo"
                :options="tagProcessoOptions"
                placeholder="Busque e selecione tags de processo"
                :disabled="loading"
              />
            </div>
          </template>
        </div>

        <!-- ── Seção: Subtasks (só nível 2) ── -->
        <div v-if="isLevel2" class="form-section">
          <h3>Subtasks</h3>
          <SubtaskList
            v-model:subtasks="formData.subtask"
            v-model:completed="formData.subtask_bool"
            :disabled="loading"
          />
        </div>

        <!-- ── Seção: Configurações (só nível 2) ── -->
        <div v-if="isLevel2" class="form-section">
          <h3>Configurações</h3>
          <div class="form-row">
            <div class="form-group">
              <label>
                <input v-model="formData.projeto" type="checkbox" :disabled="loading" />
                É um Projeto
              </label>
            </div>
            <div class="form-group">
              <label>
                <input v-model="formData.pos_s4hana" type="checkbox" :disabled="loading" />
                Relacionado ao SAP S/4HANA
              </label>
            </div>
          </div>
        </div>

        <!-- ── Ações ── -->
        <div class="form-actions">
          <div class="left-actions">
            <button
              v-if="mode === 'edit' && permissions.canDeleteTask.value"
              type="button"
              @click="handleDelete"
              class="delete-button"
              :disabled="loading"
            >
              🗑️ Excluir Task
            </button>
          </div>
          <div class="right-actions">
            <button type="button" @click="closeModal" class="cancel-button" :disabled="loading">
              Cancelar
            </button>
            <button type="submit" class="save-button" :disabled="loading || !isFormValid">
              {{ loading ? 'Salvando...' : (mode === 'create' ? 'Criar Task' : 'Salvar Alterações') }}
            </button>
          </div>
        </div>

      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useMetadata } from '@/composables/useMetadata'
import { usePermissions } from '@/composables/usePermissions'
import UserMultiSelect from './UserMultiSelect.vue'
import TagMultiSelect from './TagMultiSelect.vue'
import SubtaskList from './SubtaskList.vue'
import type { Task, TaskFormData } from '@/types/flowcheck'
import type { User } from '@/types/user'

const props = defineProps<{
  isOpen: boolean
  mode: 'create' | 'edit'
  task?: Task | null
  currentUser?: User | null
  userLevel?: number | null
}>()

const emit = defineEmits<{
  close: []
  save: [data: TaskFormData]
  delete: []
}>()

const loading = ref(false)
const metadata = useMetadata()
const permissions = usePermissions()

const isLevel2 = computed(() => (props.userLevel ?? 0) === 2)

const formData = ref<TaskFormData>({
  titulo_task: '',
  descricao: '',
  prioridade: false,
  percenti_concluido: 0,
  tag: [],
  tag_processo: [],
  responsavel: [],
  data_inicio: null,
  data_fim: null,
  subtask: [],
  subtask_bool: [],
  solicitante: [],
  ganhos: '',
  projeto: false,
  pos_s4hana: false
})

const tagOptions = computed(() =>
  metadata.state.tags.map(t => t.tag).filter(Boolean) as string[]
)

const tagProcessoOptions = computed(() =>
  metadata.state.tagsProcesso.map(t => t.tag_processo).filter(Boolean) as string[]
)

const isFormValid = computed(() => {
  const d = formData.value
  const baseValid = d.titulo_task.trim() !== '' && d.descricao.trim() !== ''
  // Solicitante is required for all levels
  const solicitanteValid = d.solicitante.length > 0
  return baseValid && solicitanteValid
})

onMounted(() => {
  metadata.loadMetadata()
})

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) resetForm()
})

function defaultSolicitante(): string[] {
  const name = props.currentUser?.nome_usuario
  return name ? [name] : []
}

function resetForm() {
  if (props.task) {
    formData.value = {
      titulo_task: props.task.titulo_task || '',
      descricao: props.task.descricao || '',
      prioridade: props.task.prioridade || false,
      percenti_concluido: props.task.percenti_concluido || 0,
      tag: props.task.tag || [],
      tag_processo: props.task.tag_processo || [],
      responsavel: props.task.responsavel || [],
      data_inicio: formatDateForInput(props.task.data_inicio),
      data_fim: formatDateForInput(props.task.data_fim),
      subtask: props.task.subtask || [],
      subtask_bool: props.task.subtask_bool || [],
      solicitante: props.task.solicitante?.length
        ? props.task.solicitante
        : defaultSolicitante(),
      ganhos: props.task.ganhos || '',
      projeto: props.task.projeto || false,
      pos_s4hana: props.task.pos_s4hana || false
    }
  } else {
    formData.value = {
      titulo_task: '',
      descricao: '',
      prioridade: false,
      percenti_concluido: 0,
      tag: [],
      tag_processo: [],
      responsavel: [],
      data_inicio: null,
      data_fim: null,
      subtask: [],
      subtask_bool: [],
      solicitante: defaultSolicitante(),
      ganhos: '',
      projeto: false,
      pos_s4hana: false
    }
  }
}

function formatDateForInput(dateString: string | null): string | null {
  if (!dateString) return null
  try {
    return new Date(dateString).toISOString().slice(0, 16)
  } catch {
    return null
  }
}

function closeModal() {
  emit('close')
}

async function handleSubmit() {
  if (!isFormValid.value) return
  loading.value = true
  try {
    emit('save', formData.value)
  } finally {
    loading.value = false
  }
}

function handleDelete() {
  emit('delete')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

.modal-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.25rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-button:hover { background-color: #f8f9fa; }

.task-form { padding: 1.5rem; }

.form-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.form-section:last-of-type { border-bottom: none; }

.form-section h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1rem;
  font-weight: 600;
}

.form-group { margin-bottom: 1rem; }

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.form-group input[type="text"],
.form-group input[type="datetime-local"],
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-group input[type="text"]:focus,
.form-group input[type="datetime-local"]:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-group input[type="range"] {
  width: 100%;
  margin-top: 0.5rem;
}

.form-group input[type="checkbox"] { margin-right: 0.5rem; }

.field-hint {
  margin: 0.35rem 0 0;
  font-size: 0.78rem;
  color: #adb5bd;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
  margin-top: 2rem;
}

.left-actions,
.right-actions {
  display: flex;
  gap: 1rem;
}

.save-button,
.cancel-button,
.delete-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.save-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.save-button:hover:not(:disabled) { opacity: 0.9; }
.save-button:disabled { opacity: 0.6; cursor: not-allowed; }

.cancel-button { background-color: #6c757d; color: white; }
.cancel-button:hover:not(:disabled) { background-color: #5a6268; }

.delete-button { background-color: #dc3545; color: white; }
.delete-button:hover:not(:disabled) { background-color: #c82333; }
</style>
