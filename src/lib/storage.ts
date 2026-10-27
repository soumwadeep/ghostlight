import { createStore, get, set } from 'idb-keyval'
import { CHAPTERS } from '../data/chapters'
import type { Artifact, ChapterId, Entry, Ofrenda, Remembrance } from '../types'
import { nowIso } from './utils'

const KEY = 'ghostlight.archive.v1'
const store = createStore('ghostlight', 'archive')

export interface PersistedArchive {
  version: 1
  seeded: boolean
  ofrendas: Ofrenda[]
}

const chapterIds = new Set<ChapterId>(CHAPTERS.map((chapter) => chapter.id))
const tones = new Set(['warm', 'poetic', 'plain'])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function stringOr(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function safePhoto(value: unknown): string | undefined {
  if (typeof value !== 'string' || value.length === 0) return undefined
  if (value.startsWith('/demo/')) return value
  return /^data:image\/(png|jpeg|jpg|webp|svg\+xml);/i.test(value) ? value : undefined
}

function normalizeArtifact(value: unknown): Artifact | null {
  if (!isRecord(value)) return null
  const label = stringOr(value.label).trim()
  if (!label) return null
  const kind = stringOr(value.kind)
  if (!['food', 'song', 'place', 'saying', 'object', 'moment'].includes(kind)) return null
  return {
    kind: kind as Artifact['kind'],
    label: label.slice(0, 140),
    note: stringOr(value.note).trim().slice(0, 240) || undefined,
  }
}

function normalizeRemembrance(value: unknown): Remembrance | null {
  if (!isRecord(value)) return null
  const title = stringOr(value.title).trim()
  const body = stringOr(value.body).trim()
  if (!title || !body) return null
  const source = stringOr(value.source)
  return {
    title: title.slice(0, 120),
    epitaph: stringOr(value.epitaph).trim().slice(0, 180),
    body: body.slice(0, 12000),
    source: ['gemma', 'ollama', 'candle', 'demo'].includes(source)
      ? (source as Remembrance['source'])
      : 'candle',
    modelLabel: stringOr(value.modelLabel).trim().slice(0, 80) || undefined,
    latencyMs:
      typeof value.latencyMs === 'number' && Number.isFinite(value.latencyMs)
        ? Math.round(value.latencyMs)
        : undefined,
    createdAt: stringOr(value.createdAt, nowIso()),
  }
}

export function normalizeOfrenda(raw: unknown): Ofrenda | null {
  if (!isRecord(raw) || !isRecord(raw.person)) return null
  const id = stringOr(raw.id).trim()
  const name = stringOr(raw.person.name).trim()
  if (!id || !name) return null

  const entriesById = new Map<ChapterId, Entry>()
  if (Array.isArray(raw.entries)) {
    for (const item of raw.entries) {
      if (!isRecord(item)) continue
      const chapterId = stringOr(item.id) as ChapterId
      if (!chapterIds.has(chapterId)) continue
      entriesById.set(chapterId, {
        id: chapterId,
        answer: stringOr(item.answer).slice(0, 4000),
        skipped: Boolean(item.skipped),
        artifact: normalizeArtifact(item.artifact),
        updatedAt: stringOr(item.updatedAt, nowIso()),
      })
    }
  }

  const entries: Entry[] = CHAPTERS.map((chapter) => {
    const existing = entriesById.get(chapter.id)
    return (
      existing ?? {
        id: chapter.id,
        answer: '',
        skipped: true,
        artifact: null,
        updatedAt: nowIso(),
      }
    )
  })

  const tone = stringOr(raw.tone)
  const createdAt = stringOr(raw.createdAt, nowIso())
  const updatedAt = stringOr(raw.updatedAt, createdAt)

  return {
    version: 1,
    id,
    createdAt,
    updatedAt,
    isDemo: Boolean(raw.isDemo),
    tone: tones.has(tone) ? (tone as Ofrenda['tone']) : 'warm',
    person: {
      name: name.slice(0, 120),
      relation: stringOr(raw.person.relation).trim().slice(0, 80),
      years: stringOr(raw.person.years).trim().slice(0, 40) || undefined,
      pronoun: stringOr(raw.person.pronoun, 'they/them').trim().slice(0, 24),
      photo: safePhoto(raw.person.photo),
    },
    entries,
    remembrance: normalizeRemembrance(raw.remembrance),
  }
}

function readLocalStorage(): PersistedArchive | null {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed)) return null
    const list = Array.isArray(parsed.ofrendas)
      ? parsed.ofrendas.map(normalizeOfrenda).filter((item): item is Ofrenda => item !== null)
      : []
    return { version: 1, seeded: Boolean(parsed.seeded), ofrendas: list }
  } catch {
    return null
  }
}

export async function readArchive(): Promise<PersistedArchive> {
  try {
    const stored = await get<PersistedArchive>(KEY, store)
    if (stored && Array.isArray(stored.ofrendas)) {
      const list = stored.ofrendas
        .map(normalizeOfrenda)
        .filter((item): item is Ofrenda => item !== null)
      return { version: 1, seeded: Boolean(stored.seeded), ofrendas: list }
    }
  } catch {
    // Private windows and locked-down browsers can refuse IndexedDB.
  }
  return readLocalStorage() ?? { version: 1, seeded: false, ofrendas: [] }
}

export async function writeArchive(ofrendas: Ofrenda[], seeded: boolean): Promise<void> {
  const payload: PersistedArchive = { version: 1, seeded, ofrendas }
  try {
    await set(KEY, payload, store)
    return
  } catch {
    // Fall through to localStorage. Photographs may exceed its quota.
  }
  try {
    window.localStorage.setItem(KEY, JSON.stringify(payload))
  } catch (error) {
    console.warn('Ghostlight could not persist the archive locally.', error)
  }
}
