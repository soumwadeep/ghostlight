import { CHAPTERS } from '../../data/chapters'
import type { Chapter, ChapterId, Entry, Ofrenda } from '../../types'

export const NO_MEMORY = 'The flame has no memory of that.'

const STOP = new Set(
  `a an the and or but if then than that this these those is are was were be been being am do does did doing have has had having
  i me my we us our you your he him his she her hers it its they them their there here what which who whom whose when where why how
  all any both each few more most other some such no nor not only own same so too very can could will would shall should may might must
  about above after again against at by for from in into of on onto to with over under between through during before up down out off once
  tell please remember remembers remembered memory memories archive ofrenda knew know known ever name called`
    .split(/\s+/)
    .filter(Boolean),
)

const INTENTS: { id: ChapterId; words: string[] }[] = [
  {
    id: 'kitchen',
    words: [
      'cook', 'cooked', 'cooking', 'food', 'eat', 'ate', 'eaten', 'dish', 'kitchen', 'smell',
      'smelled', 'taste', 'tasted', 'recipe', 'meal', 'dinner', 'lunch', 'breakfast', 'sweet',
    ],
  },
  {
    id: 'song',
    words: [
      'sing', 'sang', 'sung', 'singing', 'song', 'music', 'radio', 'transistor', 'listen',
      'listened', 'tune', 'melody', 'bhajan', 'sangeet', 'hum', 'hummed', 'humming',
    ],
  },
  {
    id: 'place',
    words: [
      'where', 'place', 'terrace', 'room', 'house', 'home', 'garden', 'view', 'chair', 'road',
      'street', 'shop', 'window', 'city', 'village', 'town',
    ],
  },
  {
    id: 'saying',
    words: [
      'say', 'said', 'saying', 'tell', 'told', 'phrase', 'quote', 'quoted', 'words', 'advice',
      'always', 'expression', 'motto',
    ],
  },
  {
    id: 'small',
    words: [
      'object', 'thing', 'tin', 'box', 'button', 'buttons', 'kept', 'keep', 'habit', 'fold',
      'folded', 'newspaper', 'cup', 'small',
    ],
  },
  {
    id: 'unfinished',
    words: [
      'ask', 'asked', 'wish', 'wished', 'regret', 'question', 'wanted', 'want', 'never',
      'unfinished',
    ],
  },
]

const SYNONYMS: string[][] = [
  ['cook', 'cooked', 'cooking', 'food', 'meal', 'dish', 'eat', 'ate', 'eaten', 'recipe'],
  ['sing', 'sang', 'sung', 'singing', 'song', 'music', 'tune', 'melody', 'listen', 'hum'],
  ['say', 'said', 'saying', 'tell', 'told', 'phrase', 'quote', 'words', 'advice'],
  ['ask', 'asked', 'wish', 'wished', 'want', 'wanted', 'question', 'regret'],
  ['look', 'saw', 'seen', 'see', 'watch', 'watched'],
  ['make', 'made', 'making', 'creates', 'created'],
  ['keep', 'kept', 'keeping', 'held', 'hold'],
  ['small', 'little', 'tiny'],
  ['place', 'terrace', 'room', 'house', 'home', 'garden'],
]

const CANON = new Map<string, string>()
for (const group of SYNONYMS) {
  for (const word of group) CANON.set(word, group[0] ?? word)
}

function stem(word: string): string {
  if (word.length > 6 && word.endsWith('ing')) return word.slice(0, -3)
  if (word.length > 5 && word.endsWith('ied')) return `${word.slice(0, -3)}y`
  if (word.length > 4 && word.endsWith('ed')) return word.slice(0, -2)
  if (word.length > 5 && word.endsWith('es')) return word.slice(0, -2)
  if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1)
  return word
}

