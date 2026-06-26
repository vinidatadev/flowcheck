<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>{{ task?.titulo_task || 'Detalhes da Task' }}</h2>
        <div class="header-actions">
          <button 
            v-if="canEditThisTask"
            @click="$emit('edit')" 
            class="edit-button"
          >
            ✏️ Editar
          </button>
          <button @click="closeModal" class="close-button">✕</button>
        </div>
      </div>
      
      <div v-if="task" class="modal-body">
        <div class="detail-section">
          <label>Título:</label>
          <p>{{ task.titulo_task || 'Não informado' }}</p>
        </div>
        
        <div v-if="task.descricao" class="detail-section">
          <label>Descrição:</label>
          <p class="description">{{ task.descricao }}</p>
        </div>
        
        <div v-if="responsaveis.length > 0" class="detail-section">
          <label>Responsáveis:</label>
          <div class="user-list">
            <div v-for="user in responsaveis" :key="user.id" class="user-item">
              <div class="user-avatar">
                <img v-if="user.foto" :src="user.foto" :alt="user.nome_usuario || 'Usuário'" />
                <div v-else class="avatar-placeholder">{{ getInitials(user.nome_usuario) }}</div>
              </div>
              <div class="user-info">
                <span class="user-name">{{ user.nome_usuario }}</span>
                <span class="user-role">{{ user.cargo }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="solicitantes.length > 0" class="detail-section">
          <label>Solicitantes:</label>
          <div class="user-list">
            <div v-for="user in solicitantes" :key="user.id" class="user-item">
              <div class="user-avatar">
                <img v-if="user.foto" :src="user.foto" :alt="user.nome_usuario || 'Usuário'" />
                <div v-else class="avatar-placeholder">{{ getInitials(user.nome_usuario) }}</div>
              </div>
              <div class="user-info">
                <span class="user-name">{{ user.nome_usuario }}</span>
                <span class="user-role">{{ user.cargo }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="task.tag && task.tag.length > 0" class="detail-section">
          <label>Tags:</label>
          <div class="tag-list">
            <span v-for="tag in task.tag" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>
        
        <div v-if="task.tag_processo && task.tag_processo.length > 0" class="detail-section">
          <label>Tags de Processo:</label>
          <div class="tag-list">
            <span v-for="tag in task.tag_processo" :key="tag" class="tag tag-processo">{{ tag }}</span>
          </div>
        </div>
        
        <div class="detail-row">
          <div class="detail-section">
            <label>Progresso:</label>
            <div class="progress-container">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: `${task.percenti_concluido || 0}%` }"></div>
              </div>
              <span class="progress-text">{{ task.percenti_concluido || 0 }}%</span>
            </div>
          </div>
          <div class="detail-section">
            <label>Prioridade:</label>
            <span :class="['priority-badge', { high: task.prioridade }]">
              {{ task.prioridade ? '🔥 Alta' : '📋 Normal' }}
            </span>
          </div>
        </div>
        
        <div v-if="task.data_inicio || task.data_fim" class="detail-row">
          <div v-if="task.data_inicio" class="detail-section">
            <label>Data de Início:</label>
            <p>{{ formatDate(task.data_inicio) }}</p>
          </div>
          <div v-if="task.data_fim" class="detail-section">
            <label>Data de Fim:</label>
            <p>{{ formatDate(task.data_fim) }}</p>
          </div>
        </div>
        
        <div class="detail-row">
          <div class="detail-section">
            <label>Status:</label>
            <span :class="['status-badge', statusClass]">{{ statusLabel }}</span>
          </div>
          <div class="detail-section">
            <label>Tipo:</label>
            <div class="type-indicators">
              <span v-if="task.projeto" class="type-badge">📋 Projeto</span>
              <span v-if="task.pos_s4hana" class="type-badge">🔧 SAP S/4HANA</span>
              <span v-if="!task.projeto && !task.pos_s4hana" class="type-badge">📝 Task</span>
            </div>
          </div>
        </div>
        
        <div class="detail-row">
          <div class="detail-section">
            <label>Criado em:</label>
            <p>{{ formatDate(task.created_at) }}</p>
          </div>
          <div v-if="criador" class="detail-section">
            <label>Criado por:</label>
            <div class="user-item creator-item">
              <div class="user-avatar">
                <img v-if="criador.foto" :src="criador.foto" :alt="criador.nome_usuario || 'Usuário'" />
                <div v-else class="avatar-placeholder">{{ getInitials(criador.nome_usuario) }}</div>
              </div>
              <div class="user-info">
                <span class="user-name">{{ criador.nome_usuario }}</span>
                <span v-if="criador.cargo" class="user-role">{{ criador.cargo }}</span>
              </div>
            </div>
          </div>
          <div v-else-if="task.criado_por" class="detail-section">
            <label>Criado por:</label>
            <p>{{ task.criado_por }}</p>
          </div>
        </div>

        <!-- ── Seção de Comentários ── -->
        <div class="comments-section">
          <label>Comentários ({{ sortedComments.length }})</label>

          <div v-if="sortedComments.length > 0" class="comments-list">
            <div v-for="c in sortedComments" :key="c.id" class="comment-item">
              <div class="comment-avatar">
                <img v-if="c.autor_foto" :src="c.autor_foto" :alt="c.autor_nome" />
                <div v-else class="avatar-placeholder small">{{ getInitials(c.autor_nome) }}</div>
              </div>
              <div class="comment-body">
                <div class="comment-meta">
                  <span class="comment-author">{{ c.autor_nome }}</span>
                  <span class="comment-date">{{ formatDate(c.criado_em) }}</span>
                </div>
                <p v-if="c.texto" class="comment-text" v-html="renderCommentText(c.texto)"></p>

                <!-- Anexos do comentário -->
                <div v-if="c.anexos && c.anexos.length > 0" class="comment-attachments">
                  <div class="attach-images" v-if="c.anexos.some(a => isImage(a.tipo))">
                    <div
                      v-for="att in c.anexos.filter(a => isImage(a.tipo))"
                      :key="att.url"
                      class="attach-thumb"
                      @click="openLightbox(att)"
                      :title="att.nome"
                    >
                      <img :src="att.url" :alt="att.nome" />
                    </div>
                  </div>
                  <div
                    v-for="att in c.anexos.filter(a => !isImage(a.tipo))"
                    :key="att.url"
                    class="attach-file"
                    @click="downloadAttachment(att)"
                    :title="`Baixar ${att.nome}`"
                  >
                    <span class="attach-file-icon">{{ fileIcon(att.tipo) }}</span>
                    <span class="attach-file-name">{{ att.nome }}</span>
                    <span class="attach-file-size">{{ formatBytes(att.tamanho) }}</span>
                    <span class="attach-download-icon">⬇️</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="no-comments">Nenhum comentário ainda.</div>

          <!-- Input de novo comentário — só quem tem permissão -->
          <div v-if="canCommentThisTask" class="new-comment">
            <div class="new-comment-avatar">
              <img v-if="currentUser?.foto" :src="currentUser.foto" :alt="currentUser.nome_usuario || ''" />
              <div v-else class="avatar-placeholder small">{{ getInitials(currentUser?.nome_usuario) }}</div>
            </div>
            <div class="new-comment-input">
              <div class="textarea-wrapper">
                <textarea
                  ref="textareaRef"
                  v-model="newCommentText"
                  placeholder="Escreva um comentário... Use @ para mencionar alguém"
                  rows="2"
                  :disabled="savingComment"
                  @keydown.ctrl.enter.prevent="submitComment"
                  @keydown="onTextareaKeydown"
                  @input="onTextareaInput"
                  @paste="onPaste"
                ></textarea>

                <!-- Dropdown de menção -->
                <div v-if="mentionOpen && mentionResults.length > 0" class="mention-dropdown">
                  <div
                    v-for="(user, idx) in mentionResults"
                    :key="user.id"
                    class="mention-option"
                    :class="{ active: idx === mentionIndex }"
                    @mousedown.prevent="selectMention(user)"
                  >
                    <div class="mention-avatar">
                      <img v-if="user.foto" :src="user.foto" :alt="user.nome_usuario || ''" />
                      <div v-else class="avatar-placeholder small">{{ getInitials(user.nome_usuario) }}</div>
                    </div>
                    <div class="mention-info">
                      <span class="mention-name">{{ user.nome_usuario }}</span>
                      <span class="mention-cargo">{{ user.cargo }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Preview de arquivos selecionados -->
              <div v-if="pendingFiles.length > 0" class="pending-files">
                <div v-for="(pf, idx) in pendingFiles" :key="idx" class="pending-file">
                  <img v-if="pf.preview" :src="pf.preview" class="pending-thumb" :alt="pf.file.name" />
                  <span v-else class="pending-file-icon">{{ fileIcon(pf.file.type) }}</span>
                  <span class="pending-file-name">{{ pf.file.name }}</span>
                  <span class="pending-file-size">{{ formatBytes(pf.file.size) }}</span>
                  <button class="pending-remove" @click="removePendingFile(idx)" type="button" title="Remover">✕</button>
                </div>
              </div>

              <div class="comment-actions">
                <div class="comment-actions-left">
                  <button type="button" class="attach-btn" @click="fileInputRef?.click()" :disabled="savingComment" title="Anexar arquivo">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.41 17.41a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                    </svg>
                  </button>
                  <input
                    ref="fileInputRef"
                    type="file"
                    multiple
                    accept="image/*,.pdf,.xlsx,.xls,.csv,.doc,.docx,.zip,.rar"
                    class="file-input-hidden"
                    @change="onFilesSelected"
                  />
                  <span class="comment-hint">Ctrl + Enter para enviar</span>
                </div>
                <button
                  @click="submitComment"
                  :disabled="(!newCommentText.trim() && pendingFiles.length === 0) || savingComment"
                  class="submit-comment-btn"
                >
                  {{ savingComment ? 'Enviando...' : 'Comentar' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ── Lightbox de imagem ── -->
  <div v-if="lightboxAttachment" class="lightbox-overlay" @click="lightboxAttachment = null">
    <div class="lightbox-content" @click.stop>
      <div class="lightbox-header">
        <span class="lightbox-filename">{{ lightboxAttachment.nome }}</span>
        <div class="lightbox-actions">
          <button class="lightbox-btn" @click="downloadAttachment(lightboxAttachment)" title="Baixar">⬇️ Baixar</button>
          <button class="lightbox-btn close" @click="lightboxAttachment = null">✕</button>
        </div>
      </div>
      <img :src="lightboxAttachment.url" :alt="lightboxAttachment.nome" class="lightbox-img" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMetadata } from '@/composables/useMetadata'
import { usePermissions } from '@/composables/usePermissions'
import { useAuth } from '@/composables/useAuth'
import { tasksService } from '@/services/tasks'
import {
  uploadAttachments,
  downloadAttachment,
  isImage,
  fileIcon,
  formatBytes,
} from '@/services/attachments'
import type { Task, TaskWithContext, TaskComment, TaskCommentAttachment } from '@/types/flowcheck'
import type { User } from '@/types/user'

const props = defineProps<{
  isOpen: boolean
  task: Task | TaskWithContext | null
}>()

const emit = defineEmits<{
  close: []
  edit: []
  'comment-added': [task: Task]
}>()

const metadata = useMetadata()
const permissions = usePermissions()
const auth = useAuth()

const newCommentText = ref('')
const savingComment = ref(false)

// ── Anexos pendentes ──
interface PendingFile { file: File; preview: string | null }
const fileInputRef = ref<HTMLInputElement | null>(null)
const pendingFiles = ref<PendingFile[]>([])
const lightboxAttachment = ref<TaskCommentAttachment | null>(null)

function onFilesSelected(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files) return
  for (const file of Array.from(input.files)) {
    const preview = isImage(file.type) ? URL.createObjectURL(file) : null
    pendingFiles.value.push({ file, preview })
  }
  input.value = ''
}

function removePendingFile(idx: number) {
  const pf = pendingFiles.value[idx]
  if (pf.preview) URL.revokeObjectURL(pf.preview)
  pendingFiles.value.splice(idx, 1)
}

function onPaste(e: ClipboardEvent) {
  const files = Array.from(e.clipboardData?.files ?? [])
  if (files.length === 0) return
  // Só intercepta se tiver arquivo (imagem do clipboard) — texto cola normalmente
  e.preventDefault()
  for (const file of files) {
    const preview = isImage(file.type) ? URL.createObjectURL(file) : null
    pendingFiles.value.push({ file, preview })
  }
}

function openLightbox(att: TaskCommentAttachment) {
  lightboxAttachment.value = att
}

// ── Menção (@) ──
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const mentionOpen = ref(false)
const mentionQuery = ref('')
const mentionStart = ref(-1)
const mentionIndex = ref(0)

const mentionResults = computed((): User[] => {
  if (!mentionOpen.value || !mentionQuery.value) return []
  const q = mentionQuery.value.toLowerCase()
  return metadata.state.users
    .filter(u => u.nome_usuario?.toLowerCase().includes(q))
    .slice(0, 6)
})

function onTextareaInput() {
  const el = textareaRef.value
  if (!el) return
  const pos = el.selectionStart
  const text = el.value

  // Busca @palavra ou @palavra palavra (até fechar com ]) antes do cursor
  // Aceita letras, espaços e acentos enquanto não encontrar ] ou outro @
  const before = text.slice(0, pos)
  const match = before.match(/@([^\]@]*)$/)

  if (match) {
    mentionOpen.value = true
    // Remove o [ inicial se o usuário já digitou parte do token anterior
    mentionQuery.value = match[1].replace(/^\[/, '')
    mentionStart.value = before.lastIndexOf('@')
    mentionIndex.value = 0
  } else {
    mentionOpen.value = false
    mentionQuery.value = ''
    mentionStart.value = -1
  }
}

function onTextareaKeydown(e: KeyboardEvent) {
  if (!mentionOpen.value || mentionResults.value.length === 0) return

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    mentionIndex.value = (mentionIndex.value + 1) % mentionResults.value.length
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    mentionIndex.value = (mentionIndex.value - 1 + mentionResults.value.length) % mentionResults.value.length
  } else if (e.key === 'Enter' || e.key === 'Tab') {
    e.preventDefault()
    selectMention(mentionResults.value[mentionIndex.value])
  } else if (e.key === 'Escape') {
    mentionOpen.value = false
  }
}

function selectMention(user: User) {
  const name = user.nome_usuario
  if (!name || mentionStart.value < 0) return

  const el = textareaRef.value
  if (!el) return

  const text = newCommentText.value
  const before = text.slice(0, mentionStart.value)
  const after = text.slice(el.selectionStart)

  // Usa @[Nome Completo] como token — evita ambiguidade com emails e nomes compostos
  const token = `@[${name}]`
  newCommentText.value = `${before}${token} ${after}`
  mentionOpen.value = false
  mentionQuery.value = ''
  mentionStart.value = -1

  const newPos = before.length + token.length + 1
  setTimeout(() => {
    el.focus()
    el.setSelectionRange(newPos, newPos)
  })
}

function renderCommentText(texto: string): string {
  // Escapa HTML e destaca APENAS o padrão explícito @[Nome Completo]
  const escaped = texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return escaped.replace(/@\[([^\]]+)\]/g, '<span class="mention-tag">@$1</span>')
}

