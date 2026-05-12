export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

const ERROR_MESSAGES: Record<number, string> = {
  401: 'Chave da API OpenAI inválida ou não configurada. Verifique VITE_OPENAI_API_KEY.',
  429: 'Limite de requisições da API OpenAI atingido. Tente novamente em alguns instantes.',
  500: 'Erro interno na API da OpenAI. Tente novamente mais tarde.',
}

export async function chat(messages: OpenAIMessage[]): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('Chave da API OpenAI não configurada. Adicione VITE_OPENAI_API_KEY ao arquivo .env.')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      messages,
    }),
  })

  if (!response.ok) {
    const message = ERROR_MESSAGES[response.status]
      ?? `Erro na API da OpenAI: ${response.status} ${response.statusText}`
    throw new Error(message)
  }

  const data: OpenAIResponse = await response.json()
  return data.choices[0].message.content
}
