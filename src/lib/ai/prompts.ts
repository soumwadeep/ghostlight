import type { Chapter, ChapterId, Entry, Ofrenda, Tone } from '../../types'
import { CHAPTERS } from '../../data/chapters'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

const TONE_GUIDE: Record<Tone, string> = {
  warm: 'warm, plain and close, like speaking to someone in the next room',
  poetic: 'quietly lyrical — more image and rhythm, but never ornate',
  plain: 'plainspoken and factual; let the details carry the feeling',
}

function memoriesBlock(entries: Entry[]): string {
  return CHAPTERS.map((chapter) => {
    const entry = entries.find((item) => item.id === chapter.id)
    if (!entry || entry.skipped || !entry.answer.trim()) return ''
    return `[${chapter.label.toUpperCase()}] ${entry.answer.trim()}`
  })
    .filter(Boolean)
    .join('\n')
}

export function buildWeaveMessages(ofrenda: Ofrenda): ChatMessage[] {
  const { person, entries, tone } = ofrenda
  const pronoun = person.pronoun || 'they/them'
  const years = person.years ? ` Years: ${person.years}.` : ''
  const relation = person.relation ? ` Relation: ${person.relation}.` : ''

  return [
    {
      role: 'system',
      content:
        'You are the Keeper of a ghostlight: a precise, conservative memory-keeper in a remembrance studio inspired by Día de Muertos. You write only from the memories supplied. You never invent names, dates, places, objects, instruments, people or events. If a detail is not written in the memories, you leave it out. You never write as "I" or "we"; you are not the family. You never pretend to speak as the deceased and you never claim to contact anyone. Your prose is concrete, plain and unsentimental. No repetition, no invented imagery, no grand statements.',
    },
    {
      role: 'user',
      content: `Write a remembrance for ${person.name}.${relation}${years} Pronouns: ${pronoun}. Tone: ${TONE_GUIDE[tone]}.

Here are the only facts you may use:
${memoriesBlock(entries)}

Rules:
- Third person only. Never use "I", "me", "my", "we" or "our".
- Every sentence must be supported by the memories above. Do not add an instrument, a person, a place, a food or an object that is not written above.
- Write exactly ${paragraphPlan(entries).count} short ${paragraphPlan(entries).count === 1 ? 'paragraph' : 'paragraphs'}, separated by a blank line.
${paragraphPlan(entries).lines}
- Do not repeat a phrase, an idea or an image from one paragraph in another.
- Do not repeat the field labels (TITLE, EPITAPH, BODY) inside the body.
- End with a concrete image or line already present in the memories.
- Do not use the words "journey", "forever", "tapestry", "legacy", "rest in peace", "quiet strength" or "world of possibilities".
- Do not editorialize. Do not explain what the details mean.

Return exactly these three fields, in this order, with no other text:
TITLE: two to five words, a concrete object or image from the memories, never the person's name and never the word "remembrance"
EPITAPH: one line, at most twelve words, drawn from the memories, different from the title
BODY: the remembrance, in ${paragraphPlan(entries).count} ${paragraphPlan(entries).count === 1 ? 'paragraph' : 'paragraphs'}`,
    },
  ]
}

function paragraphPlan(entries: Entry[]): { count: number; lines: string } {
  const present = new Set(
    entries.filter((entry) => !entry.skipped && entry.answer.trim()).map((entry) => entry.id),
  )
  const groups: ChapterId[][] = [
    ['kitchen', 'small'],
    ['song', 'place'],
    ['saying', 'unfinished'],
  ]
    .map((group) => group.filter((id): id is ChapterId => present.has(id as ChapterId)))
    .filter((group) => group.length > 0)

  const lines = groups
    .map((group, index) => {
      const labels = group.map((id) => {
        const chapter = CHAPTERS.find((item) => item.id === id)
        return chapter ? `THE ${chapter.label.toUpperCase()}` : ''
      })
      return `  Paragraph ${index + 1}: only ${labels.join(' and ')}.`
    })
    .join('\n')

  return { count: Math.max(1, groups.length), lines: lines || '  Paragraph 1: use the memories above.' }
}

export function buildAskMessages(ofrenda: Ofrenda, question: string): ChatMessage[] {
  return [
    {
      role: 'system',
      content:
        'You are the Keeper of a ghostlight. You answer only from the archive you are given. You never guess, embellish or invent. If the archive does not contain the answer, you say so. You never claim to speak for the person or contact the dead. Keep answers under 40 words.',
    },
    {
      role: 'user',
      content: `The archive of ${ofrenda.person.name}:
${memoriesBlock(ofrenda.entries)}

Question: ${question}

Answer only from the archive.
Return exactly:
ANSWER: one or two sentences, or the single word NONE
CITE: the chapter names you used, separated by commas, or NONE

If the archive does not contain the answer, return:
ANSWER: NONE
CITE: NONE`,
    },
  ]
}

export function buildGroundedAnswerMessages(
  ofrenda: Ofrenda,
  question: string,
  memoryLabel: string,
  memoryText: string,
): ChatMessage[] {
  return [
    {
      role: 'system',
      content:
        'You are the Keeper of a ghostlight. Answer only from the single archived memory supplied. Do not add any fact, name, date or detail that is not in it. Keep the answer under 35 words. If the memory does not answer the question, reply with the single word NONE.',
    },
    {
      role: 'user',
      content: `A visitor to the ofrenda of ${ofrenda.person.name} asks:
${question}

The only memory you may use:
[${memoryLabel.toUpperCase()}] ${memoryText}

Return only:
ANSWER: one or two sentences, or NONE`,
    },
  ]
}

export function memoryLabel(chapter: Chapter): string {
  return chapter.label.toUpperCase()
}
