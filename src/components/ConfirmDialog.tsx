import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export function ConfirmDialog({
  title,
  body,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  title: string
  body: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (!dialog.open) dialog.showModal()
    return () => {
      if (dialog.open) dialog.close()
    }
  }, [])

  return (
    <dialog
      ref={dialogRef}
      className="confirm-dialog"
      aria-labelledby="confirm-title"
      onCancel={(event) => {
        event.preventDefault()
        onCancel()
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onCancel()
      }}
    >
      <div className="dialog-card confirm-card">
        <div className="confirm-top">
          <h2 id="confirm-title" className="display">
            {title}
          </h2>
          <button type="button" className="btn btn-icon btn-sm" onClick={onCancel} aria-label="Close">
            <X size={15} />
          </button>
        </div>
        <p className="confirm-body">{body}</p>
        <div className="confirm-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Keep it
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  )
}
