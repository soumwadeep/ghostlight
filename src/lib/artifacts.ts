import type { Artifact, Chapter } from '../types'

function clean(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function cutAtWord(value: string, max: number): string {
  if (value.length <= max) return value
  const slice = value.slice(0, max)
  const lastSpace = slice.lastIndexOf(' ')
  return `${(lastSpace > max * 0.5 ? slice.slice(0, lastSpace) : slice).replace(/[,;:.\u2014-]+$/, '')}…`
}

function quoted(value: string): string | null {
  const match = value.match(/[“"']([^”"']{2,80})[”"']/)
  return match?.[1]?.trim() ?? null
}

function firstClause(value: string): string {
  const stripped = value
    .replace(/^(she|he|they)\s+(always|used to|would)\s+/i, '')
    .replace(/^(my|her|his|their)\s+(grandmother|grandfather|mother|father|aunt|uncle|sister|brother)\s+/i, '')
  const clause = stripped.split(/[.;!?]|,\s|\s—\s|\s-\s/)[0] ?? stripped
  return cutAtWord(clause, 46).replace(/["“”']/g, '').trim()
}

export function extractArtifact(answer: string, chapter: Chapter): Artifact | null {
  const value = clean(answer)
  if (value.length < 2) return null

  let label: string
  if (chapter.kind === 'saying' || chapter.kind === 'song') {
    label = quoted(value) ?? firstClause(value)
  } else {
    label = firstClause(value)
  }
  if (!label || label.length < 2) label = chapter.label
  return {
    kind: chapter.kind,
    label: capitalize(label),
  }
}

export function hasAnswer(answer: string): boolean {
  return answer.trim().length > 0
}
