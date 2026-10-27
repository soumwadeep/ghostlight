import { CHAPTERS } from '../../data/chapters'
import type { Entry, Ofrenda, Remembrance } from '../../types'
import { countWords, nowIso } from '../utils'

const SMALL_WORDS = new Set([
  'a',
  'an',
  'and',
  'as',
  'at',
  'but',
  'by',
  'for',
  'from',
  'in',
  'of',
  'on',
  'or',
  'the',
  'to',
  'with',
])

const KIND_PHRASE: Record<string, string> = {
  food: 'a taste',
  song: 'a song',
  place: 'a place',
  saying: 'a saying',
  object: 'an object',
  moment: 'a question',
}

function titleCase(value: string): string {
  const words = value
    .replace(/["“”']/g, '')
    .replace(/[.!?]+$/, '')
    .trim()
    .split(/\s+/)
    .slice(0, 6)
  return words
    .map((word, index) =>
      index > 0 && SMALL_WORDS.has(word.toLowerCase())
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join(' ')
}

function prose(value: string): string {
  const text = value.replace(/\s+/g, ' ').trim()
  if (!text) return ''
  const sentence = text.charAt(0).toUpperCase() + text.slice(1)
  return /[.!?…]$/.test(sentence) ? sentence : `${sentence}.`
}

const CONNECTORS = new Set([
  'a',
  'an',
  'the',
  'with',
  'of',
  'and',
  'for',
  'to',
  'in',
  'on',
  'at',
  'from',
  'by',
])

function pickTitle(entries: Entry[]): string {
  const object = entries.find((entry) => entry.id === 'small' && entry.artifact)?.artifact?.label
  if (object) {
    const words: string[] = []
    for (const word of object.replace(/["“”'.!?]/g, '').trim().split(/\s+/)) {
      const lower = word.toLowerCase()
      if (words.length === 0 && CONNECTORS.has(lower)) continue
      if (words.length > 0 && CONNECTORS.has(lower)) break
      words.push(word)
      if (words.length === 3) break
    }
    if (words.length > 0) {
      const titled = titleCase(words.join(' '))
      return /^(the|a|an)\b/i.test(titled) ? titled : `The ${titled}`
    }
  }
  const hasKitchen = entries.some((entry) => entry.id === 'kitchen')
  return hasKitchen ? 'The Kitchen Light' : 'The Light We Keep'
}

function joinKinds(kinds: string[]): string {
  if (kinds.length === 0) return ''
  if (kinds.length === 1) return kinds[0] ?? ''
  if (kinds.length === 2) return `${kinds[0]} and ${kinds[1]}`
  return `${kinds.slice(0, -1).join(', ')} and ${kinds[kinds.length - 1]}`
}

function pickEpitaph(entries: Entry[]): string {
  const saying = entries.find((entry) => entry.id === 'saying' && entry.artifact)
  if (saying?.artifact) {
    return `“${saying.artifact.label.replace(/["“”']/g, '')}”`
  }
  return 'This is what we have. It is enough.'
}

export function candleWeave(ofrenda: Ofrenda): Remembrance {
  const answered = ofrenda.entries.filter(
    (entry) => !entry.skipped && entry.answer.trim().length > 0,
  )
  const byId = new Map(answered.map((entry) => [entry.id, entry]))
  const name = ofrenda.person.name

  const kinds = CHAPTERS.flatMap((chapter) => {
    const entry = byId.get(chapter.id)
    if (!entry?.artifact) return []
    return [KIND_PHRASE[entry.artifact.kind] ?? 'a small thing']
  })

  const arrangementLine =
    kinds.length > 0
      ? `${name} is kept in ${joinKinds(kinds)}. Not in order, and not all at once.`
      : `${name} is kept in the things that were written here.`

  const paragraphs = [arrangementLine]

  for (const chapter of CHAPTERS) {
    const entry = byId.get(chapter.id)
    if (!entry) continue
    const text = prose(entry.answer)
    if (text) paragraphs.push(text)
  }

  paragraphs.push('This is what we have. It is enough to keep the light on.')

  return {
    title: pickTitle(answered),
    epitaph: pickEpitaph(answered),
    body: paragraphs.join('\n\n').slice(0, 9000),
    source: 'candle',
    modelLabel: 'Your own words, arranged',
    createdAt: nowIso(),
    latencyMs: 0,
  }
}

export function hasEnoughToWeave(ofrenda: Ofrenda): boolean {
  return ofrenda.entries.some(
    (entry) => !entry.skipped && countWords(entry.answer) >= 4,
  )
}
