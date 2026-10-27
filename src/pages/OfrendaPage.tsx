import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Download,
  FileJson,
  Flame,
  Loader2,
  Lock,
  Pencil,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { AskPanel } from '../components/AskPanel'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Marigold } from '../components/Marigold'
import { MemoryDialog } from '../components/MemoryDialog'
import { OfrendaScene } from '../components/OfrendaScene'
import { CHAPTERS } from '../data/chapters'
import { DEMO_ID } from '../data/demo'
import { useArchive } from '../lib/archive'
import { buildKeepsakeHtml } from '../lib/keepsake'
import type { ChapterId, Ofrenda } from '../types'
import { downloadFile, formatDate, pluralize, slugify } from '../lib/utils'

const LEGEND = [
  {
    title: 'The portrait',
    copy: 'The person, as you remember them.',
  },
  {
    title: 'Six candles',
    copy: 'One for each memory. The lit ones hold words. Click one to read it.',
  },
  {
    title: 'Cempasúchil',
    copy: 'Marigolds, whose scent is said to guide the dead home.',
  },
  {
    title: 'Water',
    copy: 'A glass for the thirst of the journey.',
  },
  {
    title: 'The offerings',
    copy: 'The tastes, songs, places and objects hiding in your answers.',
  },
  {
    title: 'Papel picado',
    copy: 'Cut paper for the wind, and for how thin the veil can get.',
  },
]

function sourceLabel(ofrenda: Ofrenda): string {
  const remembrance = ofrenda.remembrance
  if (!remembrance) return 'Not yet written'
  if (remembrance.source === 'gemma') return 'Gemma 2 · 2B'
  if (remembrance.source === 'ollama') return remembrance.modelLabel ?? 'Ollama'
  if (remembrance.source === 'demo') return 'Written for the demo'
  return 'Your own words, arranged'
}

function sourceShort(ofrenda: Ofrenda): string {
  const remembrance = ofrenda.remembrance
  if (!remembrance) return '—'
  if (remembrance.source === 'gemma') return 'Gemma'
  if (remembrance.source === 'ollama') return 'Ollama'
  if (remembrance.source === 'demo') return 'The builders'
  return 'You'
}

function MissingOfrenda({ demo }: { demo: boolean }) {
  const { restoreDemo } = useArchive()
  return (
    <div className="wrap ofrenda-missing">
      <p className="eyebrow">The archive</p>
      <h1 className="display">
        {demo ? 'The demo isn’t in this browser.' : 'This light isn’t here.'}
      </h1>
      <p className="lede">
        {demo
          ? 'The demo archive can be restored. It is fictional, and it never leaves this browser.'
          : 'The archive may have been deleted, or it lives in a different browser. Ghostlight keeps no copy on a server.'}
      </p>
      <div className="ofrenda-missing-actions">
        {demo && (
          <button type="button" className="btn btn-primary" onClick={restoreDemo}>
            <Flame size={15} /> Restore the demo
          </button>
        )}
        <Link to="/studio" className="btn btn-ghost">
          Begin a new archive
        </Link>
        <Link to="/archive" className="btn btn-quiet">
          Open the archive
        </Link>
      </div>
    </div>
  )
}

