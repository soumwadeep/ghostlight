import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Cpu,
  Flame,
  ImagePlus,
  Loader2,
  Lock,
  ScanLine,
  Server,
  X,
} from 'lucide-react'
import { CHAPTERS, TONES } from '../data/chapters'
import { Portrait } from '../components/Portrait'
import { useArchive } from '../lib/archive'
import { useModel } from '../lib/model'
import { extractArtifact } from '../lib/artifacts'
import { hasEnoughToWeave } from '../lib/ai/candle'
import { weaveRemembrance } from '../lib/ai/weave'
import { GEMMA_LABEL, GEMMA_SIZE_LABEL } from '../lib/ai/webllm'
import { createBlankOfrenda } from '../lib/factory'
import type { EngineKind, Entry, Ofrenda, Person, Tone } from '../types'
import {
  cx,
  countWords,
  formatDate,
  makePortrait,
  nowIso,
  pluralize,
} from '../lib/utils'

type Stage = 'setup' | 'chapter' | 'weave'

function PhotoField({
  photo,
  onChange,
}: {
  photo?: string
  onChange: (photo: string | undefined) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    setError('')
    try {
      onChange(await makePortrait(file))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That image could not be read.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="photo-field">
      {photo ? (
        <div className="photo-preview">
          <img src={photo} alt="The chosen portrait" />
          <div className="photo-actions">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => inputRef.current?.click()}
            >
              Change
            </button>
            <button
              type="button"
              className="btn btn-quiet btn-sm"
              onClick={() => {
                onChange(undefined)
                if (inputRef.current) inputRef.current.value = ''
              }}
            >
              <X size={13} /> Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="photo-empty"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
        >
          {busy ? <Loader2 size={20} className="spin" /> : <ImagePlus size={20} />}
          <span>{busy ? 'Preparing the photograph…' : 'Add a photograph'}</span>
          <small>Optional. It is read here and never uploaded.</small>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          void handleFile(event.target.files?.[0])
          event.target.value = ''
        }}
      />
      {error && <p className="field-help error">{error}</p>}
    </div>
  )
}

function Setup({
  draft,
  onStart,
  onCancel,
}: {
  draft: Ofrenda | null
  onStart: (person: Person) => void
  onCancel?: () => void
}) {
  const [name, setName] = useState(draft?.person.name ?? '')
  const [relation, setRelation] = useState(draft?.person.relation ?? '')
  const [years, setYears] = useState(draft?.person.years ?? '')
  const [pronoun, setPronoun] = useState(draft?.person.pronoun ?? '')
  const [photo, setPhoto] = useState<string | undefined>(draft?.person.photo)
  const [error, setError] = useState('')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) {
      setError('A name is enough to begin. What did you call them?')
      return
    }
    setError('')
    onStart({
      name: name.trim().slice(0, 120),
      relation: relation.trim().slice(0, 80),
      years: years.trim().slice(0, 40) || undefined,
      pronoun: pronoun.trim().slice(0, 24) || 'they/them',
      photo,
    })
  }

  return (
    <div className="wrap studio-setup">
      <div className="setup-intro">
        <p className="eyebrow">The studio</p>
        <h1 className="display">Who are we keeping a light for?</h1>
        <p className="lede">
          It can be someone you lost, or someone you simply don’t want to forget. Six questions.
          No right answers.
        </p>
        <ol className="setup-rites">
          {CHAPTERS.map((chapter) => (
            <li key={chapter.id}>
              <span className="mono">{chapter.rite.replace('Rite ', '')}</span>
              {chapter.label}
            </li>
          ))}
        </ol>
        <p className="note">
          A photograph is optional. Everything you type stays in this browser. You can export it
          or delete it at any time.
        </p>
      </div>

      <form className="panel panel-pad setup-form" onSubmit={submit} autoComplete="off">
        <div className="setup-form-head">
          <h2 className="display">{draft ? 'The name card' : 'Begin here'}</h2>
          <span className="chip">
            <Lock size={11} /> Local only
          </span>
        </div>

        <div className="field">
          <label htmlFor="person-name">Their name</label>
          <input
            id="person-name"
            className="input"
            value={name}
            maxLength={120}
            autoFocus={!draft}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ruma Das"
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="person-relation">Who were they to you?</label>
            <input
              id="person-relation"
              className="input"
              value={relation}
              maxLength={80}
              onChange={(event) => setRelation(event.target.value)}
              placeholder="grandmother, friend"
            />
          </div>
          <div className="field">
            <label htmlFor="person-years">Years</label>
            <input
              id="person-years"
              className="input"
              value={years}
              maxLength={40}
              onChange={(event) => setYears(event.target.value)}
              placeholder="1941–2021"
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="person-pronoun">Pronouns</label>
          <input
            id="person-pronoun"
            className="input"
            value={pronoun}
            maxLength={24}
            onChange={(event) => setPronoun(event.target.value)}
            placeholder="she/her"
          />
          <p className="field-help">So the Keeper refers to them the way you did.</p>
        </div>

        <div className="field">
          <span className="field-label">A photograph</span>
          <PhotoField photo={photo} onChange={setPhoto} />
        </div>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <div className="setup-actions">
          <button type="submit" className="btn btn-primary">
            {draft ? 'Save & continue' : 'Begin the ritual'} <ArrowRight size={15} />
          </button>
          {onCancel && (
            <button type="button" className="btn btn-ghost" onClick={onCancel}>
              Back
            </button>
          )}
          {draft?.remembrance && (
            <Link to={`/ofrenda/${draft.id}`} className="btn btn-quiet">
              View the ofrenda
            </Link>
          )}
        </div>

        <p className="tiny-label">No sign-up · No server · Exportable forever</p>
      </form>
    </div>
  )
}