const currentUser = computed(() => auth.state.user)

const canEditThisTask = computed(() => {
  if (!props.task) return false
  return permissions.canEditTask.value(props.task)
})

const canCommentThisTask = computed(() => {
  if (!props.task) return false
  return permissions.canCommentTask.value(props.task)
})

onMounted(() => {
  if (metadata.state.users.length === 0) metadata.loadMetadata()
})

const responsaveis = computed(() => {
  if (!props.task?.responsavel) return []
  return metadata.getUsersByNames(props.task.responsavel)
})

const solicitantes = computed(() => {
  if (!props.task?.solicitante) return []
  return metadata.getUsersByNames(props.task.solicitante)
})

const criador = computed(() => {
  if (!props.task?.criado_por) return null
  return metadata.getUserById(props.task.criado_por) ?? null
})

const sortedComments = computed((): TaskComment[] => {
  const raw = props.task?.comentarios
  if (!raw || !Array.isArray(raw)) return []
  // Suporta tanto o formato novo (array de objetos) quanto o legado (array de strings)
  const parsed: TaskComment[] = raw
    .map((c: unknown) => {
      if (typeof c === 'string') {
        return {
          id: crypto.randomUUID(),
          texto: c,
          autor_nome: 'Usuário',
          autor_foto: null,
          criado_em: new Date(0).toISOString(),
        } as TaskComment
      }
      return c as TaskComment
    })
  return [...parsed].sort((a, b) => new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime())
})

