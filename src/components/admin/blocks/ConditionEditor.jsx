// src/components/admin/blocks/ConditionEditor.jsx — A single condition row:
// column + operator + value. Used by Count, Stat, and List blocks.
//
// Marketing-friendly:
//   - Column is a Thai-labeled <select> of the table's allowed columns.
//   - Value is a <select> of the allowed values when the column is an enum
//     (e.g. status), so the admin never types raw 'available'.
//   - Operators carry Thai tooltips.

import { colLabel, ENUM_VALUES } from '../../../data/faqBlockSamples.js'

const OP_TITLE = {
  '=': 'เท่ากับ',
  '!=': 'ไม่เท่ากับ',
  '<': 'น้อยกว่า',
  '<=': 'น้อยกว่าหรือเท่ากับ',
  '>': 'มากกว่า',
  '>=': 'มากกว่าหรือเท่ากับ',
  IN: 'เป็นหนึ่งใน (หลายค่า)',
  'IS NULL': 'ไม่มีค่า (ว่าง)',
  'IS NOT NULL': 'มีค่า',
}

export default function ConditionEditor({ condition, table, onChange, onRemove }) {
  const numeric = table?.numeric?.includes(condition.col)
  const ops = numeric
    ? ['=', '!=', '<', '<=', '>', '>=', 'IN', 'IS NULL']
    : ['=', '!=', 'IN', 'IS NULL']

  const isValueless = condition.op === 'IS NULL' || condition.op === 'IS NOT NULL'
  const isIn = condition.op === 'IN'
  const enumOpts = ENUM_VALUES[condition.col]
  const useEnumSelect = enumOpts && !isIn && !isValueless

  const handleCol = (e) => {
    const col = e.target.value
    // Switching to an enum column: clear a stale free-text value so the dropdown
    // starts clean. Switching away: keep whatever's there.
    const reset = ENUM_VALUES[col] && !ENUM_VALUES[col].some((o) => o.value === condition.value)
      ? ''
      : condition.value
    onChange({ ...condition, col, value: reset })
  }
  const handleOp = (e) => onChange({
    ...condition,
    op: e.target.value,
    value: defaultValueFor(e.target.value, condition.value),
  })
  const handleVal = (e) => {
    if (isIn) {
      const arr = e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
      onChange({ ...condition, value: arr })
    } else {
      onChange({ ...condition, value: e.target.value })
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={condition.col || ''}
        onChange={handleCol}
        className="input w-40 text-sm"
        aria-label="คอลัมน์"
      >
        <option value="">— เลือก —</option>
        {(table?.columns || []).map((c) => <option key={c} value={c}>{colLabel(c)}</option>)}
      </select>

      <select
        value={condition.op || '='}
        onChange={handleOp}
        className="input w-16 text-sm"
        aria-label="ตัวดำเนินการ"
      >
        {ops.map((o) => <option key={o} value={o} title={OP_TITLE[o]}>{o}</option>)}
      </select>

      {!isValueless && useEnumSelect && (
        <select
          value={condition.value ?? ''}
          onChange={handleVal}
          className="input flex-1 min-w-[140px] text-sm"
          aria-label="ค่า"
        >
          <option value="">— เลือก —</option>
          {enumOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )}

      {!isValueless && !useEnumSelect && (
        <input
          value={isIn
            ? (Array.isArray(condition.value) ? condition.value.join(', ') : '')
            : (condition.value ?? '')}
          onChange={handleVal}
          placeholder={isIn ? 'ค่า1, ค่า2, ค่า3' : 'ค่า'}
          className="input flex-1 min-w-[140px] text-sm"
          title={isIn ? 'หลายค่า คั่นด้วย comma' : 'ค่าที่ใช้เปรียบเทียบ'}
          aria-label="ค่า"
        />
      )}

      <button
        type="button"
        onClick={onRemove}
        className="btn btn-ghost btn-xs text-ember-700"
        aria-label="ลบเงื่อนไข"
        title="ลบเงื่อนไขนี้"
      >
        ✕
      </button>
    </div>
  )
}

function defaultValueFor(op, prev) {
  if (op === 'IS NULL' || op === 'IS NOT NULL') return undefined
  if (op === 'IN') return Array.isArray(prev) ? prev : []
  return prev ?? ''
}
