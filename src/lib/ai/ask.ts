import type { AskAnswer, EngineKind, Ofrenda } from '../../types'
import { countWords } from '../utils'
import { generateOllama } from './ollama'
import { buildGroundedAnswerMessages } from './prompts'
import { excerpt, NO_MEMORY, retrieveFromArchive } from './retrieval'
import { generateGemma, isGemmaLoaded } from './webllm'

interface AskOptions {
  engine: EngineKind
  ollamaModel?: string | null
}

function parseAnswer(raw: string): string | null {
  const match = raw.match(/^\s*[*#]*ANSWER[*#]*\s*:\s*([\s\S]*)$/im)
  let value = (match?.[1] ?? raw).trim()
  value = value
    .replace(/^\*+|\*+$/g, '')
    .replace(/^["“'‘]+|["”'’]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!value || /^none\b/i.test(value)) return null
  if (countWords(value) > 90) return null
  return value
}

function refusal(): AskAnswer {
  return {
    answer: NO_MEMORY,
    citations: [],
    grounded: false,
    basis: 'none',
    source: 'search',
  }
}

export async function askOfrenda(
  question: string,
  ofrenda: Ofrenda,
  options: AskOptions,
): Promise<AskAnswer> {
  const query = question.replace(/\s+/g, ' ').trim()
  if (!query) return refusal()

  const retrieval = retrieveFromArchive(query, ofrenda)
  if (retrieval.kind === 'none') return refusal()
  if (retrieval.kind === 'profile') {
    return {
      answer: retrieval.answer,
      citations: [],
      grounded: true,
      basis: 'name-card',
      source: 'search',
    }
  }

  const { chapter, entry } = retrieval
  const memoryText = excerpt(entry.answer)
  const citations = [chapter.id]

  if (options.engine === 'gemma' && isGemmaLoaded()) {
    const started = performance.now()
    try {
      const raw = await generateGemma(
        buildGroundedAnswerMessages(ofrenda, query, chapter.label, memoryText),
        { temperature: 0.2, maxTokens: 140 },
      )
      const answer = parseAnswer(raw)
      if (answer) {
        return {
          answer,
          citations,
          grounded: true,
          basis: 'memories',
          source: 'gemma',
          latencyMs: Math.round(performance.now() - started),
        }
      }
    } catch {
      // The archive is always allowed to answer on its own.
    }
  }

  if (options.engine === 'ollama' && options.ollamaModel) {
    const started = performance.now()
    try {
      const raw = await generateOllama(
        options.ollamaModel,
        buildGroundedAnswerMessages(ofrenda, query, chapter.label, memoryText),
        { temperature: 0.2, maxTokens: 140 },
      )
      const answer = parseAnswer(raw)
      if (answer) {
        return {
          answer,
          citations,
          grounded: true,
          basis: 'memories',
          source: 'ollama',
          latencyMs: Math.round(performance.now() - started),
        }
      }
    } catch {
      // Fall through to the memory itself.
    }
  }

  return {
    answer: memoryText,
    citations,
    grounded: true,
    basis: 'memories',
    source: 'search',
  }
}
