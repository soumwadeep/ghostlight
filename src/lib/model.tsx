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
import type { EngineKind } from '../types'
import { detectOllama } from './ai/ollama'
import {
  ensureGemma,
  GEMMA_MODEL_ID,
  isGemmaLoaded,
  setGemmaProgressListener,
} from './ai/webllm'

const PREF_KEY = 'ghostlight.engine'

export type WebGpuState = 'checking' | 'yes' | 'no'
export type GemmaState = 'idle' | 'loading' | 'ready' | 'error'

export interface OllamaState {
  status: 'idle' | 'checking' | 'found' | 'missing'
  models: string[]
  model: string | null
}

interface ModelContextValue {
  webgpu: WebGpuState
  gemma: {
    status: GemmaState
    progress: number
    message: string
    error: string | null
    cached: boolean | null
  }
  preference: EngineKind
  setPreference: (engine: EngineKind) => void
  lightGemma: () => Promise<boolean>
  checkCache: () => Promise<void>
  ollama: OllamaState
  scanOllama: () => Promise<void>
}

const ModelContext = createContext<ModelContextValue | null>(null)

interface GpuLike {
  requestAdapter: () => Promise<unknown | null>
}

function readPreference(): EngineKind {
  try {
    const stored = window.localStorage.getItem(PREF_KEY)
    if (stored === 'gemma' || stored === 'candle' || stored === 'ollama') return stored
  } catch {
    // Storage can be unavailable in private windows.
  }
  return 'gemma'
}

export function ModelProvider({ children }: { children: ReactNode }) {
  const [webgpu, setWebgpu] = useState<WebGpuState>('checking')
  const [preference, setPreferenceState] = useState<EngineKind>(readPreference)
  const [gemma, setGemma] = useState<ModelContextValue['gemma']>({
    status: isGemmaLoaded() ? 'ready' : 'idle',
    progress: isGemmaLoaded() ? 1 : 0,
    message: '',
    error: null,
    cached: null,
  })
  const [ollama, setOllama] = useState<OllamaState>({
    status: 'idle',
    models: [],
    model: null,
  })
  const explicitRef = useRef(false)

  useEffect(() => {
    try {
      explicitRef.current = Boolean(window.localStorage.getItem(PREF_KEY))
    } catch {
      explicitRef.current = false
    }
    let alive = true
    const nav = navigator as Navigator & { gpu?: GpuLike }
    if (!nav.gpu) {
      setWebgpu('no')
      return
    }
    nav.gpu
      .requestAdapter()
      .then((adapter) => {
        if (alive) setWebgpu(adapter ? 'yes' : 'no')
      })
      .catch(() => {
        if (alive) setWebgpu('no')
      })
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (webgpu === 'no' && !explicitRef.current) {
      setPreferenceState('candle')
    }
  }, [webgpu])

  const setPreference = useCallback((engine: EngineKind) => {
    explicitRef.current = true
    setPreferenceState(engine)
    try {
      window.localStorage.setItem(PREF_KEY, engine)
    } catch {
      // The choice still applies for this session.
    }
  }, [])

  const lightGemma = useCallback(async (): Promise<boolean> => {
    if (isGemmaLoaded()) {
      setGemma((current) => ({ ...current, status: 'ready', progress: 1 }))
      return true
    }
    if (webgpu === 'no') {
      setGemma((current) => ({
        ...current,
        status: 'error',
        error:
          'This browser does not expose WebGPU. Chrome or Edge on a desktop is the smoothest path. Candle mode is open, and needs no download.',
      }))
      return false
    }

    setGemma((current) => ({
      ...current,
      status: 'loading',
      progress: 0,
      message: 'Waking the Keeper…',
      error: null,
    }))
    setGemmaProgressListener((progress, message) => {
      setGemma((current) => ({
        ...current,
        progress: Math.max(current.progress, progress),
        message,
      }))
    })

    try {
      await ensureGemma()
      setGemma({
        status: 'ready',
        progress: 1,
        message: 'The candle is lit.',
        error: null,
        cached: true,
      })
      setPreference('gemma')
      return true
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message.replace(/\s+/g, ' ').slice(0, 260)
          : 'The model could not start on this device.'
      setGemma({
        status: 'error',
        progress: 0,
        message: '',
        error: message,
        cached: null,
      })
      return false
    } finally {
      setGemmaProgressListener(null)
    }
  }, [setPreference, webgpu])

  const checkCache = useCallback(async () => {
    if (webgpu === 'no') return
    try {
      const webllm = await import('@mlc-ai/web-llm')
      const cached = await webllm.hasModelInCache(GEMMA_MODEL_ID)
      setGemma((current) => ({ ...current, cached }))
    } catch {
      setGemma((current) => ({ ...current, cached: null }))
    }
  }, [webgpu])

  const scanOllama = useCallback(async () => {
    setOllama({ status: 'checking', models: [], model: null })
    const info = await detectOllama()
    setOllama({
      status: info.ok ? 'found' : 'missing',
      models: info.models,
      model: info.preferred,
    })
  }, [])

  const value = useMemo<ModelContextValue>(
    () => ({
      webgpu,
      gemma,
      preference,
      setPreference,
      lightGemma,
      checkCache,
      ollama,
      scanOllama,
    }),
    [webgpu, gemma, preference, setPreference, lightGemma, checkCache, ollama, scanOllama],
  )

  return <ModelContext.Provider value={value}>{children}</ModelContext.Provider>
}

export function useModel(): ModelContextValue {
  const value = useContext(ModelContext)
  if (!value) throw new Error('useModel must be used inside ModelProvider')
  return value
}
