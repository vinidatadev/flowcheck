<template>
  <div class="ai-chat">
    <!-- Header -->
    <div class="chat-header">
      <div class="chat-header-title">
        <div class="ai-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
            <circle cx="9" cy="14" r="1" fill="currentColor"/>
            <circle cx="15" cy="14" r="1" fill="currentColor"/>
          </svg>
        </div>
        <span>Assistente IA</span>
      </div>
      <button class="restart-btn" @click="$emit('reset')" title="Recomeçar conversa">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="1 4 1 10 7 10"/>
          <path d="M3.51 15a9 9 0 1 0 .49-3.5"/>
        </svg>
        Recomeçar
      </button>
    </div>

    <!-- Messages area -->
    <div class="messages-area" ref="messagesContainer">
      <div
        v-for="msg in messages"
        :key="msg.id"
        :class="['message-row', msg.role === 'user' ? 'user-row' : 'assistant-row']"
      >
        <div :class="['message-bubble', msg.role === 'user' ? 'user-bubble' : 'assistant-bubble']">
          <span class="message-text" v-html="formatMessage(msg.content)"></span>
        </div>
      </div>

      <!-- Typing indicator -->
      <div v-if="loading" class="message-row assistant-row">
        <div class="message-bubble assistant-bubble typing-bubble">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>
    </div>

    <!-- Review button -->
    <div v-if="isComplete" class="review-banner">
      <button class="review-btn" @click="$emit('open-form')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        Revisar e Criar Task
      </button>
    </div>

    <!-- Input footer -->
    <div class="chat-footer">
      <div class="input-row">
        <textarea
          ref="inputRef"
          v-model="inputText"
          class="chat-input"
          placeholder="Digite sua resposta..."
          :disabled="loading"
          rows="1"
          @keydown.enter.exact.prevent="handleSend"
          @input="autoResize"
        ></textarea>
        <button
          class="send-btn"
          :disabled="loading || !inputText.trim()"
          @click="handleSend"
          title="Enviar"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
      <p class="input-hint">Enter para enviar · Shift+Enter para nova linha</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { ChatMessage } from '@/composables/useAiAssistant'

const props = defineProps<{
  messages: ChatMessage[]
  loading: boolean
  isComplete: boolean
}>()

const emit = defineEmits<{
  'send': [text: string]
  'reset': []
  'open-form': []
}>()

const inputText = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLTextAreaElement | null>(null)

// Auto-scroll to bottom on new messages or loading state change
watch(
  () => [props.messages.length, props.loading],
  async () => {
    await nextTick()
    scrollToBottom()
  }
)

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function handleSend() {
  const text = inputText.value.trim()
  if (!text || props.loading) return
  emit('send', text)
  inputText.value = ''
  // Reset textarea height
  if (inputRef.value) {
    inputRef.value.style.height = 'auto'
  }
}

function autoResize(e: Event) {
  const el = e.target as HTMLTextAreaElement
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 120) + 'px'
}

// Convert **bold** markdown and newlines to HTML
function formatMessage(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}
</script>

<style scoped>
.ai-chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1a1d29;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* ── Header ── */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #232937;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.chat-header-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #e2e8f0;
  font-weight: 600;
  font-size: 0.95rem;
}

.ai-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
  flex-shrink: 0;
}

.restart-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #94a3b8;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.restart-btn:hover {
  border-color: rgba(255, 255, 255, 0.2);
  color: #e2e8f0;
  background: rgba(255, 255, 255, 0.04);
}

/* ── Messages ── */
.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.messages-area::-webkit-scrollbar {
  width: 4px;
}

.messages-area::-webkit-scrollbar-track {
  background: transparent;
}

.messages-area::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.message-row {
  display: flex;
}

.assistant-row {
  justify-content: flex-start;
}

.user-row {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 75%;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 0.875rem;
  line-height: 1.55;
  word-break: break-word;
}

.assistant-bubble {
  background: #2d3348;
  color: #e2e8f0;
  border-bottom-left-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.user-bubble {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  border-bottom-right-radius: 4px;
}

/* Typing indicator */
.typing-bubble {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 12px 16px;
}

.dot {
  width: 7px;
  height: 7px;
  background: #94a3b8;
  border-radius: 50%;
  animation: bounce 1.2s infinite ease-in-out;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
  30% { transform: translateY(-6px); opacity: 1; }
}

/* ── Review banner ── */
.review-banner {
  padding: 12px 16px;
  background: rgba(102, 126, 234, 0.08);
  border-top: 1px solid rgba(102, 126, 234, 0.2);
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

.review-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.1s ease;
}

.review-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.review-btn:active {
  transform: translateY(0);
}

/* ── Footer / Input ── */
.chat-footer {
  padding: 12px 16px 10px;
  background: #232937;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.input-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.chat-input {
  flex: 1;
  background: #1a1d29;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #e2e8f0;
  font-size: 0.875rem;
  padding: 10px 14px;
  resize: none;
  line-height: 1.5;
  min-height: 42px;
  max-height: 120px;
  transition: border-color 0.2s ease;
  font-family: inherit;
}

.chat-input::placeholder {
  color: #4a5568;
}

.chat-input:focus {
  outline: none;
  border-color: rgba(102, 126, 234, 0.5);
}

.chat-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  flex-shrink: 0;
  transition: opacity 0.2s ease, transform 0.1s ease;
}

.send-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

.input-hint {
  margin: 6px 0 0;
  font-size: 0.72rem;
  color: #4a5568;
  text-align: right;
}
</style>
