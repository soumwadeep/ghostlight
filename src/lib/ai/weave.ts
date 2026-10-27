import type { EngineKind, Ofrenda, Remembrance } from '../../types'
import { nowIso } from '../utils'
import { candleWeave } from './candle'
import { generateOllama } from './ollama'
import { parseWeave } from './parse'
import { buildWeaveMessages } from './prompts'
import { GEMMA_LABEL, generateGemma, isGemmaLoaded } from './webllm'

export interface WeaveOptions {
  ofrenda: Ofrenda
  engine: EngineKind
  ollamaModel?: string | null
  onChunk?: (text: string) => void
}

export async function weaveRemembrance({
  ofrenda,
  engine,
  ollamaModel,
  onChunk,
}: WeaveOptions): Promise<Remembrance> {
  if (engine === 'candle') return candleWeave(ofrenda)

  const started = performance.now()

  if (engine === 'gemma') {
    if (!isGemmaLoaded()) throw new Error('Gemma is not lit yet.')
    const raw = await generateGemma(buildWeaveMessages(ofrenda), {
      temperature: 0.55,
      maxTokens: 500,
      topP: 0.9,
      frequencyPenalty: 0.35,
      presencePenalty: 0.2,
      onChunk,
    })
    const parsed = parseWeave(raw)
    return {
      ...parsed,
      source: 'gemma',
      modelLabel: GEMMA_LABEL,
      createdAt: nowIso(),
      latencyMs: Math.round(performance.now() - started),
    }
  }

  if (!ollamaModel) throw new Error('No local Ollama model was chosen.')
  const raw = await generateOllama(ollamaModel, buildWeaveMessages(ofrenda), {
    temperature: 0.55,
    maxTokens: 500,
    onChunk,
  })
  const parsed = parseWeave(raw)
  return {
    ...parsed,
    source: 'ollama',
    modelLabel: `Ollama · ${ollamaModel}`,
    createdAt: nowIso(),
    latencyMs: Math.round(performance.now() - started),
  }
}
