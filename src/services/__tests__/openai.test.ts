import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { chat } from '../openai'
import type { OpenAIMessage } from '../openai'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mockFetchOk(content: string) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      choices: [{ message: { content } }],
    }),
  })
}

function mockFetchError(status: number, statusText = 'Error') {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    statusText,
  })
}

const MESSAGES: OpenAIMessage[] = [
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'Hello' },
]

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('openai.ts — chat()', () => {
  beforeEach(() => {
    // Provide a default API key via import.meta.env
    vi.stubEnv('VITE_OPENAI_API_KEY', 'sk-test-key')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('sends a POST to the correct endpoint with the right payload', async () => {
    const fetchMock = mockFetchOk('Olá!')
    vi.stubGlobal('fetch', fetchMock)

    await chat(MESSAGES)

    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit]

    expect(url).toBe('https://api.openai.com/v1/chat/completions')
    expect(options.method).toBe('POST')

    const body = JSON.parse(options.body as string)
    expect(body.model).toBe('gpt-4o-mini')
    expect(body.temperature).toBe(0.4)
    expect(body.messages).toEqual(MESSAGES)
  })

  it('includes the Authorization header with the API key', async () => {
    const fetchMock = mockFetchOk('ok')
    vi.stubGlobal('fetch', fetchMock)

    await chat(MESSAGES)

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    const headers = options.headers as Record<string, string>
    expect(headers['Authorization']).toBe('Bearer sk-test-key')
    expect(headers['Content-Type']).toBe('application/json')
  })

  it('returns the assistant message content on success', async () => {
    vi.stubGlobal('fetch', mockFetchOk('Resposta do assistente'))

    const result = await chat(MESSAGES)
    expect(result).toBe('Resposta do assistente')
  })

  it('throws a descriptive error when VITE_OPENAI_API_KEY is missing', async () => {
    vi.stubEnv('VITE_OPENAI_API_KEY', '')
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await expect(chat(MESSAGES)).rejects.toThrow('VITE_OPENAI_API_KEY')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('throws the 401 error message for an unauthorized response', async () => {
    vi.stubGlobal('fetch', mockFetchError(401))

    await expect(chat(MESSAGES)).rejects.toThrow(
      'Chave da API OpenAI inválida ou não configurada'
    )
  })

  it('throws the 429 error message for a rate-limit response', async () => {
    vi.stubGlobal('fetch', mockFetchError(429))

    await expect(chat(MESSAGES)).rejects.toThrow(
      'Limite de requisições da API OpenAI atingido'
    )
  })

  it('throws the 500 error message for an internal server error', async () => {
    vi.stubGlobal('fetch', mockFetchError(500))

    await expect(chat(MESSAGES)).rejects.toThrow(
      'Erro interno na API da OpenAI'
    )
  })

  it('throws a generic error message for unknown HTTP status codes', async () => {
    vi.stubGlobal('fetch', mockFetchError(503, 'Service Unavailable'))

    await expect(chat(MESSAGES)).rejects.toThrow('503')
  })
})
