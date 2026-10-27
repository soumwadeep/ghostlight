import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import { CHAPTERS } from '../data/chapters'
import type { ChapterId, Ofrenda } from '../types'

export function MemoryDialog({
  ofrenda,
  chapterId,
  onClose,
  onNavigate,
  canEdit,
}: {
  ofrenda: Ofrenda
  chapterId: ChapterId
  onClose: () => void
  onNavigate: (direction: 'prev' | 'next') => void
  canEdit: boolean
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const chapter = CHAPTERS.find((item) => item.id === chapterId) ?? CHAPTERS[0]
  const index = CHAPTERS.findIndex((item) => item.id === chapter.id)
  const entry = ofrenda.entries.find((item) => item.id === chapter.id)
  const hasMemory = Boolean(entry && !entry.skipped && entry.answer.trim())

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (!dialog.open) dialog.showModal()
    return () => {
      if (dialog.open) dialog.close()
    }
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog) dialog.scrollTop = 0
  }, [chapter.id])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') onNavigate('prev')
      if (event.key === 'ArrowRight') onNavigate('next')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onNavigate])

  return (
    <dialog
      ref={dialogRef}
      className="memory-dialog"
      aria-labelledby="memory-dialog-title"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose()
      }}
    >
      <div className="dialog-card memory-card">
        <div className="memory-dialog-top">
          <span className="eyebrow">
            {chapter.rite} — {chapter.label}
          </span>
          <button type="button" className="btn btn-icon btn-sm" onClick={onClose} aria-label="Close">
            <X size={15} />
          </button>
        </div>

        <h2 id="memory-dialog-title" className="display memory-question">
          {chapter.prompt}
        </h2>

        {hasMemory ? (
          <>
            <p className="memory-answer">{entry?.answer}</p>
            {entry?.artifact && (
              <div className="memory-artifact">
                <span className="chip chip-amber">{entry.artifact.kind}</span>
                <span>{entry.artifact.label}</span>
              </div>
            )}
            <p className="memory-foot tiny-label">
              Only the words you kept. Nothing added, nothing invented.
            </p>
          </>
        ) : (
          <div className="memory-empty">
            <p className="display">This candle isn’t lit yet.</p>
            <p>
              {entry?.skipped
                ? 'You set this question aside. You can come back to it whenever you want.'
                : 'This memory hasn’t been written yet.'}
            </p>
            {canEdit && (
              <Link to={`/studio/${ofrenda.id}?step=edit`} className="link" onClick={onClose}>
                Return to the studio <ArrowRight size={13} />
              </Link>
            )}
          </div>
        )}

        <div className="memory-nav">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onNavigate('prev')}
          >
            <ArrowLeft size={14} /> Previous
          </button>
          <span className="mono memory-count">
            {index + 1} / {CHAPTERS.length}
          </span>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onNavigate('next')}
          >
            Next <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </dialog>
  )
}
