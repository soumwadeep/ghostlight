export type ChapterId =
  | 'kitchen'
  | 'song'
  | 'place'
  | 'saying'
  | 'small'
  | 'unfinished'

export type ArtifactKind = 'food' | 'song' | 'place' | 'saying' | 'object' | 'moment'

export type Tone = 'warm' | 'poetic' | 'plain'

export type EngineKind = 'gemma' | 'candle' | 'ollama'

export interface Artifact {
  kind: ArtifactKind
  label: string
  note?: string
}

export interface Person {
  name: string
  relation: string
  years?: string
  pronoun: string
  photo?: string
}

export interface Entry {
  id: ChapterId
  answer: string
  skipped: boolean
  artifact: Artifact | null
  updatedAt: string
}

export interface Remembrance {
  title: string
  epitaph: string
  body: string
  source: 'gemma' | 'ollama' | 'candle' | 'demo'
  modelLabel?: string
  latencyMs?: number
  createdAt: string
}

export interface Ofrenda {
  version: 1
  id: string
  createdAt: string
  updatedAt: string
  person: Person
  entries: Entry[]
  tone: Tone
  remembrance: Remembrance | null
  isDemo?: boolean
}

export interface Chapter {
  id: ChapterId
  rite: string
  label: string
  prompt: string
  detail: string
  helper: string
  placeholder: string
  kind: ArtifactKind
}

export interface AskAnswer {
  answer: string
  citations: ChapterId[]
  grounded: boolean
  basis: 'memories' | 'name-card' | 'none'
  source: 'gemma' | 'ollama' | 'search'
  latencyMs?: number
}
