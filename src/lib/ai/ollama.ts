import type { ChatMessage } from './prompts'

const configuredBase = import.meta.env.VITE_OLLAMA_URL as string | undefined
const BASE = (configuredBase || 'http://127.0.0.1:11434').replace(/\/$/, '')

export interface OllamaInfo {
  ok: boolean
  models: string[]
  preferred: string | null
}

interface OllamaTagsResponse {
  models?: Array<{ name?: string; model?: string }>
}

export async function detectOllama(): Promise<OllamaInfo> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), 2500)
  try {
    const response = await fetch(`${BASE}/api/tags`, { signal: controller.signal })
    if (!response.ok) return { ok: false, models: [], preferred: null }
    const data = (await response.json()) as OllamaTagsResponse
    const models = (data.models ?? [])
      .map((item) => item.name || item.model || '')
      .filter((name): name is string => Boolean(name))
    const preferred =
      models.find((name) => /gemma/i.test(name)) ??
      models.find((name) => /llama|mistral|qwen/i.test(name)) ??
      models[0] ??
      null
    return { ok: true, models, preferred }
  } catch {
    return { ok: false, models: [], preferred: null }
  } finally {
    window.clearTimeout(timer)
  }
}

export interface OllamaGenerateOptions {
  temperature?: number
  maxTokens?: number
  onChunk?: (text: string) => void
}

interface OllamaChunk {
  message?: { content?: string }
  error?: string
  done?: boolean
}

export async function generateOllama(
  model: string,
  messages: ChatMessage[],
  options: OllamaGenerateOptions = {},
): Promise<string> {
  const response = await fetch(`${BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      options: {
        temperature: options.temperature ?? 0.78,
        num_predict: options.maxTokens ?? 460,
      },
    }),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(
      detail
        ? `Ollama refused the request: ${detail.slice(0, 160)}`
        : 'Ollama refused the request. Is the model pulled?',
    )
  }
  if (!response.body) throw new Error('Ollama returned no stream.')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let text = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue
      let chunk: OllamaChunk
      try {
        chunk = JSON.parse(trimmed) as OllamaChunk
      } catch {
        continue
      }
      if (chunk.error) throw new Error(chunk.error)
      const delta = chunk.message?.content
      if (delta) {
        text += delta
        options.onChunk?.(text)
      }
    }
  }

  const tail = buffer.trim()
  if (tail) {
    try {
      const chunk = JSON.parse(tail) as OllamaChunk
      if (chunk.message?.content) {
        text += chunk.message.content
        options.onChunk?.(text)
      }
    } catch {
      // Ignore a partial final line.
    }
  }

  if (!text.trim()) throw new Error('Ollama returned an empty page.')
  return text
}