function words(value: string): string[] {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s']/g, ' ')
    .replace(/'s\b/g, '')
    .split(/\s+/)
    .filter((word) => word.length >= 2)
}

function tokenize(value: string): string[] {
  return words(value).filter((word) => !STOP.has(word))
}

function formsFor(tokens: string[]): Set<string> {
  const forms = new Set<string>()
  for (const token of tokens) {
    forms.add(token)
    const canonical = CANON.get(token) ?? stem(token)
    forms.add(canonical)
    forms.add(stem(token))
  }
  return forms
}

function canonicalFormsFor(token: string): string[] {
  return [token, CANON.get(token) ?? stem(token), stem(token)]
}

export type RetrievalResult =
  | { kind: 'profile'; answer: string }
  | { kind: 'memory'; entry: Entry; chapter: Chapter; matched: string[]; intent: ChapterId | null }
  | { kind: 'none' }

function profileAnswer(question: string, ofrenda: Ofrenda): RetrievalResult | null {
  const q = question.toLowerCase()
  const person = ofrenda.person
  const firstName = person.name.split(/\s+/)[0] ?? person.name

  if (/\b(related|relation|to you)\b/.test(q) && person.relation) {
    return {
      kind: 'profile',
      answer: `${person.name} is recorded here as your ${person.relation}.`,
    }
  }
  if (
    /\bwhat (was|is) (her|his|their) name\b|\bwho (was|is|were) (she|he|they)\b|\bwhat (was|is) (she|he|they) called\b/.test(
      q,
    )
  ) {
    return {
      kind: 'profile',
      answer: `${person.name}${person.relation ? ` — your ${person.relation}` : ''}${
        person.years ? ` (${person.years})` : ''
      }.`,
    }
  }
  if (/\b(born|birth|died|death|how old|what year)\b/.test(q) && person.years) {
    return {
      kind: 'profile',
      answer: `${firstName}'s years are recorded here as ${person.years}.`,
    }
  }
  return null
}

export function retrieveFromArchive(question: string, ofrenda: Ofrenda): RetrievalResult {
  const profile = profileAnswer(question, ofrenda)
  if (profile) return profile

  const allTokens = words(question)
  const questionTokens = allTokens.filter((word) => !STOP.has(word))
  if (questionTokens.length === 0) return { kind: 'none' }

  const answers = new Map<ChapterId, Entry>()
  for (const entry of ofrenda.entries) {
    if (!entry.skipped && entry.answer.trim().length > 0) answers.set(entry.id, entry)
  }
  if (answers.size === 0) return { kind: 'none' }

  let intent: ChapterId | null = null
  let intentIndex = Number.POSITIVE_INFINITY
  for (const group of INTENTS) {
    for (let index = 0; index < allTokens.length; index += 1) {
      const token = allTokens[index]
      if (!token) continue
      const forms = canonicalFormsFor(token)
      if (group.words.some((word) => forms.includes(word) || word === token)) {
        if (index < intentIndex) {
          intent = group.id
          intentIndex = index
        }
        break
      }
    }
  }

  const intentWords = new Set(
    intent ? (INTENTS.find((group) => group.id === intent)?.words ?? []) : [],
  )
  const contentTokens = questionTokens.filter((token) => {
    if (intentWords.has(token)) return false
    const forms = canonicalFormsFor(token)
    return !forms.some((form) => intentWords.has(form))
  })

  if (intent) {
    const chapter = CHAPTERS.find((item) => item.id === intent)
    const entry = answers.get(intent)
    if (!chapter || !entry) return { kind: 'none' }
    if (contentTokens.length === 0) {
      return { kind: 'memory', entry, chapter, matched: [], intent }
    }
    const answerForms = formsFor([...tokenize(entry.answer), ...tokenize(entry.artifact?.label ?? '')])
    const matched = contentTokens.filter((token) =>
      canonicalFormsFor(token).some((form) => answerForms.has(form)),
    )
    if (matched.length === 0) return { kind: 'none' }
    return { kind: 'memory', entry, chapter, matched, intent }
  }

  if (contentTokens.length === 0) return { kind: 'none' }

  let best: { entry: Entry; chapter: Chapter; matched: string[]; score: number } | null = null
  for (const chapter of CHAPTERS) {
    const entry = answers.get(chapter.id)
    if (!entry) continue
    const answerForms = formsFor(tokenize(entry.answer))
    const labelForms = formsFor(tokenize(entry.artifact?.label ?? ''))
    const matched = contentTokens.filter((token) =>
      canonicalFormsFor(token).some((form) => answerForms.has(form)),
    )
    const labelMatched = contentTokens.filter((token) =>
      canonicalFormsFor(token).some((form) => labelForms.has(form)),
    )
    const qualifies = matched.length >= 2
    if (!qualifies) continue
    const score = matched.length + labelMatched.length
    if (!best || score > best.score) {
      best = { entry, chapter, matched, score }
    }
  }

  if (!best) return { kind: 'none' }
  return {
    kind: 'memory',
    entry: best.entry,
    chapter: best.chapter,
    matched: best.matched,
    intent: null,
  }
}

export function excerpt(value: string, max = 700): string {
  const text = value.replace(/\s+/g, ' ').trim()
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('? '), cut.lastIndexOf('! '))
  return end > 200 ? cut.slice(0, end + 1) : `${cut.trimEnd()}…`
}
