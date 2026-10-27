import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Download,
  Flame,
  FolderOpen,
  Lock,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
} from 'lucide-react'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Marigold } from '../components/Marigold'
import { Portrait } from '../components/Portrait'
import { CHAPTERS } from '../data/chapters'
import { useArchive } from '../lib/archive'
import type { Ofrenda } from '../types'
import {
  cx,
  formatDate,
  pluralize,
  readFileAsText,
} from '../lib/utils'

function memoryCount(ofrenda: Ofrenda): number {
  return ofrenda.entries.filter((entry) => !entry.skipped && entry.answer.trim()).length
}

function sourceBadge(ofrenda: Ofrenda): string {
  const source = ofrenda.remembrance?.source
  if (!source) return 'In progress'
  if (source === 'gemma') return 'Gemma'
  if (source === 'ollama') return 'Ollama'
  if (source === 'demo') return 'Demo · fictional'
  return 'Candle mode'
}

export default function ArchivePage() {
  const { ofrendas, exportAll, exportOne, importFromJson, deleteOfrenda, restoreDemo } =
    useArchive()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const toastTimer = useRef<number | null>(null)

  useEffect(() => {
    document.title = 'The archive — Ghostlight'
    return () => {
      document.title = 'Ghostlight — keep a light on for the stories that made you'
      if (toastTimer.current) window.clearTimeout(toastTimer.current)
    }
  }, [])

  const notify = (message: string) => {
    setToast(message)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 4200)
  }

  const sorted = [...ofrendas].sort((a, b) => {
    if (a.isDemo !== b.isDemo) return a.isDemo ? 1 : -1
    return b.updatedAt.localeCompare(a.updatedAt)
  })
  const totalMemories = ofrendas.reduce((sum, ofrenda) => sum + memoryCount(ofrenda), 0)
  const complete = ofrendas.filter((ofrenda) => ofrenda.remembrance).length
  const hasDemo = ofrendas.some((ofrenda) => ofrenda.isDemo)

  const handleImport = async (file: File | undefined) => {
    if (!file) return
    if (file.size > 8_000_000) {
      notify('That file is larger than 8 MB. Is it a Ghostlight archive?')
      return
    }
    try {
      const text = await readFileAsText(file)
      const result = importFromJson(text)
      notify(
        result.ok
          ? `Imported ${pluralize(result.count, 'ofrenda')}.`
          : result.error ?? 'That archive could not be read.',
      )
    } catch {
      notify('That file could not be read.')
    }
  }

  const handleDelete = () => {
    if (!deleteId) return
    deleteOfrenda(deleteId)
    setDeleteId(null)
    notify('The archive was deleted from this browser.')
  }

  const deleting = ofrendas.find((ofrenda) => ofrenda.id === deleteId)

  return (
    <>
      <div className="archive-page">
        <header className="archive-hero">
          <div className="wrap">
            <div className="archive-head">
              <div>
                <p className="eyebrow">The archive</p>
                <h1 className="display">
                  The lights <em>you’ve kept.</em>
                </h1>
                <p className="lede">
                  Every ofrenda in this browser, in one room. No accounts, no cloud, no expiry
                  date. Take a copy with you whenever you like.
                </p>
              </div>
              <div className="archive-hero-actions">
                <Link to="/studio" className="btn btn-primary">
                  <Plus size={15} /> New ofrenda
                </Link>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload size={15} /> Import
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/json,.json"
                  className="sr-only"
                  onChange={(event) => {
                    void handleImport(event.target.files?.[0])
                    event.target.value = ''
                  }}
                />
              </div>
            </div>

            <div className="archive-stats">
              <div>
                <b>{ofrendas.length}</b>
                <span>{ofrendas.length === 1 ? 'ofrenda' : 'ofrendas'}</span>
              </div>
              <div>
                <b>{totalMemories}</b>
                <span>{totalMemories === 1 ? 'memory' : 'memories'}</span>
              </div>
              <div>
                <b>{complete}</b>
                <span>{complete === 1 ? 'story' : 'stories'}</span>
              </div>
              <div>
                <b>0 KB</b>
                <span>uploaded</span>
              </div>
            </div>
          </div>
        </header>

        <section className="wrap archive-room">
          <div className="archive-storage">
            <div className="archive-storage-copy">
              <Lock size={16} />
              <div>
                <b>Kept in this browser</b>
                <p>
                  Clearing site data deletes the archive. Export what you can’t lose. The demo is
                  fictional; the rest is yours.
                </p>
              </div>
            </div>
            <div className="archive-storage-actions">
              <button type="button" className="btn btn-ghost btn-sm" onClick={exportAll}>
                <Download size={13} /> Export all
              </button>
              {!hasDemo && (
                <button
                  type="button"
                  className="btn btn-quiet btn-sm"
                  onClick={() => {
                    restoreDemo()
                    notify('The demo archive was restored.')
                  }}
                >
                  <RotateCcw size={13} /> Restore demo
                </button>
              )}
            </div>
          </div>

          {sorted.length === 0 ? (
            <div className="archive-empty">
              <Flame size={30} />
              <h2 className="display">The room is empty.</h2>
              <p className="lede">
                Six questions are enough to begin. The Keeper will keep everything here, on this
                device.
              </p>
              <div className="archive-empty-actions">
                <Link to="/studio" className="btn btn-primary">
                  Light a candle
                </Link>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    restoreDemo()
                    notify('The demo archive was restored.')
                  }}
                >
                  Restore the demo
                </button>
              </div>
            </div>
          ) : (
            <div className="archive-grid">
              <Link to="/studio" className="archive-new-card">
                <span className="archive-new-icon">
                  <Flame size={22} />
                </span>
                <h2 className="display">Another light.</h2>
                <p>Six questions, about eight minutes. A new ofrenda, kept here.</p>
                <span className="link">
                  Begin <ArrowRight size={13} />
                </span>
              </Link>
              {sorted.map((ofrenda) => {
                const count = memoryCount(ofrenda)
                const inProgress = !ofrenda.remembrance
                return (
                  <article className="archive-card" key={ofrenda.id}>
                    <Link to={`/ofrenda/${ofrenda.id}`} className="archive-card-link">
                      <div className="archive-visual">
                        <span
                          className={cx(
                            'archive-status chip',
                            ofrenda.isDemo && 'chip-amber',
                            inProgress && 'chip-ghost',
                          )}
                        >
                          {sourceBadge(ofrenda)}
                        </span>
                        <div className="archive-arch" aria-hidden="true" />
                        <Portrait person={ofrenda.person} size="lg" />
                        <div className="archive-candles" aria-hidden="true">
                          {CHAPTERS.map((chapter) => {
                            const entry = ofrenda.entries.find(
                              (item) => item.id === chapter.id,
                            )
                            const lit = Boolean(entry && !entry.skipped && entry.answer.trim())
                            return (
                              <span
                                key={chapter.id}
                                className={cx('archive-candle-dot', lit && 'is-lit')}
                              />
                            )
                          })}
                        </div>
                      </div>
                      <div className="archive-info">
                        <h2 className="display archive-name">{ofrenda.person.name}</h2>
                        <p className="archive-life mono">
                          {[ofrenda.person.years, ofrenda.person.relation]
                            .filter(Boolean)
                            .join(' · ') || 'A light'}
                        </p>
                        <div className="archive-meta">
                          <span>
                            {count} / {CHAPTERS.length} memories
                          </span>
                          <span>{formatDate(ofrenda.updatedAt)}</span>
                        </div>
                      </div>
                    </Link>
                    <div className="archive-card-actions">
                      <Link to={`/ofrenda/${ofrenda.id}`} className="archive-open">
                        <FolderOpen size={13} /> Open
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          exportOne(ofrenda.id)
                          notify('Archive exported as JSON.')
                        }}
                      >
                        <Download size={13} /> JSON
                      </button>
                      {!ofrenda.isDemo && (
                        <button
                          type="button"
                          className="archive-delete"
                          onClick={() => setDeleteId(ofrenda.id)}
                          aria-label={`Delete ${ofrenda.person.name}`}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                      {!ofrenda.isDemo && inProgress && (
                        <Link to={`/studio/${ofrenda.id}`} className="archive-continue">
                          Continue <ArrowRight size={13} />
                        </Link>
                      )}
                    </div>
                  </article>
                )
              })}
              <blockquote className="archive-quote-card">
                <Marigold size={30} />
                <p className="display">
                  The ghost is not the model. The model is the candle.{' '}
                  <em>The ghost is what you remember.</em>
                </p>
                <span className="tiny-label">Ghostlight · the thesis</span>
              </blockquote>
            </div>
          )}
        </section>
      </div>

      {deleting && (
        <ConfirmDialog
          title="Let this light go?"
          body={`This removes ${deleting.person.name}’s archive, photograph and remembrance from this browser. They cannot be recovered unless you exported a copy.`}
          confirmLabel="Delete it"
          onCancel={() => setDeleteId(null)}
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
