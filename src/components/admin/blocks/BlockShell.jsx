// src/components/admin/blocks/BlockShell.jsx — Shared chrome around every
// block card: header (type icon + label + Thai hint), drag up/down buttons,
// "Restore from sample" reset, and the delete (✕) button.
//
// We deliberately use up/down buttons instead of react-dnd / react-beautiful-
// dnd to keep the dependency surface at zero. State is just an array.

import { ChevronUp, ChevronDown, Close, RotateCw } from '../../icons.jsx'
import { BLOCK_LABELS, SAMPLES } from '../../../data/faqBlockSamples.js'

const TYPE_ICONS = {
  text:   () => null, // imported per card to avoid circular deps
  count:  null,
  stat:   null,
  single: null,
  list:   null,
  link:   null,
}

export default function BlockShell({
  block, index, total, onChange, onMove, onRemove, onRestore,
  icon, children,
}) {
  const meta = BLOCK_LABELS[block.type] ?? { label: block.type, hint: '' }
  const canUp   = index > 0
  const canDown = index < total - 1

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-cream-50/60 border-b border-line">
        <div className="w-8 h-8 grid place-items-center rounded-md bg-white border border-line text-navy-700 shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-navy-700">
            {index + 1}. {meta.label}
          </div>
          <div className="text-xs text-muted truncate">{meta.hint}</div>
        </div>
        <button
          type="button"
          onClick={onRestore}
          title="คืนค่าตัวอย่าง (จะลบข้อมูลบล็อกนี้แล้วใส่ค่าตัวอย่าง)"
          className="btn btn-ghost btn-xs"
          aria-label="คืนค่าตัวอย่าง"
        >
          <RotateCw size={14} />
        </button>
        <button
          type="button"
          onClick={() => onMove(index, index - 1)}
          disabled={!canUp}
          title="เลื่อนขึ้น"
          className="btn btn-ghost btn-xs"
          aria-label="เลื่อนขึ้น"
        >
          <ChevronUp size={16} />
        </button>
        <button
          type="button"
          onClick={() => onMove(index, index + 1)}
          disabled={!canDown}
          title="เลื่อนลง"
          className="btn btn-ghost btn-xs"
          aria-label="เลื่อนลง"
        >
          <ChevronDown size={16} />
        </button>
        <button
          type="button"
          onClick={onRemove}
          title="ลบบล็อกนี้"
          className="btn btn-ghost btn-xs text-ember-700"
          aria-label="ลบบล็อก"
        >
          <Close size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {children}
      </div>
    </div>
  )
}