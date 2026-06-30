import { ref, computed } from 'vue'
import { chat } from '@/services/openai'
import type { OpenAIMessage } from '@/services/openai'
import type { TaskFormData, Bucket } from '@/types/flowcheck'
import type { User } from '@/types/user'
import type { Tag, TagProcesso } from '@/services/tags'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string
  role: 'assistant' | 'user'
  content: string
  timestamp: Date
}

export interface CollectedData {
  titulo_task: string
  descricao: string
  ganhos: string
  responsavel: string[]
  tag: string[]
  tag_processo: string[]
  projeto: boolean
  bucketId: number | null
}

export interface AiAssistantContext {
  users: User[]
  tags: Tag[]
  tagsProcesso: TagProcesso[]
  buckets: Bucket[]
  userLevel: number | null
}

// ─── Fuzzy matching ───────────────────────────────────────────────────────────

/**
 * Normalise a string for comparison: lowercase, remove accents, collapse spaces.
 */
function normalise(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Find the best match for `input` in `candidates`.
 * Returns the original candidate string if a match is found, otherwise null.
 *
 * Strategy (in order of priority):
 *  1. Exact match (after normalisation)
 *  2. Candidate starts with input
 *  3. Input is fully contained in candidate
 *  4. Every word in input appears somewhere in candidate
 */
export function fuzzyMatch(input: string, candidates: string[]): string | null {
  const norm = normalise(input)
  if (!norm) return null

  // 1. Exact
  const exact = candidates.find(c => normalise(c) === norm)
  if (exact) return exact

  // 2. Candidate starts with input
  const startsWith = candidates.find(c => normalise(c).startsWith(norm))
  if (startsWith) return startsWith

  // 3. Input contained in candidate
  const contains = candidates.find(c => normalise(c).includes(norm))
  if (contains) return contains

  // 4. All words of input appear in candidate
  const words = norm.split(' ').filter(Boolean)
  const allWords = candidates.find(c => {
    const cn = normalise(c)
    return words.every(w => cn.includes(w))
  })
  if (allWords) return allWords

  return null
}

/**
 * Resolve an array of raw strings (from the AI) against a list of valid options.
 * Unrecognised values are silently dropped.
 */
function resolveList(raw: string[], candidates: string[]): string[] {
  const resolved: string[] = []
  for (const item of raw) {
    const match = fuzzyMatch(item, candidates)
    if (match) resolved.push(match)
  }
  return resolved
}

// ─── System prompt ────────────────────────────────────────────────────────────

function buildSystemPrompt(ctx: AiAssistantContext): string {
  const userNames = ctx.users.map(u => u.nome_usuario).filter(Boolean).join(', ') || 'nenhum'
  const tagNames = ctx.tags.map(t => t.tag).filter(Boolean).join(', ') || 'nenhuma'
  const tagProcessoNames = ctx.tagsProcesso.map(t => t.tag_processo).filter(Boolean).join(', ') || 'nenhuma'
  // Levels 2, 3 and 4 can select a bucket; restricted levels use their own bucket
  const canSelectBucket = (ctx.userLevel ?? 0) >= 2 && ![5, 6, 7, 8].includes(ctx.userLevel ?? 0)
  const bucketOptions = canSelectBucket
    ? ctx.buckets.map(b => `${b.id}:${b.bucket}`).filter(Boolean).join(', ')
    : ''

  const bucketInstructions = canSelectBucket
    ? `- bucketId: ID numérico do bucket escolhido. Opções disponíveis: ${bucketOptions}. Se o usuário não mencionar, pergunte.`
    : `- bucketId: sempre null (o bucket é definido automaticamente para este usuário).`

  return `Você é um assistente inteligente de criação de tasks do sistema FlowCheck.

Seu objetivo é entender a solicitação do usuário em linguagem natural e preencher os campos de uma task. Você NÃO faz perguntas em sequência fixa — você analisa o que o usuário disse, extrai o máximo de informações possível, e só pergunta sobre o que está faltando ou ambíguo.

## Campos da task

- titulo_task (obrigatório): título curto e objetivo.
- descricao (obrigatório): descrição detalhada do que precisa ser feito.
- ganhos (opcional): benefícios ou resultados esperados. Se não mencionado, deixe vazio.
- responsavel (opcional): lista de responsáveis. Use APENAS nomes da lista: ${userNames}. Se o usuário mencionar um nome parcial ou apelido, identifique o mais próximo da lista. Se não houver correspondência clara, pergunte.
- tag (opcional): lista de tags. Use APENAS valores da lista: ${tagNames}. Nunca invente tags que não existam na lista.
- tag_processo (opcional): lista de tags de processo. Use APENAS valores da lista: ${tagProcessoNames}. Nunca invente tags que não existam na lista.
- projeto (obrigatório): true se for um projeto, false se for uma task simples. Se não mencionado, assuma false e informe o usuário.
${bucketInstructions}

## Comportamento esperado

1. Leia a mensagem do usuário e extraia tudo que conseguir.
2. Se título e descrição já estiverem claros, não pergunte sobre eles novamente.
3. Agrupe as perguntas pendentes em UMA única mensagem, não uma por vez.
4. Quando tiver todos os dados necessários (título + descrição no mínimo), exiba um resumo e inclua o bloco JSON.
5. Se o usuário mencionar algo que não existe nas listas (tag, responsável), informe quais opções estão disponíveis e peça para escolher — NUNCA adicione valores inventados ao JSON.

## Formato de resposta final

Quando todos os dados estiverem coletados, exiba um resumo amigável e inclua EXATAMENTE este bloco ao final:

---JSON---
{"titulo_task":"","descricao":"","ganhos":"","responsavel":[],"tag":[],"tag_processo":[],"projeto":false,"bucketId":null}
---JSON---

Regras do JSON:
- Preencha apenas com valores das listas fornecidas (responsavel, tag, tag_processo).
- Não inclua o bloco JSON antes de ter título e descrição confirmados.
- Responda SEMPRE em português.`
}

// ─── JSON extraction ──────────────────────────────────────────────────────────

const JSON_BLOCK_REGEX = /---JSON---\s*([\s\S]*?)\s*---JSON---/

function extractJsonBlock(text: string): CollectedData | null {
  const match = JSON_BLOCK_REGEX.exec(text)
  if (!match) return null
  try {
    return JSON.parse(match[1]) as CollectedData
  } catch {
    return null
  }
}

function stripJsonBlock(text: string): string {
  return text.replace(/---JSON---[\s\S]*?---JSON---/g, '').trim()
}

/**
 * After extracting the raw JSON from the AI, resolve all list fields
 * against the actual available options using fuzzy matching.
 * This prevents hallucinated values from reaching the form.
 */
function resolveCollectedData(raw: CollectedData, ctx: AiAssistantContext): CollectedData {
  const userNames = ctx.users.map(u => u.nome_usuario).filter((n): n is string => Boolean(n))
  const tagNames = ctx.tags.map(t => t.tag).filter((n): n is string => Boolean(n))
  const tagProcessoNames = ctx.tagsProcesso.map(t => t.tag_processo).filter((n): n is string => Boolean(n))

  return {
    ...raw,
    responsavel: resolveList(raw.responsavel ?? [], userNames),
    tag: resolveList(raw.tag ?? [], tagNames),
    tag_processo: resolveList(raw.tag_processo ?? [], tagProcessoNames),
  }
}

// ─── Misc helpers ─────────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// ─── Composable ──────────────────────────────────────────────────────────────

export function useAiAssistant(ctx: AiAssistantContext) {
  const messages = ref<ChatMessage[]>([])
  const openaiHistory = ref<OpenAIMessage[]>([])
  const collectedData = ref<CollectedData | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isComplete = computed(() => collectedData.value !== null)

  function addAssistantMessage(content: string) {
    messages.value.push({
      id: generateId(),
      role: 'assistant',
      content,
      timestamp: new Date(),
    })
  }

  function init() {
    const systemPrompt = buildSystemPrompt(ctx)
    openaiHistory.value = [{ role: 'system', content: systemPrompt }]

    const welcome =
      'Olá! Me conta o que você precisa fazer e eu já preencho os campos da task pra você. Pode descrever livremente — quanto mais detalhes, melhor!'
    openaiHistory.value.push({ role: 'assistant', content: welcome })
    addAssistantMessage(welcome)
  }

  function reset() {
    messages.value = []
    openaiHistory.value = []
    collectedData.value = null
    loading.value = false
    error.value = null
    init()
  }

  async function sendMessage(text: string) {
    if (!text.trim() || loading.value) return

    messages.value.push({
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    })
    openaiHistory.value.push({ role: 'user', content: text })

    loading.value = true
    error.value = null

    try {
      const rawResponse = await chat(openaiHistory.value)

      const extracted = extractJsonBlock(rawResponse)
      if (extracted) {
        // Resolve list fields against real options before storing
        collectedData.value = resolveCollectedData(extracted, ctx)
      }

      const displayContent = stripJsonBlock(rawResponse)
      openaiHistory.value.push({ role: 'assistant', content: rawResponse })
      addAssistantMessage(displayContent || 'Dados coletados com sucesso!')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao contatar o assistente. Tente novamente.'
      error.value = msg
      addAssistantMessage(`⚠️ ${msg}`)
    } finally {
      loading.value = false
    }
  }

  function buildTaskFormData(): TaskFormData {
    const d = collectedData.value
    if (!d) throw new Error('Dados ainda não foram coletados pelo assistente.')

    return {
      titulo_task: d.titulo_task ?? '',
      descricao: d.descricao ?? '',
      ganhos: d.ganhos ?? '',
      responsavel: d.responsavel ?? [],
      tag: d.tag ?? [],
      tag_processo: d.tag_processo ?? [],
      projeto: d.projeto ?? false,
      prioridade: false,
      percenti_concluido: 0,
      data_inicio: null,
      data_fim: null,
      data_inicio_plan: null,
      data_fim_plan: null,
      subtask: [],
      subtask_bool: [],
      solicitante: [],
      pos_s4hana: false,
      id_obs_processo: null,
    }
  }

  init()

  return {
    messages,
    loading,
    error,
    isComplete,
    collectedData,
    sendMessage,
    reset,
    buildTaskFormData,
  }
}