function ChapterStep({
  draft,
  chapterIndex,
  answer,
  onAnswer,
  onContinue,
  onSkip,
  onGoTo,
  onReview,
  onSetup,
}: {
  draft: Ofrenda
  chapterIndex: number
  answer: string
  onAnswer: (value: string) => void
  onContinue: () => void
  onSkip: () => void
  onGoTo: (index: number) => void
  onReview: () => void
  onSetup: () => void
}) {
  const chapter = CHAPTERS[chapterIndex]
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const answered = draft.entries.filter((entry) => !entry.skipped && entry.answer.trim())
  const words = countWords(answer)

  useEffect(() => {
    if (!chapter) return
    const timer = window.setTimeout(() => {
      if (window.innerWidth > 900) textareaRef.current?.focus()
    }, 350)
    return () => window.clearTimeout(timer)
  }, [chapterIndex, chapter])

  if (!chapter) return null

  return (
    <div className="wrap studio-work">
      <aside className="studio-rail">
        <div className="rail-head">
          <span className="mono">The studio</span>
          <span className="mono rail-local">
            <Lock size={10} /> Local
          </span>
        </div>
        <div className="rail-person">
          <Portrait person={draft.person} size="sm" />
          <div>
            <b>{draft.person.name}</b>
            <span>{draft.person.relation || draft.person.years || 'A light'}</span>
          </div>
        </div>

        <ol className="rail-steps" aria-label="The six rites">
          {CHAPTERS.map((item, index) => {
            const entry = draft.entries.find((value) => value.id === item.id)
            const isAnswered = Boolean(entry?.answer.trim() && !entry.skipped)
            const isSkipped = Boolean(entry?.skipped)
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={cx(
                    'rail-step',
                    index === chapterIndex && 'is-current',
                    isAnswered && 'is-done',
                    isSkipped && 'is-skipped',
                  )}
                  onClick={() => onGoTo(index)}
                  aria-current={index === chapterIndex ? 'step' : undefined}
                >
                  <span className="rail-dot">
                    {isAnswered ? <Check size={10} /> : <i />}
                  </span>
                  <span className="rail-label">
                    <small className="mono">{item.rite}</small>
                    {item.label}
                  </span>
                  {isSkipped && <span className="rail-skipped mono">set aside</span>}
                </button>
              </li>
            )
          })}
        </ol>

        <div className="rail-foot">
          <button
            type="button"
            className="btn btn-ghost btn-sm rail-review"
            onClick={onReview}
            disabled={answered.length === 0}
          >
            <Flame size={14} /> Review & weave
          </button>
          <button type="button" className="btn btn-quiet btn-sm" onClick={onSetup}>
            Edit the name card
          </button>
          <Link to="/archive" className="rail-leave mono">
            Leave the studio
          </Link>
        </div>
      </aside>

      <section className="chapter-main">
        <div className="chapter-top">
          <p className="eyebrow">
            {chapter.rite} — {chapter.label}
          </p>
          <span className="chip chapter-local">
            <Lock size={10} /> {answered.length}/6 kept
          </span>
        </div>
        <h1 className="display chapter-prompt">{chapter.prompt}</h1>
        <p className="chapter-detail">{chapter.detail}</p>

        <form
          className="chapter-form"
          onSubmit={(event) => {
            event.preventDefault()
            onContinue()
          }}
        >
          <label htmlFor="chapter-answer" className="sr-only">
            {chapter.prompt}
          </label>
          <textarea
            id="chapter-answer"
            ref={textareaRef}
            className="textarea chapter-textarea"
            value={answer}
            maxLength={4000}
            onChange={(event) => onAnswer(event.target.value)}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                event.preventDefault()
                onContinue()
              }
            }}
            placeholder={chapter.placeholder}
            rows={6}
          />
          <div className="chapter-meta">
            <p className="field-help">{chapter.helper}</p>
            <span className="mono word-count">{pluralize(words, 'word')}</span>
          </div>

          <div className="chapter-actions">
            <button type="button" className="btn btn-quiet" onClick={onSkip}>
              Skip this one
            </button>
            <div className="chapter-next">
              <span className="mono kbd-hint">
                <kbd className="kbd">⌘</kbd> <span>+</span> <kbd className="kbd">↵</kbd>
              </span>
              <button type="submit" className="btn btn-primary" disabled={!answer.trim()}>
                Keep this memory <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </form>

        <div className="chapter-bottom-nav">
          <button
            type="button"
            className="btn btn-quiet btn-sm"
            onClick={() => onGoTo(chapterIndex - 1)}
            disabled={chapterIndex === 0}
          >
            <ArrowLeft size={14} /> Back
          </button>
          <button
            type="button"
            className="btn btn-quiet btn-sm chapter-review-mobile"
            onClick={onReview}
            disabled={answered.length === 0}
          >
            <Flame size={14} /> Review & weave
          </button>
          <button
            type="button"
            className="btn btn-quiet btn-sm"
            onClick={() => onGoTo(chapterIndex + 1)}
            disabled={chapterIndex === CHAPTERS.length - 1}
          >
            Next <ArrowRight size={14} />
          </button>
        </div>

        <div className="chapter-foot">
          <p className="note chapter-micro">
            There is no microphone here on purpose. Type it. Say it out loud first if that helps.
          </p>
          <button type="button" className="link chapter-name-link" onClick={onSetup}>
            Edit the name card
          </button>
        </div>
      </section>

      <aside className="studio-offerings">
        <div className="offerings-card">
          <div className="offerings-head">
            <span className="mono">The altar</span>
            <span className="mono">{answered.length}/6</span>
          </div>
          <ul>
            {CHAPTERS.map((item) => {
              const entry = draft.entries.find((value) => value.id === item.id)
              const isCurrent = item.id === chapter.id
              return (
                <li
                  key={item.id}
                  className={cx(
                    isCurrent && 'is-current',
                    entry?.artifact && !entry.skipped && 'is-filled',
                  )}
                >
                  <span className="offering-dot" />
                  <span className="offering-name">{item.label}</span>
                  <span className="offering-label">
                    {entry?.skipped
                      ? 'set aside'
                      : entry?.artifact?.label
                        ? entry.artifact.label
                        : entry?.answer.trim()
                          ? 'remembered'
                          : '—'}
                  </span>
                </li>
              )
            })}
          </ul>
          <p className="tiny-label">Every memory becomes a candle on the altar.</p>
        </div>
        <div className="offerings-note">
          <p className="note">
            Nothing here is graded. Nobody is reading over your shoulder. The only audience is the
            light.
          </p>
          <Link to="/about#privacy" className="tiny-label">
            Read the data promise
          </Link>
        </div>
      </aside>
    </div>
  )
}

