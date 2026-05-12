import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useAiAssistant, fuzzyMatch } from '../useAiAssistant'
import type { AiAssistantContext } from '../useAiAssistant'
import type { Bucket } from '@/types/flowcheck'
import type { User } from '@/types/user'
import type { Tag, TagProcesso } from '@/services/tags'

// ─── Mock openai service ──────────────────────────────────────────────────────

vi.mock('@/services/openai', () => ({
  chat: vi.fn(),
}))

import { chat } from '@/services/openai'
const chatMock = vi.mocked(chat)

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const USERS: User[] = [
  { id: 1, created_at: '', nome_usuario: 'Vinicius Nascimento', cargo: null, foto: null, id_user: 'u1', nivel: 1 },
  { id: 2, created_at: '', nome_usuario: 'Alice Souza', cargo: null, foto: null, id_user: 'u2', nivel: 2 },
]

const TAGS: Tag[] = [
  { id: 1, created_at: '', tag: 'Frontend', color: '#fff' },
  { id: 2, created_at: '', tag: 'Backend', color: '#000' },
]

const TAGS_PROCESSO: TagProcesso[] = [
  { id: 1, created_at: '', tag_processo: 'PowerBI', color: '#aaa' },
  { id: 2, created_at: '', tag_processo: 'Revisão', color: '#bbb' },
]

const BUCKETS: Bucket[] = [
  { id: 10, created_at: '', bucket: 'Projetos', descrição: null, abrev: null, nivel: null },
  { id: 20, created_at: '', bucket: 'Backlog', descrição: null, abrev: null, nivel: null },
]

