<template>
  <div
    class="queue-item"
    :class="{ 'high-priority': task.prioridade }"
    @click="$emit('click', task)"
  >
    <div class="priority-bar" v-if="task.prioridade" title="Alta prioridade"></div>

    <div class="item-content">
      <!-- Row 1: title + badges -->
      <div class="item-header">
        <div class="item-title-row">
          <span v-if="task.prioridade" class="priority-icon" title="Alta prioridade">🔥</span>
          <h4 class="item-title">{{ task.titulo_task || 'Sem título' }}</h4>
        </div>
        <div class="item-badges">
          <span class="badge badge-bucket">{{ task.bucketName }}</span>
          <span
            class="badge badge-status"
            :class="task.categoryName === 'Em Andamento' ? 'status-in-progress' : 'status-not-started'"
          >
            {{ task.categoryName }}
          </span>
          <span v-if="task.projeto" class="badge badge-projeto">Projeto</span>
        </div>
      </div>

      <!-- Row 2: tags -->
      <div v-if="hasTags" class="tags-row">
        <span
          v-for="tag in task.tag"
          :key="'t-' + tag"
          class="tag-chip"
          :style="tagStyle(tag)"
        >{{ tag }}</span>
        <span
          v-for="tp in task.tag_processo"
          :key="'tp-' + tp"
          class="tag-chip tag-processo"
          :style="tagProcessoStyle(tp)"
        >{{ tp }}</span>
      </div>

      <!-- Row 3: subtasks -->
      <div v-if="hasSubtasks" class="subtasks-preview">
        <div class="subtasks-header">
          <span class="subtasks-icon">📋</span>
          <span class="subtasks-title">Subtasks ({{ completedCount }}/{{ totalSubtasks }})</span>
        </div>
        <div class="subtasks-list">
          <div
            v-for="(subtask, index) in task.subtask"
            :key="index"
            class="subtask-preview-item"
            :class="{ 'subtask-completed': task.subtask_bool?.[index] }"
          >
            <span class="subtask-checkbox">
              {{ task.subtask_bool?.[index] ? '✅' : '⬜' }}
            </span>
            <span class="subtask-text">{{ subtask }}</span>
          </div>
        </div>
      </div>

      <!-- Row 4: people + progress + dates -->
      <div class="item-footer">
        <!-- Responsáveis -->
        <div class="people-group">
          <span class="people-label">Resp.</span>
          <AvatarGroup v-if="responsaveis.length > 0" :users="responsaveis" :max-visible="3" />
          <span v-else class="no-value">—</span>
        </div>

        <!-- Solicitantes -->
        <div class="people-group">
          <span class="people-label">Solic.</span>
          <AvatarGroup v-if="solicitantes.length > 0" :users="solicitantes" :max-visible="3" />
          <span v-else class="no-value">—</span>
        </div>

        <!-- Progress -->
        <div class="progress-group" v-if="task.percenti_concluido !== null">
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: `${task.percenti_concluido}%` }"></div>
          </div>
          <span class="progress-label">{{ task.percenti_concluido }}%</span>
        </div>

        <!-- Dates -->
        <div class="dates-group">
          <span v-if="formattedInicio" class="date-chip" title="Data início">
            <span class="date-icon">▶</span>{{ formattedInicio }}
          </span>
          <span v-if="formattedFim" class="date-chip date-fim" :class="{ overdue: isOverdue }" title="Data fim">
            <span class="date-icon">⏹</span>{{ formattedFim }}
          </span>
          <span v-if="!formattedInicio && !formattedFim" class="no-value">Sem prazo</span>
        </div>

        <!-- Indicators -->
        <div class="indicators">
          <span v-if="obsText" class="obs-badge" :title="obsText">{{ obsText }}</span>
          <span v-if="task.pos_s4hana" class="indicator" title="SAP S/4HANA">🔧</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import AvatarGroup from './AvatarGroup.vue'
import { useMetadata } from '@/composables/useMetadata'
import type { TaskWithContext } from '@/types/flowcheck'

const props = defineProps<{ task: TaskWithContext }>()
defineEmits<{ click: [task: TaskWithContext] }>()

const metadata = useMetadata()

onMounted(() => {
  if (metadata.state.users.length === 0) metadata.loadMetadata()
})

const responsaveis = computed(() =>
  props.task.responsavel ? metadata.getUsersByNames(props.task.responsavel) : []
)

const solicitantes = computed(() =>
  props.task.solicitante ? metadata.getUsersByNames(props.task.solicitante) : []
)

const hasTags = computed(() =>
  (props.task.tag?.length ?? 0) > 0 || (props.task.tag_processo?.length ?? 0) > 0
)