export default function OfrendaPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getOfrenda, deleteOfrenda, exportOne } = useArchive()
  const [memoryId, setMemoryId] = useState<ChapterId | null>(null)
  const [highlight, setHighlight] = useState<ChapterId | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [keepsakeBusy, setKeepsakeBusy] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | null>(null)

  const ofrenda = id ? getOfrenda(id) : undefined

  useEffect(() => {
    if (!ofrenda) {
      document.title = 'Ghostlight'
      return
    }
    document.title = `${ofrenda.person.name} — Ghostlight`
    return () => {
      document.title = 'Ghostlight — keep a light on for the stories that made you'
    }
  }, [ofrenda])

  useEffect(
    () => () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current)
    },
    [],
  )

  const notify = (message: string) => {
    setToast(message)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 4200)
  }

  if (!ofrenda) {
    return (
      <MissingOfrenda demo={id === DEMO_ID} />
    )
  }

  const demo = Boolean(ofrenda.isDemo)
  const answeredEntries = ofrenda.entries.filter(
    (entry) => !entry.skipped && entry.answer.trim(),
  )
  const remembrance = ofrenda.remembrance
  const paragraphs = remembrance?.body.split(/\n{2,}/).filter(Boolean) ?? []
  const source = sourceLabel(ofrenda)
  const author = sourceShort(ofrenda)

  const openMemory = (chapter: ChapterId) => {
    setMemoryId(chapter)
    setHighlight(chapter)
  }

  const closeMemory = () => {
    setMemoryId(null)
    setHighlight(null)
  }

  const moveMemory = (direction: 'prev' | 'next') => {
    if (!memoryId) return
    const current = CHAPTERS.findIndex((chapter) => chapter.id === memoryId)
    const delta = direction === 'next' ? 1 : -1
    const next = CHAPTERS[(current + delta + CHAPTERS.length) % CHAPTERS.length]
    setMemoryId(next.id)
    setHighlight(next.id)
  }

  const handleKeepsake = async () => {
    if (!ofrenda.remembrance || keepsakeBusy) return
    setKeepsakeBusy(true)
    try {
      const html = await buildKeepsakeHtml(ofrenda)
      downloadFile(
        `ghostlight-${slugify(ofrenda.person.name)}-keepsake.html`,
        html,
        'text/html',
      )
      notify('Keepsake saved. It works without the internet.')
    } catch {
      notify('The keepsake could not be made. Try exporting the archive instead.')
    } finally {
      setKeepsakeBusy(false)
    }
  }

  const handleJson = () => {
    exportOne(ofrenda.id)
    notify('Archive exported as JSON.')
  }

  const handleDelete = () => {
    deleteOfrenda(ofrenda.id)
    navigate('/archive', { replace: true })
  }

  return (
    <>
      <div className="ofrenda-page">
        <header className="ofrenda-hero">
          <div className="wrap">
            <div className="ofrenda-topline">
              <Link to="/archive" className="ofrenda-back mono">
                <ArrowLeft size={13} /> The archive
              </Link>
              <span className="ofrenda-local mono">
                <span className="status-dot is-live" /> Local archive · {formatDate(ofrenda.createdAt)}
              </span>
              <div className="ofrenda-actions">
                {!demo && (
                  <Link to={`/studio/${ofrenda.id}?step=edit`} className="btn btn-ghost btn-sm">
                    <Pencil size={13} /> Edit memories
                  </Link>
                )}
                {!demo && remembrance && (
                  <Link
                    to={`/studio/${ofrenda.id}?step=weave`}
                    className="btn btn-ghost btn-sm"
                  >
                    <Sparkles size={13} /> Retell
                  </Link>
                )}
                {!remembrance && (
                  <Link to={`/studio/${ofrenda.id}`} className="btn btn-ghost btn-sm">
                    Continue in the studio <ArrowRight size={13} />
                  </Link>
                )}
                {remembrance && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => void handleKeepsake()}
                    disabled={keepsakeBusy}
                  >
                    {keepsakeBusy ? (
                      <Loader2 size={13} className="spin" />
                    ) : (
                      <Download size={13} />
                    )}
                    {keepsakeBusy ? 'Preparing…' : 'Keep this · HTML'}
                  </button>
                )}
                {demo && <span className="chip chip-amber">Demo · fictional</span>}
              </div>
            </div>

            <div className="ofrenda-title-row">
              <div className="ofrenda-identity">
                <p className="eyebrow">A local-first remembrance · Ofrenda</p>
                <h1 className="display ofrenda-name">{ofrenda.person.name}</h1>
                <p className="ofrenda-life mono">
                  {[ofrenda.person.years, ofrenda.person.relation].filter(Boolean).join(' · ')}
                </p>
              </div>
              <div className="ofrenda-stats">
                <div>
                  <b>{answeredEntries.length}</b>
                  <span>{answeredEntries.length === 1 ? 'memory' : 'memories'}</span>
                </div>
                <div>
                  <b>{author}</b>
                  <span>written by</span>
                </div>
                <div>
                  <b>0 KB</b>
                  <span>uploaded</span>
                </div>
              </div>
            </div>

            {remembrance?.epitaph && (
              <p className="ofrenda-epitaph display">“{remembrance.epitaph}”</p>
            )}

            {demo && (
              <p className="demo-note tiny-label">
                A fictional archive: the portrait is generated and the memories were written by
                the builders. Yours never leaves this browser.
              </p>
            )}
          </div>
        </header>

        <OfrendaScene ofrenda={ofrenda} onOpenMemory={openMemory} highlight={highlight} />

        <section className="altar-legend">
          <div className="wrap">
            <div className="legend-head">
              <div>
                <p className="eyebrow">Read the altar</p>
                <h2 className="display">An ofrenda is a table set for the people who can’t come to dinner.</h2>
              </div>
              <p className="legend-copy">
                These are the pieces of this one. Nothing here is decoration for its own sake; each
                thing has a job.
              </p>
            </div>
            <ol className="legend-grid">
              {LEGEND.map((item, i) => (
                <li key={item.title}>
                  <span className="mono">0{i + 1}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.copy}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="reading-section" id="remembrance">
          <div className="wrap reading-grid">
            <aside className="reading-aside">
              <p className="eyebrow">The remembrance</p>
              <div className="reading-meta">
                <div>
                  <span className="tiny-label">Written</span>
                  <b>{remembrance ? formatDate(remembrance.createdAt) : '—'}</b>
                </div>
                <div>
                  <span className="tiny-label">Source</span>
                  <b>{source}</b>
                </div>
                <div>
                  <span className="tiny-label">Kept</span>
                  <b>{pluralize(answeredEntries.length, 'memory', 'memories')}</b>
                </div>
              </div>
              <p className="reading-note note">
                Read it slowly. It will not change unless you ask it to.
              </p>
              {remembrance && remembrance.source === 'demo' && (
                <p className="reading-note note">
                  This one was written by the builders, not by a model. It is the shape the Keeper
                  aims for.
                </p>
              )}
              {remembrance && (remembrance.source === 'gemma' || remembrance.source === 'ollama') && (
                <p className="reading-note note">
                  Written by {source}. Small models can reach; the six memories you kept are the
                  source of truth. If a line feels invented, retell with candle mode.
                </p>
              )}
            </aside>

            <article className="reading-main">
              {remembrance ? (
                <>
                  <h2 className="display reading-title">{remembrance.title}</h2>
                  <p className="reading-epitaph">“{remembrance.epitaph}”</p>
                  <div className="reading-body">
                    {paragraphs.map((paragraph, paragraphIndex) => (
                      <p key={paragraphIndex}>{paragraph}</p>
                    ))}
                  </div>
                  <div className="reading-footer">
                    <span className="chip">
                      <Flame size={11} />{' '}
                      {remembrance.source === 'demo'
                        ? 'Demo archive'
                        : remembrance.source === 'gemma'
                          ? 'Gemma 2 · 2B'
                          : remembrance.source === 'ollama'
                            ? remembrance.modelLabel ?? 'Ollama'
                            : 'Candle mode'}
                    </span>
                    <span className="mono reading-latency">
                      {remembrance.latencyMs
                        ? `${(remembrance.latencyMs / 1000).toFixed(1)}s on this device`
                        : remembrance.source === 'demo'
                          ? 'written by the builders'
                          : remembrance.source === 'candle'
                            ? 'your own words, arranged'
                            : 'written on this device'}
                    </span>
                    <span className="mono reading-latency">
                      <Lock size={10} /> not uploaded
                    </span>
                  </div>
                  {!demo && (
                    <div className="reading-actions">
                      <Link
                        to={`/studio/${ofrenda.id}?step=weave`}
                        className="btn btn-ghost btn-sm"
                      >
                        <Sparkles size={13} /> Retell with another tone
                      </Link>
                      <Link
                        to={`/studio/${ofrenda.id}?step=edit`}
                        className="btn btn-quiet btn-sm"
                      >
                        <Pencil size={13} /> Edit a memory
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <div className="reading-empty">
                  <p className="eyebrow">The remembrance</p>
                  <h2 className="display">The words are not written yet.</h2>
                  <p className="lede">
                    You have kept {pluralize(answeredEntries.length, 'memory', 'memories')}. When
                    you are ready, the Keeper can write the short portrait and light the room.
                  </p>
                  <Link
                    to={`/studio/${ofrenda.id}${answeredEntries.length > 0 ? '?step=weave' : ''}`}
                    className="btn btn-primary"
                  >
                    <Flame size={15} />{' '}
                    {answeredEntries.length > 0 ? 'Go to the weave' : 'Continue the ritual'}
                  </Link>
                </div>
              )}
            </article>
          </div>
        </section>

        <AskPanel ofrenda={ofrenda} onCitation={openMemory} />

        <section className="keepsake-section" id="keep">
          <div className="wrap">
            <div className="keepsake-panel">
              <div className="keepsake-copy">
                <p className="eyebrow">Take it with you</p>
                <h2 className="display">A file that outlives the tab.</h2>
                <p className="lede">
                  One HTML file: the portrait, the remembrance, every memory, the offerings. It
                  opens without an internet connection, needs no app, and contains no scripts.
                </p>
                <div className="keepsake-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => void handleKeepsake()}
                    disabled={!remembrance || keepsakeBusy}
                  >
                    {keepsakeBusy ? <Loader2 size={15} className="spin" /> : <Download size={15} />}
                    {keepsakeBusy ? 'Preparing the file…' : 'Download the keepsake'}
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={handleJson}>
                    <FileJson size={15} /> Export the archive
                  </button>
                </div>
                {!remembrance && (
                  <p className="tiny-label">
                    The keepsake becomes available once the remembrance is written.
                  </p>
                )}
                <p className="tiny-label">Your file · no DRM · no account</p>
              </div>

              <aside className="provenance">
                <h3 className="mono">Provenance</h3>
                <dl>
                  <div>
                    <dt>Memories</dt>
                    <dd>
                      {answeredEntries.length} / {CHAPTERS.length}
                    </dd>
                  </div>
                  <div>
                    <dt>Written by</dt>
                    <dd>{author}</dd>
                  </div>
                  <div>
                    <dt>Kept in</dt>
                    <dd>This browser · IndexedDB</dd>
                  </div>
                  <div>
                    <dt>Uploaded</dt>
                    <dd>0 bytes</dd>
                  </div>
                  <div>
                    <dt>Created</dt>
                    <dd>{formatDate(ofrenda.createdAt)}</dd>
                  </div>
                  <div>
                    <dt>Updated</dt>
                    <dd>{formatDate(ofrenda.updatedAt)}</dd>
                  </div>
                </dl>

                {demo ? (
                  <div className="provenance-demo">
                    <Marigold size={22} />
                    <p>
                      This is a fictional demo. The light is yours to make.{' '}
                      <Link to="/studio">Start your own archive →</Link>
                    </p>
                  </div>
                ) : (
                  <div className="danger-zone">
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => setDeleteOpen(true)}
                    >
                      <Trash2 size={13} /> Delete this ofrenda
                    </button>
                    <p>Deletes it from this browser only. Export it first if it matters.</p>
                  </div>
                )}
              </aside>
            </div>
          </div>
        </section>
      </div>

      {memoryId && (
        <MemoryDialog
          ofrenda={ofrenda}
          chapterId={memoryId}
          onClose={closeMemory}
          onNavigate={moveMemory}
          canEdit={!demo}
        />
      )}

      {deleteOpen && (
        <ConfirmDialog
          title="Let this light go?"
          body="This removes the archive, the photograph and the remembrance from this browser. It cannot be undone unless you exported a copy."
          confirmLabel="Delete it"
          onCancel={() => setDeleteOpen(false)}
          onConfirm={handleDelete}
        />
      )}

      {toast && (
        <div className="toast" role="status">
          <Flame size={15} />
          {toast}
        </div>
      )}
    </>
  )
}
