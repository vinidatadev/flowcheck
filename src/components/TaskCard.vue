<template>
  <div 
    class="task-card"
    :class="{ 'high-priority': task.prioridade, 'dragging': isDragging, 'no-drag': !canMove }"
    @click="$emit('click', task)"
    :draggable="canMove"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
  >
    <div class="task-header">
      <h4 class="task-title">{{ task.titulo_task || 'Sem título' }}</h4>
      <div v-if="task.prioridade" class="priority-indicator">
        🔥
      </div>
    </div>
    
    <div class="task-people" v-if="responsaveis.length > 0 || solicitantes.length > 0">
      <div v-if="responsaveis.length > 0" class="people-group">
        <span class="people-label">Resp:</span>
        <AvatarGroup :users="responsaveis" :max-visible="2" />
      </div>
      
      <div v-if="solicitantes.length > 0" class="people-group">
        <span class="people-label">Sol:</span>
        <AvatarGroup :users="solicitantes" :max-visible="2" />
      </div>
    </div>
    
    <div v-if="allTags.length > 0" class="task-tags">
      <TaskTag
        v-for="tagInfo in visibleTagsWithInfo"
        :key="tagInfo.name"
        :tag="tagInfo.name"
        :type="tagInfo.type"
        :color="tagInfo.color"
      />
      <span v-if="remainingTagsCount > 0" class="tag remaining">
        +{{ remainingTagsCount }}
      </span>
    </div>
    
    <div class="task-footer">
      <div v-if="task.percenti_concluido !== null" class="progress-bar">
        <div class="progress-label">{{ task.percenti_concluido }}%</div>
        <div class="progress-track">
          <div 
            class="progress-fill"
            :style="{ width: `${task.percenti_concluido}%` }"
          ></div>
        </div>
      </div>
      
      <div class="task-indicators">
        <span v-if="task.projeto" class="indicator project" title="Projeto">📋</span>
        <span v-if="task.pos_s4hana" class="indicator s4hana" title="SAP S/4HANA">🔧</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMetadata } from '@/composables/useMetadata'
import { usePermissions } from '@/composables/usePermissions'
import AvatarGroup from './AvatarGroup.vue'
import TaskTag from './TaskTag.vue'
import type { Task } from '@/types/flowcheck'

const props = defineProps<{
  task: Task
}>()

const emit = defineEmits<{
  click: [task: Task]
}>()

const isDragging = ref(false)
const metadata = useMetadata()
const permissions = usePermissions()

// Verificar se pode mover tasks
const canMove = computed(() => permissions.canMoveTask.value)

// Carregar metadados se necessário
onMounted(() => {
  if (metadata.state.users.length === 0) {
    metadata.loadMetadata()
  }
})

const responsaveis = computed(() => {
  if (!props.task.responsavel) return []
  return metadata.getUsersByNames(props.task.responsavel)
})

const solicitantes = computed(() => {
  if (!props.task.solicitante) return []
  return metadata.getUsersByNames(props.task.solicitante)
})

const allTags = computed(() => {
  const tags = [...(props.task.tag || []), ...(props.task.tag_processo || [])]
  return tags
})

const allTagsWithInfo = computed(() => {
  const normalTags = (props.task.tag || []).map(tag => ({
    name: tag,
    type: 'tag' as const,
    color: metadata.getTagColor(tag)
  }))
  
  const processTags = (props.task.tag_processo || []).map(tag => ({
    name: tag,
    type: 'tag_processo' as const,
    color: metadata.getTagProcessoColor(tag)
  }))
  
  return [...normalTags, ...processTags]
})

const visibleTagsWithInfo = computed(() => {
  return allTagsWithInfo.value.slice(0, 3)
})

const visibleTags = computed(() => {
  return allTags.value.slice(0, 3)
})

const remainingTagsCount = computed(() => {
  return Math.max(0, allTags.value.length - 3)
})

const handleDragStart = (event: DragEvent) => {
  if (!canMove.value) {
    event.preventDefault()
    return
  }
  
  isDragging.value = true
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', JSON.stringify({
      taskId: props.task.id
    }))
  }
}

const handleDragEnd = () => {
  isDragging.value = false
}
</script>

<style scoped>
.task-card {
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.task-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.task-card.high-priority {
  border-left: 4px solid #ff6b6b;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.task-title {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
  line-height: 1.3;
  flex: 1;
}

.priority-indicator {
  font-size: 1rem;
  margin-left: 0.5rem;
}

.task-people {
  margin-bottom: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.people-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.people-label {
  font-size: 0.7rem;
  color: #666;
  font-weight: 500;
  min-width: 30px;
}

.task-responsaveis {
  margin-bottom: 0.75rem;
}

.responsavel-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.responsavel-tag {
  background-color: #e3f2fd;
  color: #1565c0;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.task-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
}

.tag.remaining {
  background-color: #e9ecef;
  color: #6c757d;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 9999px;
  font-size: 10px;
  border: 1px solid #dee2e6;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.progress-bar {
  flex: 1;
}

.progress-label {
  font-size: 0.7rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.progress-track {
  height: 4px;
  background-color: #e9ecef;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s;
}

.task-indicators {
  display: flex;
  gap: 0.25rem;
}

.task-card.no-drag {
  cursor: default;
}

.task-card.no-drag:hover {
  transform: none;
}

.task-card.dragging {
  opacity: 0.5;
  transform: rotate(5deg);
}

.indicator {
  font-size: 0.8rem;
}
</style>