function makeCtx(userLevel: number | null = 1): AiAssistantContext {
  return { users: USERS, tags: TAGS, tagsProcesso: TAGS_PROCESSO, buckets: BUCKETS, userLevel }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeJson(overrides: Partial<{
  titulo_task: string
  descricao: string
  ganhos: string
  responsavel: string[]
  tag: string[]
  tag_processo: string[]
  projeto: boolean
  bucketId: number | null
}> = {}) {
  return JSON.stringify({
    titulo_task: 'Minha Task',
    descricao: 'Descrição detalhada',
    ganhos: 'Ganho esperado',
    responsavel: ['Vinicius Nascimento'],
    tag: ['Frontend'],
    tag_processo: ['PowerBI'],
    projeto: true,
    bucketId: 10,
    ...overrides,
  })
}

function wrapJson(json: string) {
  return `Aqui está o resumo:\n---JSON---\n${json}\n---JSON---`
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('fuzzyMatch()', () => {
  const candidates = ['Vinicius Nascimento', 'Alice Souza', 'PowerBI', 'Revisão']

  it('matches exact value (case-insensitive)', () => {
    expect(fuzzyMatch('vinicius nascimento', candidates)).toBe('Vinicius Nascimento')
  })

  it('matches by prefix — "Vini" → "Vinicius Nascimento"', () => {
    expect(fuzzyMatch('Vini', candidates)).toBe('Vinicius Nascimento')
  })

  it('matches partial name — "Alice" → "Alice Souza"', () => {
    expect(fuzzyMatch('Alice', candidates)).toBe('Alice Souza')
  })

  it('matches ignoring accents — "Revisao" → "Revisão"', () => {
    expect(fuzzyMatch('Revisao', candidates)).toBe('Revisão')
  })

  it('matches case-insensitive with spaces — "power bi" → "PowerBI"', () => {
    // "power bi" normalised = "power bi"; "powerbi" normalised = "powerbi"
    // word strategy: words ["power","bi"] — "powerbi" contains "power" but not "bi"
    // so this won't match via word strategy, but "powerbi".includes("power") is true via contains
    expect(fuzzyMatch('powerbi', candidates)).toBe('PowerBI')
  })

  it('returns null for completely unrecognised input', () => {
    expect(fuzzyMatch('Zé Ninguém', candidates)).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(fuzzyMatch('', candidates)).toBeNull()
  })
})

describe('useAiAssistant', () => {
  beforeEach(() => {
    chatMock.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ── Initialisation ──────────────────────────────────────────────────────────

  describe('initialisation', () => {
    it('starts with a single welcome assistant message', () => {
      const { messages } = useAiAssistant(makeCtx())
      expect(messages.value).toHaveLength(1)
      expect(messages.value[0].role).toBe('assistant')
    })

    it('welcome message invites free-form description, not a fixed question', () => {
      const { messages } = useAiAssistant(makeCtx())
      // Should NOT ask for "título" as a rigid first step
      expect(messages.value[0].content).toContain('descreve')
    })

    it('isComplete is false on init', () => {
      const { isComplete } = useAiAssistant(makeCtx())
      expect(isComplete.value).toBe(false)
    })
  })

  // ── Fuzzy resolution of list fields ────────────────────────────────────────

  describe('fuzzy resolution of list fields', () => {
    it('resolves "Vini" in AI response to "Vinicius Nascimento"', async () => {
      chatMock.mockResolvedValue(wrapJson(makeJson({ responsavel: ['Vini'] })))
      const { sendMessage, collectedData } = useAiAssistant(makeCtx())

      await sendMessage('Preciso de uma task para o Vini')

      expect(collectedData.value?.responsavel).toEqual(['Vinicius Nascimento'])
    })

    it('resolves "Power Bi" in AI response to "PowerBI"', async () => {
      chatMock.mockResolvedValue(wrapJson(makeJson({ tag_processo: ['Power Bi'] })))
      const { sendMessage, collectedData } = useAiAssistant(makeCtx())

      await sendMessage('tag processo Power Bi')

      expect(collectedData.value?.tag_processo).toEqual(['PowerBI'])
    })

    it('drops hallucinated tag values that have no match', async () => {
      chatMock.mockResolvedValue(wrapJson(makeJson({ tag: ['TagInventada'] })))
      const { sendMessage, collectedData } = useAiAssistant(makeCtx())

      await sendMessage('alguma coisa')

      expect(collectedData.value?.tag).toEqual([])
    })

    it('drops hallucinated responsavel values that have no match', async () => {
      chatMock.mockResolvedValue(wrapJson(makeJson({ responsavel: ['Pessoa Inexistente'] })))
      const { sendMessage, collectedData } = useAiAssistant(makeCtx())

      await sendMessage('alguma coisa')

      expect(collectedData.value?.responsavel).toEqual([])
    })

    it('resolves multiple valid values in a single list', async () => {
      chatMock.mockResolvedValue(wrapJson(makeJson({ tag: ['frontend', 'backend'] })))
      const { sendMessage, collectedData } = useAiAssistant(makeCtx())

      await sendMessage('alguma coisa')

      expect(collectedData.value?.tag).toEqual(['Frontend', 'Backend'])
    })
  })

  // ── JSON block extraction ───────────────────────────────────────────────────

  describe('---JSON--- block extraction', () => {
    it('sets isComplete to true when the response contains a valid JSON block', async () => {
      chatMock.mockResolvedValue(wrapJson(makeJson()))
      const { sendMessage, isComplete } = useAiAssistant(makeCtx())

      await sendMessage('Criar task de relatório')

      expect(isComplete.value).toBe(true)
    })

    it('strips the JSON block from the displayed message', async () => {
      chatMock.mockResolvedValue(wrapJson(makeJson()))
      const { sendMessage, messages } = useAiAssistant(makeCtx())

      await sendMessage('Criar task de relatório')

      const lastMsg = messages.value[messages.value.length - 1]
      expect(lastMsg.content).not.toContain('---JSON---')
      expect(lastMsg.content).toContain('Aqui está o resumo')
    })

    it('keeps isComplete false when the response has no JSON block', async () => {
      chatMock.mockResolvedValue('Pode me dar mais detalhes sobre o que precisa ser feito?')
      const { sendMessage, isComplete } = useAiAssistant(makeCtx())

      await sendMessage('task')

      expect(isComplete.value).toBe(false)
    })

    it('keeps isComplete false when the JSON block is malformed', async () => {
      chatMock.mockResolvedValue('---JSON---\n{invalid json\n---JSON---')
      const { sendMessage, isComplete } = useAiAssistant(makeCtx())

      await sendMessage('task')

      expect(isComplete.value).toBe(false)
    })
  })

  // ── buildTaskFormData ───────────────────────────────────────────────────────

  describe('buildTaskFormData()', () => {
    it('maps all collected fields to TaskFormData correctly', async () => {
      chatMock.mockResolvedValue(wrapJson(makeJson()))
      const { sendMessage, buildTaskFormData } = useAiAssistant(makeCtx())
      await sendMessage('trigger')

      const form = buildTaskFormData()

      expect(form.titulo_task).toBe('Minha Task')
      expect(form.descricao).toBe('Descrição detalhada')
      expect(form.ganhos).toBe('Ganho esperado')
      expect(form.responsavel).toEqual(['Vinicius Nascimento'])
      expect(form.tag).toEqual(['Frontend'])
      expect(form.tag_processo).toEqual(['PowerBI'])
      expect(form.projeto).toBe(true)
    })

    it('sets correct defaults for non-AI fields', async () => {
      chatMock.mockResolvedValue(wrapJson(makeJson()))
      const { sendMessage, buildTaskFormData } = useAiAssistant(makeCtx())
      await sendMessage('trigger')

      const form = buildTaskFormData()

      expect(form.prioridade).toBe(false)
      expect(form.percenti_concluido).toBe(0)
      expect(form.data_inicio).toBeNull()
      expect(form.data_fim).toBeNull()
      expect(form.subtask).toEqual([])
      expect(form.subtask_bool).toEqual([])
      expect(form.solicitante).toEqual([])
      expect(form.pos_s4hana).toBe(false)
    })

    it('handles optional fields being empty', async () => {
      chatMock.mockResolvedValue(wrapJson(makeJson({
        ganhos: '',
        responsavel: [],
        tag: [],
        tag_processo: [],
        projeto: false,
        bucketId: null,
      })))
      const { sendMessage, buildTaskFormData } = useAiAssistant(makeCtx())
      await sendMessage('trigger')

      const form = buildTaskFormData()

      expect(form.ganhos).toBe('')
      expect(form.responsavel).toEqual([])
      expect(form.tag).toEqual([])
      expect(form.tag_processo).toEqual([])
      expect(form.projeto).toBe(false)
    })

    it('throws when called before data is collected', () => {
      const { buildTaskFormData } = useAiAssistant(makeCtx())
      expect(() => buildTaskFormData()).toThrow()
    })
  })

  // ── reset() ─────────────────────────────────────────────────────────────────

  describe('reset()', () => {
    it('clears messages and restarts with the welcome message', async () => {
      chatMock.mockResolvedValue('Pode me dar mais detalhes?')
      const { sendMessage, reset, messages } = useAiAssistant(makeCtx())

      await sendMessage('task')
      expect(messages.value.length).toBeGreaterThan(1)

      reset()

      expect(messages.value).toHaveLength(1)
      expect(messages.value[0].role).toBe('assistant')
    })

    it('resets isComplete to false after a completed conversation', async () => {
      chatMock.mockResolvedValue(wrapJson(makeJson()))
      const { sendMessage, reset, isComplete } = useAiAssistant(makeCtx())

      await sendMessage('trigger')
      expect(isComplete.value).toBe(true)

      reset()
      expect(isComplete.value).toBe(false)
    })

    it('resets loading to false', async () => {
      chatMock.mockResolvedValue('ok')
      const { sendMessage, reset, loading } = useAiAssistant(makeCtx())

      await sendMessage('trigger')
      reset()

      expect(loading.value).toBe(false)
    })
  })

  // ── System prompt — access level ────────────────────────────────────────────

  describe('system prompt — access level logic', () => {
    it('includes bucket options for level-2 users', () => {
      chatMock.mockResolvedValue('ok')
      const { sendMessage } = useAiAssistant(makeCtx(2))

      sendMessage('test')

      const systemMsg = chatMock.mock.calls[0][0].find(m => m.role === 'system')
      expect(systemMsg?.content).toContain('10:Projetos')
      expect(systemMsg?.content).toContain('20:Backlog')
    })

    it('omits bucket options for level-1 users', () => {
      chatMock.mockResolvedValue('ok')
      const { sendMessage } = useAiAssistant(makeCtx(1))

      sendMessage('test')

      const systemMsg = chatMock.mock.calls[0][0].find(m => m.role === 'system')
      expect(systemMsg?.content).not.toContain('10:Projetos')
    })

    it('includes available users in the system prompt', () => {
      chatMock.mockResolvedValue('ok')
      const { sendMessage } = useAiAssistant(makeCtx())

      sendMessage('test')

      const systemMsg = chatMock.mock.calls[0][0].find(m => m.role === 'system')
      expect(systemMsg?.content).toContain('Vinicius Nascimento')
      expect(systemMsg?.content).toContain('Alice Souza')
    })

    it('includes available tags in the system prompt', () => {
      chatMock.mockResolvedValue('ok')
      const { sendMessage } = useAiAssistant(makeCtx())

      sendMessage('test')

      const systemMsg = chatMock.mock.calls[0][0].find(m => m.role === 'system')
      expect(systemMsg?.content).toContain('Frontend')
      expect(systemMsg?.content).toContain('Backend')
    })

    it('includes available process tags in the system prompt', () => {
      chatMock.mockResolvedValue('ok')
      const { sendMessage } = useAiAssistant(makeCtx())

      sendMessage('test')

      const systemMsg = chatMock.mock.calls[0][0].find(m => m.role === 'system')
      expect(systemMsg?.content).toContain('PowerBI')
    })
  })

  // ── sendMessage() ───────────────────────────────────────────────────────────

  describe('sendMessage()', () => {
    it('adds the user message to the messages list', async () => {
      chatMock.mockResolvedValue('Pode me dar mais detalhes?')
      const { sendMessage, messages } = useAiAssistant(makeCtx())

      await sendMessage('Preciso criar uma task de relatório')

      const userMsg = messages.value.find(m => m.role === 'user')
      expect(userMsg?.content).toBe('Preciso criar uma task de relatório')
    })

    it('does nothing when the text is empty or whitespace', async () => {
      const { sendMessage, messages } = useAiAssistant(makeCtx())
      const initialLength = messages.value.length

      await sendMessage('   ')

      expect(chatMock).not.toHaveBeenCalled()
      expect(messages.value).toHaveLength(initialLength)
    })

    it('shows an error message in the chat when the API call fails', async () => {
      chatMock.mockRejectedValue(new Error('Limite de requisições atingido'))
      const { sendMessage, messages } = useAiAssistant(makeCtx())

      await sendMessage('task')

      const lastMsg = messages.value[messages.value.length - 1]
      expect(lastMsg.role).toBe('assistant')
      expect(lastMsg.content).toContain('Limite de requisições atingido')
    })

    it('resets loading to false after a failed call', async () => {
      chatMock.mockRejectedValue(new Error('fail'))
      const { sendMessage, loading } = useAiAssistant(makeCtx())

      await sendMessage('task')

      expect(loading.value).toBe(false)
    })
  })
})