function EngineCard({
  selected,
  disabled,
  icon,
  title,
  description,
  badge,
  onSelect,
  children,
}: {
  selected: boolean
  disabled?: boolean
  icon: ReactNode
  title: string
  description: string
  badge: string
  onSelect: () => void
  children?: ReactNode
}) {
  return (
    <div className={cx('engine', selected && 'is-selected', disabled && 'is-disabled')}>
      <button
        type="button"
        className="engine-main"
        onClick={onSelect}
        disabled={disabled}
        aria-pressed={selected}
      >
        <span className="engine-icon">{icon}</span>
        <span className="engine-copy">
          <b>{title}</b>
          <small>{description}</small>
        </span>
        <span className="engine-badge mono">{badge}</span>
      </button>
      {children}
    </div>
  )
}

function WeaveStep({
  draft,
  onSaved,
  onEdit,
  onTone,
}: {
  draft: Ofrenda
  onSaved: (next: Ofrenda) => void
  onEdit: () => void
  onTone: (tone: Tone) => void
}) {
  const model = useModel()
  const [busy, setBusy] = useState(false)
  const [stream, setStream] = useState('')
  const [error, setError] = useState<string | null>(null)
  const streamRef = useRef<HTMLPreElement>(null)

  const answered = draft.entries.filter((entry) => !entry.skipped && entry.answer.trim())
  const skipped = draft.entries.filter((entry) => entry.skipped).length
  const enough = hasEnoughToWeave(draft)
  const selected = model.preference
  const gemmaReady = model.gemma.status === 'ready'
  const gemmaUnavailable = model.webgpu === 'no'
  const ollamaReady = model.ollama.status === 'found' && Boolean(model.ollama.model)

  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight
    }
  }, [stream])

  const selectEngine = (engine: EngineKind) => {
    if (busy) return
    model.setPreference(engine)
    setError(null)
  }

  const run = async (override?: EngineKind) => {
    if (busy) return
    if (!enough) {
      setError('Keep at least one memory of four words or more, then the Keeper can write.')
      return
    }
    const engine = override ?? model.preference
    if (engine === 'gemma' && gemmaUnavailable) {
      setError('WebGPU is not available in this browser. Candle mode needs no model.')
      return
    }
    if (engine === 'ollama' && !ollamaReady) {
      setError('Scan for a local Ollama model first.')
      return
    }

    setBusy(true)
    setError(null)
    setStream('')

    if (engine === 'gemma' && !gemmaReady) {
      const lit = await model.lightGemma()
      if (!lit) {
        setBusy(false)
        return
      }
    }

    try {
      const remembrance = await weaveRemembrance({
        ofrenda: draft,
        engine,
        ollamaModel: model.ollama.model,
        onChunk: setStream,
      })
      const next: Ofrenda = {
        ...draft,
        remembrance,
        updatedAt: nowIso(),
      }
      onSaved(next)
    } catch (err) {
      setBusy(false)
      setError(
        err instanceof Error && err.message
          ? err.message
          : 'The Keeper lost the thread. Try again, or use candle mode.',
      )
    }
  }

  const primaryLabel = busy
    ? selected === 'gemma' && model.gemma.status === 'loading'
      ? `Lighting the candle · ${Math.round(model.gemma.progress * 100)}%`
      : selected === 'candle'
        ? 'Arranging your words…'
        : 'The Keeper is writing…'
    : selected === 'gemma' && !gemmaReady
      ? gemmaUnavailable
        ? 'WebGPU unavailable'
        : `Summon Gemma & weave · ${GEMMA_SIZE_LABEL}`
      : selected === 'ollama' && !ollamaReady
        ? 'Scan for Ollama first'
        : selected === 'candle'
          ? 'Weave from my words'
          : selected === 'gemma'
            ? 'Weave the remembrance'
            : 'Weave with Ollama'

  const primaryDisabled =
    busy ||
    !enough ||
    (selected === 'gemma' && gemmaUnavailable) ||
    (selected === 'ollama' && !ollamaReady)

  return (
    <div className="wrap weave-page">
      <div className="weave-head">
        <button type="button" className="btn btn-quiet btn-sm weave-back" onClick={onEdit}>
          <ArrowLeft size={14} /> The memories
        </button>
        <p className="eyebrow">The weave</p>
        <h1 className="display">
          {answered.length} {answered.length === 1 ? 'memory' : 'memories'}. One candle.
        </h1>
        <p className="lede">
          The Keeper will write a short remembrance from what you kept, then light the ofrenda.
          {skipped > 0
            ? ` You set aside ${pluralize(skipped, 'question')}; the room will hold the rest.`
            : ''}
        </p>
      </div>

      <div className="weave-grid">
        <section className="panel panel-pad engine-panel">
          <div className="panel-head">
            <div>
              <span className="field-label">Choose the candle</span>
              <h2 className="display">Who writes it?</h2>
            </div>
            <span className="chip">
              <Lock size={10} /> On device
            </span>
          </div>

          <div className="engine-list" role="group" aria-label="Writing engine">
            <EngineCard
              selected={selected === 'gemma'}
              disabled={busy || gemmaUnavailable}
              icon={<Cpu size={18} />}
              title={GEMMA_LABEL}
              description={`Google’s open-weight model, inside this tab through WebGPU. The first run downloads ${GEMMA_SIZE_LABEL} once.`}
              badge={gemmaReady ? 'Ready' : gemmaUnavailable ? 'Unavailable' : 'Recommended'}
              onSelect={() => selectEngine('gemma')}
            >
              <div className="engine-detail" aria-live="polite">
                {model.webgpu === 'checking' && (
                  <p className="field-help">Checking for WebGPU on this device…</p>
                )}
                {gemmaUnavailable && (
                  <p className="field-help">
                    This browser doesn’t expose WebGPU. Candle mode works everywhere.
                  </p>
                )}
                {model.gemma.status === 'loading' && (
                  <>
                    <div className="progress-label">
                      <span>First light</span>
                      <span>{Math.round(model.gemma.progress * 100)}%</span>
                    </div>
                    <div className="progress">
                      <span style={{ width: `${Math.max(2, model.gemma.progress * 100)}%` }} />
                    </div>
                    <p className="field-help">
                      {model.gemma.message || 'Downloading the open weights. This can take a minute.'}
                    </p>
                  </>
                )}
                {model.gemma.status === 'error' && (
                  <p className="field-help error">
                    {model.gemma.error || 'The model could not start.'}
                  </p>
                )}
                {gemmaReady && (
                  <p className="field-help">
                    Lit on this device. From here, it works with the Wi‑Fi off.
                  </p>
                )}
                {!gemmaReady &&
                  model.gemma.status === 'idle' &&
                  !gemmaUnavailable &&
                  model.webgpu !== 'checking' && (
                    <p className="field-help">
                      The download is one-time. Your words never leave this tab; the model file
                      comes from an open CDN.
                    </p>
                  )}
              </div>
            </EngineCard>

            <EngineCard
              selected={selected === 'candle'}
              disabled={busy}
              icon={<Flame size={18} />}
              title="Candle mode"
              description="No model, no wait. Arranges your own sentences into the remembrance."
              badge="Instant"
              onSelect={() => selectEngine('candle')}
            >
              <div className="engine-detail">
                <p className="field-help">
                  Candle mode does not rewrite or invent. It is your words, in your order, with a
                  frame around them.
                </p>
              </div>
            </EngineCard>

            <EngineCard
              selected={selected === 'ollama'}
              disabled={busy}
              icon={<Server size={18} />}
              title="Ollama"
              description="Already running a local Ollama? Use any open model you have pulled."
              badge={ollamaReady ? model.ollama.model ?? 'Found' : 'Optional'}
              onSelect={() => selectEngine('ollama')}
            >
              <div className="engine-detail">
                {model.ollama.status === 'checking' ? (
                  <p className="field-help">
                    <Loader2 size={12} className="spin" /> Looking for a local server…
                  </p>
                ) : ollamaReady ? (
                  <p className="field-help">
                    Found {pluralize(model.ollama.models.length, 'model')}. Using{' '}
                    <b>{model.ollama.model}</b>.
                  </p>
                ) : model.ollama.status === 'missing' ? (
                  <p className="field-help">
                    No local server answered. Start Ollama, then scan again. On many setups it needs
                    {' '}
                    <code>OLLAMA_ORIGINS=*</code>.
                  </p>
                ) : (
                  <p className="field-help">A server on this machine, not a cloud.</p>
                )}
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => void model.scanOllama()}
                  disabled={busy || model.ollama.status === 'checking'}
                >
                  <ScanLine size={13} />
                  {model.ollama.status === 'checking' ? 'Scanning…' : 'Scan for Ollama'}
                </button>
                <Link to="/about#ollama" className="link engine-help-link">
                  How to connect a local model
                </Link>
              </div>
            </EngineCard>
          </div>

          <p className="note engine-note">
            Gemma is open-weight, not closed API. You can swap it, read the prompts, or use candle
            mode forever without downloading anything.
          </p>
        </section>

        <aside className="panel panel-pad weave-side">
          <div className="weave-person">
            <Portrait person={draft.person} size="md" />
            <div>
              <h2 className="display">{draft.person.name}</h2>
              <p className="mono weave-sub">
                {[draft.person.relation, draft.person.years].filter(Boolean).join(' · ') ||
                  'A light'}
              </p>
              <p className="tiny-label">Started {formatDate(draft.createdAt)}</p>
            </div>
          </div>

          <ul className="weave-artifacts">
            {draft.entries
              .filter((entry) => entry.artifact && !entry.skipped)
              .map((entry) => (
                <li key={entry.id}>
                  <span className="mono">{entry.artifact?.kind}</span>
                  {entry.artifact?.label}
                </li>
              ))}
          </ul>

          <div className="weave-tone">
            <span className="field-label">The tone</span>
            <div className="seg">
              {TONES.map((tone) => (
                <button
                  key={tone.id}
                  type="button"
                  aria-pressed={draft.tone === tone.id}
                  onClick={() => onTone(tone.id)}
                >
                  {tone.label}
                </button>
              ))}
            </div>
            <p className="field-help">
              {TONES.find((tone) => tone.id === draft.tone)?.hint}
            </p>
          </div>

          <div className="weave-cta">
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => void run()}
              disabled={primaryDisabled}
            >
              {primaryLabel} <Flame size={15} />
            </button>
            {selected !== 'candle' && (
              <button
                type="button"
                className="btn btn-quiet btn-sm"
                onClick={() => {
                  model.setPreference('candle')
                  void run('candle')
                }}
                disabled={busy}
              >
                Use candle mode instead
              </button>
            )}
          </div>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          {draft.remembrance && (
            <p className="note weave-replace">
              Weaving again replaces the remembrance already on the altar.
            </p>
          )}

          <p className="tiny-label weave-privacy">
            Grounded in {pluralize(answered.length, 'memory', 'memories')} · Nothing uploaded
          </p>
        </aside>
      </div>

      {busy && (
        <section className="weaving-panel" aria-live="polite">
          <div className="weaving-head">
            <div className="flame-loader" />
            <div>
              <span className="field-label">The Keeper is writing</span>
              <p className="mono">
                {selected === 'gemma' ? `${GEMMA_LABEL} · on this device` : selected === 'ollama' ? `Ollama · ${model.ollama.model ?? ''}` : 'Candle mode · your words'}
              </p>
            </div>
            <span className="chip chip-amber">
              <Lock size={10} /> No upload
            </span>
          </div>
          {selected === 'gemma' && model.gemma.status === 'loading' ? (
            <div className="weaving-loading">
              <div className="progress-label">
                <span>{model.gemma.message || 'Downloading the open weights'}</span>
                <span>{Math.round(model.gemma.progress * 100)}%</span>
              </div>
              <div className="progress">
                <span style={{ width: `${Math.max(2, model.gemma.progress * 100)}%` }} />
              </div>
              <p className="field-help">
                One-time download, cached by this browser. When it is done, the candle stays lit
                offline.
              </p>
            </div>
          ) : (
            <pre className="weaving-stream" ref={streamRef}>
              {stream || 'Listening for the first line…'}
              <span className="caret" aria-hidden="true" />
            </pre>
          )}
          <p className="tiny-label">
            Written here, in this tab. The words appear as they are made.
          </p>
        </section>
      )}
    </div>
  )
}

