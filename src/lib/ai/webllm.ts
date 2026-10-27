import type { ChatCompletionMessageParam, MLCEngine } from '@mlc-ai/web-llm'
import type { ChatMessage } from './prompts'

export const GEMMA_MODEL_ID = 'gemma-2-2b-it-q4f16_1-MLC'
export const GEMMA_LABEL = 'Gemma 2 · 2B'
export const GEMMA_SIZE_LABEL = '1.4 GB'

type ProgressListener = (progress: number, message: string) => void

let engine: MLCEngine | null = null
let loading: Promise<MLCEngine> | null = null
let progressListener: ProgressListener | null = null

export function setGemmaProgressListener(listener: ProgressListener | null): void {
  progressListener = listener
}

export function isGemmaLoaded(): boolean {
  return engine !== null
}

export async function ensureGemma(): Promise<MLCEngine> {
  if (engine) return engine
  if (!loading) {
    loading = (async () => {
      const webllm = await import('@mlc-ai/web-llm')
      const created = await webllm.CreateMLCEngine(GEMMA_MODEL_ID, {
        initProgressCallback: (report) => {
          progressListener?.(report.progress ?? 0, report.text ?? '')
        },
      })
      engine = created
      return created
    })()
  }
  try {
    return await loading
  } finally {
    loading = null
  }
}

export interface GenerateOptions {
  temperature?: number
  maxTokens?: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
  onChunk?: (text: string) => void
}

export async function generateGemma(
  messages: ChatMessage[],
  options: GenerateOptions = {},
): Promise<string> {
  if (!engine) throw new Error('Gemma is not lit yet.')
  const stream = await engine.chat.completions.create({
    messages: messages as ChatCompletionMessageParam[],
    temperature: options.temperature ?? 0.78,
    max_tokens: options.maxTokens ?? 460,
    top_p: options.topP ?? 1,
    frequency_penalty: options.frequencyPenalty ?? 0,
    presence_penalty: options.presencePenalty ?? 0,
    stream: true,
  })

  let text = ''
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content
    if (typeof delta === 'string' && delta.length > 0) {
      text += delta
      options.onChunk?.(text)
    }
  }
  return text
}