const hasSubtasks = computed(() => (props.task.subtask?.length ?? 0) > 0)

const totalSubtasks = computed(() => props.task.subtask?.length ?? 0)

const completedCount = computed(() => 
  props.task.subtask_bool?.filter(bool => bool === true).length ?? 0
)

function formatDate(d: string | null): string {
  if (!d) return ''
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

const formattedInicio = computed(() => formatDate(props.task.data_inicio))
const formattedFim    = computed(() => formatDate(props.task.data_fim))

const isOverdue = computed(() => {
  if (!props.task.data_fim) return false
  return new Date(props.task.data_fim) < new Date()
})

function tagStyle(name: string) {
  const color = metadata.getTagColor(name)
  return color ? { backgroundColor: color + '22', color, borderColor: color + '55' } : {}
}

function tagProcessoStyle(name: string) {
  const color = metadata.getTagProcessoColor(name)
  return color ? { backgroundColor: color + '22', color, borderColor: color + '55' } : {}
}

const obsText = computed(() => metadata.getObsProcessoText(props.task.id_obs_processo ?? null))
</script>

<style scoped>
.queue-item {
  display: flex;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: box-shadow 0.2s, border-color 0.2s;
  overflow: hidden;
}

.queue-item:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.priority-bar {
  width: 4px;
  background-color: #dc3545;
  flex-shrink: 0;
}

.item-content {
  flex: 1;
  padding: 0.7rem 1rem;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

/* ── Row 1: header ── */
.item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.item-title-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  min-width: 0;
  flex: 1;
}

.priority-icon { font-size: 0.9rem; flex-shrink: 0; }

.item-title {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-badges {
  display: flex;
  gap: 0.35rem;
  flex-shrink: 0;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  white-space: nowrap;
}

.badge-bucket       { background-color: #e8eaf6; color: #3949ab; }
.badge-projeto      { background-color: #e8f5e9; color: #2e7d32; }
.status-in-progress { background-color: #fff3cd; color: #b45309; }
.status-not-started { background-color: #f1f3f5; color: #6c757d; }

/* ── Row 2: tags ── */
.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.tag-chip {
  padding: 1px 8px;
  border-radius: 10px;
  font-size: 0.68rem;
  font-weight: 500;
  border: 1px solid #e1e5e9;
  background: #f8f9fa;
  color: #495057;
  white-space: nowrap;
}

/* ── Row 3: subtasks preview ── */
.subtasks-preview {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.5rem;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
}

.subtasks-header {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.subtasks-icon {
  font-size: 0.75rem;
}

.subtasks-title {
  font-size: 0.7rem;
  font-weight: 600;
  color: #495057;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.subtasks-list {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.subtask-preview-item {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  padding: 0.3rem 0.4rem;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.subtask-preview-item:hover {
  background: #f8f9fa;
}

.subtask-preview-item.subtask-completed {
  opacity: 0.7;
}

.subtask-preview-item.subtask-completed .subtask-text {
  text-decoration: line-through;
  color: #6c757d;
}

.subtask-checkbox {
  font-size: 0.75rem;
  flex-shrink: 0;
  line-height: 1.4;
}

.subtask-text {
  font-size: 0.75rem;
  color: #333;
  line-height: 1.4;
  word-break: break-word;
}

/* ── Row 4: footer ── */
.item-footer {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.people-group {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-shrink: 0;
}

.people-label {
  font-size: 0.68rem;
  color: #adb5bd;
  font-weight: 500;
  white-space: nowrap;
}

.no-value {
  color: #adb5bd;
  font-size: 0.75rem;
}

.progress-group {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex: 1;
  min-width: 80px;
  max-width: 160px;
}

.progress-track {
  flex: 1;
  height: 5px;
  background-color: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s;
}

.progress-label {
  font-size: 0.7rem;
  color: #666;
  white-space: nowrap;
  min-width: 28px;
  text-align: right;
}

.dates-group {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
}

.date-chip {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 0.7rem;
  color: #6c757d;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 2px 7px;
  white-space: nowrap;
}

.date-chip.date-fim.overdue {
  color: #dc3545;
  background: #fff5f5;
  border-color: #f5c6cb;
}

.date-icon {
  font-size: 0.55rem;
  opacity: 0.6;
}

.indicators {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex-shrink: 0;
}

.indicator { font-size: 0.85rem; }

.obs-badge {
  font-size: 0.68rem;
  font-weight: 600;
  background: #e0f2fe;
  color: #0369a1;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  padding: 2px 7px;
  white-space: nowrap;
}
</style>