const statusLabel = computed(() => {
  if (!props.task) return ''
  const ctx = props.task as TaskWithContext
  if (ctx.categoryName) {
    if (ctx.categoryName === 'Concluidos') return '✅ Concluído'
    if (ctx.categoryName === 'Em Andamento') return '⚡ Em Andamento'
    if (ctx.categoryName === 'Não Iniciado') return '🕐 Não Iniciado'
    return ctx.categoryName
  }
  return props.task.status_concluido ? '✅ Concluído' : '⏳ Pendente'
})

const statusClass = computed(() => {
  if (!props.task) return ''
  const ctx = props.task as TaskWithContext
  if (ctx.categoryName === 'Concluidos' || props.task.status_concluido) return 'completed'
  if (ctx.categoryName === 'Em Andamento') return 'in-progress'
  return 'not-started'
})

async function submitComment() {
  const texto = newCommentText.value.trim()
  if (!texto && pendingFiles.value.length === 0) return
  if (!props.task || savingComment.value) return

  const user = currentUser.value
  if (!user) return

  savingComment.value = true
  try {
    const commentId = crypto.randomUUID()

    // Upload dos anexos primeiro
    let anexos: TaskCommentAttachment[] = []
    if (pendingFiles.value.length > 0) {
      anexos = await uploadAttachments(
        props.task.id,
        commentId,
        pendingFiles.value.map(pf => pf.file)
      )
      // Libera object URLs
      pendingFiles.value.forEach(pf => { if (pf.preview) URL.revokeObjectURL(pf.preview) })
      pendingFiles.value = []
    }

    const comment: TaskComment = {
      id: commentId,
      texto: texto || '',
      autor_nome: user.nome_usuario || 'Usuário',
      autor_foto: user.foto || null,
      criado_em: new Date().toISOString(),
      ...(anexos.length > 0 ? { anexos } : {}),
    }
    const existing = (props.task.comentarios as TaskComment[] | null) || []
    const updated = await tasksService.addComment(props.task.id, comment, existing)
    newCommentText.value = ''
    emit('comment-added', updated)
  } finally {
    savingComment.value = false
  }
}

