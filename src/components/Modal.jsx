import { useEffect, useRef } from 'react'
import { Close } from './icons.jsx'

/**
 * Accessible modal — uses the native <dialog> element so we get focus trap,
 * ESC handling, and ::backdrop styling for free.
 *
 * Props:
 *   open       — boolean
 *   onClose    — () => void
 *   title      — string (optional, used for aria-label)
 *   children   — modal content
 *   maxWidth   — tailwind class for inner width (default "max-w-2xl")
 */
export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-2xl' }) {
  const ref = useRef(null)

  useEffect(() => {
    const dlg = ref.current
    if (!dlg) return
    if (open && !dlg.open) dlg.showModal()
    if (!open && dlg.open)  dlg.close()
  }, [open])

  // Wire ESC → onClose (the dialog fires 'close' on ESC by default)
  useEffect(() => {
    const dlg = ref.current
    if (!dlg) return
    const onCancel = (e) => { e.preventDefault(); onClose?.() }
    dlg.addEventListener('cancel', onCancel)
    return () => dlg.removeEventListener('cancel', onCancel)
  }, [onClose])

  // Click on backdrop closes the modal (the dialog covers the whole viewport)
  useEffect(() => {
    const dlg = ref.current
    if (!dlg) return
    const onClick = (e) => {
      if (e.target === dlg) onClose?.()
    }
    dlg.addEventListener('click', onClick)
    return () => dlg.removeEventListener('click', onClick)
  }, [onClose])

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-label={title || 'โมดัล'}
      className="bg-transparent p-0 m-0 max-w-none max-h-none w-full h-full backdrop:bg-navy-900/55 backdrop:backdrop-blur-sm open:animate-fade-up"
      onClose={onClose}
    >
      <div className={`relative w-[min(92vw,${maxWidthToPx(maxWidth)})] mx-auto my-8 bg-white rounded-2xl shadow-lift overflow-hidden`}>
        <button
          type="button"
          onClick={onClose}
          aria-label="ปิด"
          className="absolute top-3.5 right-3.5 z-10 w-10 h-10 grid place-items-center rounded-lg text-muted hover:bg-navy-50 hover:text-navy-700"
        >
          <Close size={20} />
        </button>
        {children}
      </div>
    </dialog>
  )
}

/**
 * Confirmation dialog — built on top of Modal for consistent styling.
 * Use as a controlled component:
 *   <ConfirmDialog open={x} title="..." message="..." onConfirm={...} onCancel={...} />
 *
 * Backwards compat: `danger` still works as an alias for `confirmTone="danger"`.
 * New props: `confirmTone` ('primary' | 'danger', default 'primary'),
 * `busy` (disables buttons + shows spinner on confirm), `error` (rendered
 * inline above the buttons).
 */
export function ConfirmDialog({
  open, title, message, confirmLabel = 'ยืนยัน', cancelLabel = 'ยกเลิก',
  danger = false, confirmTone, busy = false, error = '',
  onConfirm, onCancel,
}) {
  const tone = confirmTone || (danger ? 'danger' : 'primary')
  const confirmClass = tone === 'danger' ? 'btn btn-danger' : 'btn btn-primary'
  const disabled = busy
  return (
    <Modal open={open} onClose={busy ? () => {} : onCancel} title={title} maxWidth="max-w-md">
      <div className="p-7 sm:p-8">
        <h3 className="font-bold text-navy-700 text-xl">{title}</h3>
        {message && <p className="mt-3 text-muted text-[15px] leading-relaxed whitespace-pre-line">{message}</p>}
        {error && (
          <p className="mt-4 text-sm text-ember-700 bg-ember-50 border border-ember-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        <div className="mt-7 flex flex-wrap justify-end gap-3">
          <button type="button" onClick={onCancel} disabled={disabled} className="btn btn-outline">
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} disabled={disabled} className={confirmClass}>
            {busy && (
              <span
                aria-hidden="true"
                className="inline-block w-3.5 h-3.5 mr-1.5 rounded-full border-2 border-white/40 border-t-white animate-spin"
              />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}

function maxWidthToPx(twClass) {
  const map = {
    'max-w-sm':   '24rem',
    'max-w-md':   '28rem',
    'max-w-lg':   '32rem',
    'max-w-xl':   '36rem',
    'max-w-2xl':  '42rem',
    'max-w-3xl':  '48rem',
    'max-w-4xl':  '56rem',
  }
  return map[twClass] || '42rem'
}