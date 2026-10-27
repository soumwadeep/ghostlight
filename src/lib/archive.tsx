import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createDemoOfrenda, DEMO_ID } from '../data/demo'
import type { Ofrenda } from '../types'
import { normalizeOfrenda, readArchive, writeArchive } from './storage'
import { downloadFile, nowIso, slugify, uid } from './utils'

interface ImportResult {
  ok: boolean
  count: number
  error?: string
}

interface ArchiveContextValue {
  ready: boolean
  ofrendas: Ofrenda[]
  getOfrenda: (id: string) => Ofrenda | undefined
  saveOfrenda: (ofrenda: Ofrenda) => void
  deleteOfrenda: (id: string) => void
  importFromJson: (text: string) => ImportResult
  exportAll: () => void
  exportOne: (id: string) => void
  restoreDemo: () => void
}

const ArchiveContext = createContext<ArchiveContextValue | null>(null)

export function ArchiveProvider({ children }: { children: ReactNode }) {
  const [ofrendas, setOfrendas] = useState<Ofrenda[]>([])
  const [ready, setReady] = useState(false)
  const listRef = useRef<Ofrenda[]>([])
  const seededRef = useRef(false)

  useEffect(() => {
    let alive = true
    void readArchive().then((stored) => {
      if (!alive) return
      let list = stored.ofrendas
      let seeded = stored.seeded
      if (!seeded) {
        if (!list.some((ofrenda) => ofrenda.id === DEMO_ID)) {
          list = [createDemoOfrenda(), ...list]
        }
        seeded = true
        void writeArchive(list, true)
      }
      listRef.current = list
      seededRef.current = seeded
      setOfrendas(list)
      setReady(true)
    })
    return () => {
      alive = false
    }
  }, [])

  const commit = useCallback((next: Ofrenda[]) => {
    listRef.current = next
    setOfrendas(next)
    void writeArchive(next, seededRef.current)
  }, [])

  const getOfrenda = useCallback(
    (id: string) => ofrendas.find((ofrenda) => ofrenda.id === id),
    [ofrendas],
  )

  const saveOfrenda = useCallback(
    (ofrenda: Ofrenda) => {
      const current = listRef.current
      const exists = current.some((item) => item.id === ofrenda.id)
      const next = exists
        ? current.map((item) => (item.id === ofrenda.id ? ofrenda : item))
        : [ofrenda, ...current]
      commit(next)
    },
    [commit],
  )

  const deleteOfrenda = useCallback(
    (id: string) => {
      commit(listRef.current.filter((ofrenda) => ofrenda.id !== id))
    },
    [commit],
  )

  const importFromJson = useCallback(
    (text: string): ImportResult => {
      let parsed: unknown
      try {
        parsed = JSON.parse(text)
      } catch {
        return { ok: false, count: 0, error: 'That does not look like a Ghostlight archive.' }
      }

      const candidates: unknown[] = Array.isArray(parsed)
        ? parsed
        : parsed &&
            typeof parsed === 'object' &&
            'ofrendas' in parsed &&
            Array.isArray((parsed as { ofrendas: unknown }).ofrendas)
          ? ((parsed as { ofrendas: unknown[] }).ofrendas ?? [])
          : [parsed]

      const incoming: Ofrenda[] = []
      for (const candidate of candidates) {
        const ofrenda = normalizeOfrenda(candidate)
        if (!ofrenda) continue
        const collision = listRef.current.some((item) => item.id === ofrenda.id)
        const demoCollision = ofrenda.id === DEMO_ID
        if (collision || demoCollision) {
          ofrenda.id = uid()
        }
        ofrenda.isDemo = false
        ofrenda.updatedAt = nowIso()
        incoming.push(ofrenda)
      }

      if (incoming.length === 0) {
        return {
          ok: false,
          count: 0,
          error: 'No readable ofrendas were found in that file.',
        }
      }

      commit([...incoming, ...listRef.current])
      return { ok: true, count: incoming.length }
    },
    [commit],
  )

  const exportOne = useCallback((id: string) => {
    const ofrenda = listRef.current.find((item) => item.id === id)
    if (!ofrenda) return
    downloadFile(
      `ghostlight-${slugify(ofrenda.person.name)}.json`,
      JSON.stringify(
        { version: 1, exportedAt: nowIso(), kind: 'ghostlight-archive', ofrendas: [ofrenda] },
        null,
        2,
      ),
      'application/json',
    )
  }, [])

  const exportAll = useCallback(() => {
    downloadFile(
      `ghostlight-archive-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(
        { version: 1, exportedAt: nowIso(), kind: 'ghostlight-archive', ofrendas: listRef.current },
        null,
        2,
      ),
      'application/json',
    )
  }, [])

  const restoreDemo = useCallback(() => {
    if (listRef.current.some((ofrenda) => ofrenda.id === DEMO_ID)) return
    commit([createDemoOfrenda(), ...listRef.current])
  }, [commit])

  const value = useMemo<ArchiveContextValue>(
    () => ({
      ready,
      ofrendas,
      getOfrenda,
      saveOfrenda,
      deleteOfrenda,
      importFromJson,
      exportAll,
      exportOne,
      restoreDemo,
    }),
    [
      ready,
      ofrendas,
      getOfrenda,
      saveOfrenda,
      deleteOfrenda,
      importFromJson,
      exportAll,
      exportOne,
      restoreDemo,
    ],
  )

  return <ArchiveContext.Provider value={value}>{children}</ArchiveContext.Provider>
}

export function useArchive(): ArchiveContextValue {
  const value = useContext(ArchiveContext)
  if (!value) throw new Error('useArchive must be used inside ArchiveProvider')
  return value
}
