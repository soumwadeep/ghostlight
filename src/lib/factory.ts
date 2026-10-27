import { CHAPTERS } from '../data/chapters'
import type { Ofrenda, Person } from '../types'
import { nowIso, uid } from './utils'

export function createBlankOfrenda(person: Person): Ofrenda {
  const stamp = nowIso()
  return {
    version: 1,
    id: uid(),
    createdAt: stamp,
    updatedAt: stamp,
    person,
    tone: 'warm',
    remembrance: null,
    entries: CHAPTERS.map((chapter) => ({
      id: chapter.id,
      answer: '',
      skipped: false,
      artifact: null,
      updatedAt: stamp,
    })),
  }
}