function MissingArchive() {
  return (
    <div className="wrap studio-message">
      <p className="eyebrow">The archive</p>
      <h1 className="display">This light isn’t in this browser.</h1>
      <p className="lede">
        The archive may have been deleted, or it lives in a different browser. Ghostlight never
        keeps a copy on a server.
      </p>
      <div className="studio-message-actions">
        <Link to="/studio" className="btn btn-primary">
          Begin a new archive
        </Link>
        <Link to="/archive" className="btn btn-ghost">
          Open the archive
        </Link>
      </div>
    </div>
  )
}

function DemoNotice({ draft, onStart }: { draft: Ofrenda; onStart: () => void }) {
  return (
    <div className="wrap studio-message">
      <p className="eyebrow">The demo archive</p>
      <h1 className="display">This light belongs to Ruma.</h1>
      <p className="lede">
        The demo is here to show the finished room. Start your own archive to work with the Keeper;
        it will stay in this browser and leave the demo untouched.
      </p>
      <div className="studio-message-actions">
        <Link to={`/ofrenda/${draft.id}`} className="btn btn-primary">
          Walk through the demo
        </Link>
        <button type="button" className="btn btn-ghost" onClick={onStart}>
          Start my own
        </button>
      </div>
    </div>
  )
}

export default function Studio() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const step = params.get('step')
  const { getOfrenda, saveOfrenda } = useArchive()
  const navigate = useNavigate()

  const initialRef = useRef<{
    draft: Ofrenda | null
    stage: Stage
    index: number
    answer: string
  } | null>(null)

  if (initialRef.current === null) {
    const found = id ? getOfrenda(id) : undefined
    const firstOpen = found
      ? found.entries.findIndex((entry) => !entry.answer.trim() && !entry.skipped)
      : -1
    let stage: Stage = 'setup'
    let index = 0
    if (found) {
      if (step === 'edit') {
        stage = 'chapter'
      } else if (step === 'weave' || firstOpen === -1) {
        stage = 'weave'
      } else {
        stage = 'chapter'
        index = Math.max(0, firstOpen)
      }
    }
    initialRef.current = {
      draft: found ?? null,
      stage,
      index,
      answer: found?.entries[index]?.answer ?? '',
    }
  }

  const initial = initialRef.current
  const [draft, setDraft] = useState<Ofrenda | null>(initial.draft)
  const [stage, setStage] = useState<Stage>(initial.stage)
  const [chapterIndex, setChapterIndex] = useState(initial.index)
  const [answer, setAnswer] = useState(initial.answer)
  const [missing, setMissing] = useState(Boolean(id) && !initial.draft)

  useEffect(() => {
    if (!id) return
    if (draft?.id === id) {
      setMissing(false)
      return
    }
    const found = getOfrenda(id)
    if (!found) {
      setMissing(true)
      return
    }
    setMissing(false)
    setDraft(found)
    const firstOpen = found.entries.findIndex((entry) => !entry.answer.trim() && !entry.skipped)
    const nextStage: Stage =
      step === 'edit' ? 'chapter' : step === 'weave' || firstOpen === -1 ? 'weave' : 'chapter'
    setStage(nextStage)
    const index = nextStage === 'chapter' ? (step === 'edit' ? 0 : Math.max(0, firstOpen)) : 0
    setChapterIndex(index)
    setAnswer(found.entries[index]?.answer ?? '')
  }, [id, draft?.id, getOfrenda, step])

  const commit = (next: Ofrenda) => {
    setDraft(next)
    saveOfrenda(next)
  }

  const saveAnswer = (): Ofrenda | null => {
    if (!draft) return null
    const chapter = CHAPTERS[chapterIndex]
    if (!chapter) return draft
    const value = answer.trim()
    if (!value) return draft
    const existing = draft.entries.find((entry) => entry.id === chapter.id)
    if (existing?.answer === value && !existing.skipped) return draft
    const entry: Entry = {
      id: chapter.id,
      answer: value.slice(0, 4000),
      skipped: false,
      artifact: extractArtifact(value, chapter),
      updatedAt: nowIso(),
    }
    const next: Ofrenda = {
      ...draft,
      entries: draft.entries.map((item) => (item.id === chapter.id ? entry : item)),
      updatedAt: nowIso(),
    }
    commit(next)
    return next
  }

  const goTo = (index: number) => {
    if (!draft) return
    let next = draft
    if (answer.trim()) next = saveAnswer() ?? draft
    const clamped = Math.max(0, Math.min(CHAPTERS.length - 1, index))
    setChapterIndex(clamped)
    setAnswer(next.entries[clamped]?.answer ?? '')
  }

  const handleContinue = () => {
    if (!draft || !answer.trim()) return
    const next = saveAnswer() ?? draft
    if (chapterIndex < CHAPTERS.length - 1) {
      const index = chapterIndex + 1
      setChapterIndex(index)
      setAnswer(next.entries[index]?.answer ?? '')
    } else {
      setStage('weave')
    }
  }

  const handleSkip = () => {
    if (!draft) return
    const chapter = CHAPTERS[chapterIndex]
    if (!chapter) return
    const existing = draft.entries.find((entry) => entry.id === chapter.id)
    const entry: Entry = {
      id: chapter.id,
      answer: answer.trim() || existing?.answer || '',
      skipped: true,
      artifact: null,
      updatedAt: nowIso(),
    }
    const next: Ofrenda = {
      ...draft,
      entries: draft.entries.map((item) => (item.id === chapter.id ? entry : item)),
      updatedAt: nowIso(),
    }
    commit(next)
    if (chapterIndex < CHAPTERS.length - 1) {
      const index = chapterIndex + 1
      setChapterIndex(index)
      setAnswer(next.entries[index]?.answer ?? '')
    } else {
      setStage('weave')
    }
  }

  const handleReview = () => {
    if (!draft) return
    if (answer.trim()) saveAnswer()
    setStage('weave')
  }

  const handleStart = (person: Person) => {
    const existing = draft && !draft.isDemo ? draft : null
    if (existing) {
      const next: Ofrenda = { ...existing, person, updatedAt: nowIso() }
      commit(next)
      setStage('chapter')
      const index = Math.min(chapterIndex, CHAPTERS.length - 1)
      setChapterIndex(index)
      setAnswer(next.entries[index]?.answer ?? '')
      return
    }
    const created = createBlankOfrenda(person)
    commit(created)
    navigate(`/studio/${created.id}`, { replace: true })
    setStage('chapter')
    setChapterIndex(0)
    setAnswer('')
  }

  const handleSaved = (next: Ofrenda) => {
    commit(next)
    navigate(`/ofrenda/${next.id}`)
  }

  if (missing && id && !draft) {
    return <MissingArchive />
  }

  if (draft?.isDemo) {
    return (
      <DemoNotice
        draft={draft}
        onStart={() => {
          setDraft(null)
          setStage('setup')
          setMissing(false)
          navigate('/studio', { replace: true })
        }}
      />
    )
  }

  if (stage === 'chapter' && draft) {
    return (
      <ChapterStep
        draft={draft}
        chapterIndex={chapterIndex}
        answer={answer}
        onAnswer={setAnswer}
        onContinue={handleContinue}
        onSkip={handleSkip}
        onGoTo={goTo}
        onReview={handleReview}
        onSetup={() => setStage('setup')}
      />
    )
  }

  if (stage === 'weave' && draft) {
    return (
      <WeaveStep
        draft={draft}
        onSaved={handleSaved}
        onEdit={() => {
          setStage('chapter')
          setChapterIndex(0)
          setAnswer(draft.entries[0]?.answer ?? '')
        }}
        onTone={(tone: Tone) => commit({ ...draft, tone, updatedAt: nowIso() })}
      />
    )
  }

  return (
    <Setup
      draft={draft}
      onStart={handleStart}
      onCancel={draft ? () => setStage('chapter') : undefined}
    />
  )
}