const closeModal = () => emit('close')

const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'Não informado'
  try {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return 'Data inválida' }
}

const getInitials = (name: string | null | undefined): string => {
  if (!name) return 'U'
  return name.split(' ').map(w => w.charAt(0)).join('').toUpperCase().slice(0, 2)
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
  max-width: 600px;
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
}

.modal-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.25rem;
  flex: 1;
}

.header-actions { display: flex; gap: 0.5rem; }

.edit-button, .close-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.edit-button { color: #667eea; font-weight: 500; }
.edit-button:hover { background-color: rgba(102, 126, 234, 0.1); }
.close-button { font-size: 1.5rem; color: #666; }
.close-button:hover { background-color: #f8f9fa; }

.modal-body { padding: 1.5rem; }

.detail-section { margin-bottom: 1.5rem; }

.detail-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.detail-section label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.detail-section p { margin: 0; color: #555; line-height: 1.5; }

.description {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.user-list { display: flex; flex-direction: column; gap: 0.75rem; }

.user-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.user-avatar {
  width: 40px; height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.user-avatar img { width: 100%; height: 100%; object-fit: cover; }

.avatar-placeholder {
  width: 100%; height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
}

.user-info { display: flex; flex-direction: column; }
.user-name { font-weight: 500; color: #333; font-size: 0.9rem; }
.user-role { color: #666; font-size: 0.8rem; }

.creator-item {
  padding: 0.5rem 0.75rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.tag-list { display: flex; flex-wrap: wrap; gap: 0.5rem; }

.tag {
  background-color: #f0f0f0;
  color: #666;
  padding: 0.4rem 0.8rem;
  border-radius: 16px;
  font-size: 0.8rem;
}

.tag.tag-processo { background-color: #fff3e0; color: #ef6c00; }

.progress-container { display: flex; align-items: center; gap: 1rem; }

.progress-bar {
  flex: 1; height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s;
}

.progress-text { font-weight: 500; color: #333; min-width: 40px; }

.priority-badge, .status-badge, .type-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 16px;
  font-size: 0.85rem;
  font-weight: 500;
}

.priority-badge { background-color: #e8f5e8; color: #2e7d32; }
.priority-badge.high { background-color: #ffebee; color: #c62828; }
.status-badge { background-color: #f1f3f5; color: #6c757d; }
.status-badge.in-progress { background-color: #fff3cd; color: #b45309; }
.status-badge.completed { background-color: #e8f5e8; color: #2e7d32; }
.status-badge.not-started { background-color: #f1f3f5; color: #6c757d; }
.type-badge { background-color: #f3e5f5; color: #7b1fa2; margin-right: 0.5rem; }
.type-indicators { display: flex; flex-wrap: wrap; }

/* ── Comentários ── */
.comments-section {
  border-top: 1px solid #e9ecef;
  padding-top: 1.5rem;
  margin-top: 0.5rem;
}

.comments-section > label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.comments-list { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.25rem; }

.comment-item { display: flex; gap: 0.75rem; }

.comment-avatar {
  width: 34px; height: 34px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.comment-avatar img { width: 100%; height: 100%; object-fit: cover; }

.avatar-placeholder.small {
  width: 34px; height: 34px;
  font-size: 0.75rem;
  border-radius: 50%;
}

.comment-body { flex: 1; }

.comment-meta {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.comment-author { font-weight: 600; font-size: 0.85rem; color: #333; }
.comment-date { font-size: 0.75rem; color: #999; }

.comment-text {
  margin: 0;
  font-size: 0.9rem;
  color: #555;
  line-height: 1.5;
  background: #f8f9fa;
  padding: 0.6rem 0.75rem;
  border-radius: 0 8px 8px 8px;
}

.no-comments {
  font-size: 0.85rem;
  color: #aaa;
  text-align: center;
  padding: 1rem 0;
  margin-bottom: 1rem;
}

.new-comment { display: flex; gap: 0.75rem; align-items: flex-start; }

.new-comment-avatar {
  width: 34px; height: 34px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  margin-top: 4px;
}

.new-comment-avatar img { width: 100%; height: 100%; object-fit: cover; }

.new-comment-input { flex: 1; }

.new-comment-input textarea {
  width: 100%;
  padding: 0.65rem 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 0.9rem;
  resize: vertical;
  box-sizing: border-box;
  transition: border-color 0.2s;
  font-family: inherit;
}

.new-comment-input textarea:focus {
  outline: none;
  border-color: #667eea;
}

.comment-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
}

.comment-hint { font-size: 0.75rem; color: #aaa; }

.submit-comment-btn {
  padding: 0.45rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.submit-comment-btn:hover:not(:disabled) { opacity: 0.9; }
.submit-comment-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Menção ── */
.textarea-wrapper { position: relative; }

.mention-dropdown {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  z-index: 100;
  overflow: hidden;
}

.mention-option {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.75rem;
  cursor: pointer;
  transition: background 0.15s;
}

.mention-option:hover,
.mention-option.active {
  background: #f0f0ff;
}

.mention-avatar {
  width: 28px; height: 28px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.mention-avatar img { width: 100%; height: 100%; object-fit: cover; }

.mention-info { display: flex; flex-direction: column; line-height: 1.2; }
.mention-name { font-size: 0.85rem; font-weight: 600; color: #333; }
.mention-cargo { font-size: 0.75rem; color: #888; }

/* Menção dentro do texto do comentário */
:deep(.mention-tag) {
  color: #667eea;
  font-weight: 600;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 4px;
  padding: 0 3px;
}

/* ── Anexos no comentário exibido ── */
.comment-attachments { margin-top: 0.5rem; }

.attach-images {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.4rem;
}

.attach-thumb {
  width: 80px; height: 80px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid #e1e5e9;
  transition: border-color 0.2s, transform 0.15s;
  flex-shrink: 0;
}

.attach-thumb:hover { border-color: #667eea; transform: scale(1.04); }
.attach-thumb img { width: 100%; height: 100%; object-fit: cover; }

.attach-file {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.6rem;
  background: #f8f9fa;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 0.35rem;
  transition: background 0.15s;
  max-width: 100%;
}

.attach-file:hover { background: #eef0ff; border-color: #667eea; }
.attach-file-icon { font-size: 1.1rem; flex-shrink: 0; }
.attach-file-name { font-size: 0.82rem; color: #333; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.attach-file-size { font-size: 0.75rem; color: #aaa; flex-shrink: 0; }
.attach-download-icon { font-size: 0.9rem; flex-shrink: 0; }

/* ── Arquivos pendentes (pré-envio) ── */
.pending-files {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px dashed #c9d0da;
}

.pending-file {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pending-thumb {
  width: 36px; height: 36px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.pending-file-icon { font-size: 1.2rem; flex-shrink: 0; }
.pending-file-name { font-size: 0.82rem; color: #333; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pending-file-size { font-size: 0.75rem; color: #aaa; flex-shrink: 0; }

.pending-remove {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0 4px;
  flex-shrink: 0;
}

.pending-remove:hover { color: #dc3545; }

/* Ações com botão de anexo */
.comment-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
}

.comment-actions-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.attach-btn {
  background: none;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  padding: 0.35rem 0.5rem;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  transition: background 0.15s, color 0.15s;
}

.attach-btn:hover:not(:disabled) { background: #f0f0ff; border-color: #667eea; color: #667eea; }
.attach-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.file-input-hidden { display: none; }

/* ── Lightbox ── */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.lightbox-content {
  background: #1a1a1a;
  border-radius: 10px;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.lightbox-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #111;
  gap: 1rem;
}

.lightbox-filename {
  color: #ccc;
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.lightbox-actions { display: flex; gap: 0.5rem; flex-shrink: 0; }

.lightbox-btn {
  background: rgba(255,255,255,0.1);
  border: none;
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.15s;
}

.lightbox-btn:hover { background: rgba(255,255,255,0.2); }
.lightbox-btn.close { font-size: 1rem; }

.lightbox-img {
  max-width: 100%;
  max-height: calc(90vh - 56px);
  object-fit: contain;
  display: block;
}
</style>
