// src/components/admin/blocks/blocks.jsx — All six block-type editors.
//
// Designed for a marketing admin who doesn't read code:
//   - Dynamic blocks (count/stat/single/list) show a plain-Thai SUMMARY of
//     what they do + the editable sentence, with the table/column/conditions
//     controls tucked behind a "ขั้นสูง" disclosure.
//   - Tables/columns use Thai labels; enum values use dropdowns.
//
// One component per block type. Each takes:
//   block              — current block state (object)
//   onChange(updated)  — replace this block's state
// Each renders inside a <BlockShell> that handles move/delete/restore.

import { Plus } from '../../icons.jsx'
import BlockShell from './BlockShell.jsx'
import ConditionEditor from './ConditionEditor.jsx'
import {
  Type, Hash, BarChart, Key, List, LinkIcon,
} from '../../icons.jsx'
import {
  colLabel, ENUM_VALUES, AGG_LABELS,
} from '../../../data/faqBlockSamples.js'

// ---------------------------------------------------------------------------
// Tables + their columns. Must match the server whitelist in
// server/src/services/safeQuery.service.js. Labels are Thai-first for the UI.
// ---------------------------------------------------------------------------

export const TABLES = {
  rooms: {
    label: 'ห้องเช่า',
    columns: ['id', 'title', 'monthly_rent', 'bedrooms', 'bathrooms',
              'size_sqm', 'status', 'zone_id', 'landlord_id',
              'is_featured', 'available_from', 'created_at'],
    numeric: ['monthly_rent', 'bedrooms', 'bathrooms', 'size_sqm'],
  },
  viewings: {
    label: 'การนัดชมห้อง',
    columns: ['id', 'room_id', 'tenant_id', 'scheduled_for', 'status',
              'requested_at', 'created_at'],
    numeric: ['room_id', 'tenant_id'],
  },
  tenants: {
    label: 'ผู้เช่า',
    columns: ['id', 'full_name', 'phone', 'email', 'monthly_income',
              'move_in_date', 'is_active', 'created_at'],
    numeric: ['monthly_income'],
  },
}

const tableLabel = (name) => TABLES[name]?.label || name

// ---------------------------------------------------------------------------
// Plain-Thai summary helpers — turn a block's raw config into a sentence the
// admin can read without knowing SQL.
// ---------------------------------------------------------------------------

function valLabel(col, value) {
  if (value === undefined || value === null || value === '') return '—'
  const enumOpts = ENUM_VALUES[col]
  if (enumOpts) {
    const map = (v) => enumOpts.find((o) => o.value === v)?.label ?? v
    return Array.isArray(value) ? value.map(map).join(', ') : map(value)
  }
  return Array.isArray(value) ? value.join(', ') : String(value)
}

function condText(c) {
  if (!c || !c.col) return ''
  if (c.op === 'IS NULL' || c.op === 'IS NOT NULL') return `${colLabel(c.col)} ${c.op === 'IS NULL' ? 'ว่าง' : 'ไม่ว่าง'}`
  const opWord = { '=': '=', '!=': '≠', '<': '<', '<=': '≤', '>': '>', '>=': '≥', IN: '∈' }[c.op] || c.op
  return `${colLabel(c.col)} ${opWord} ${valLabel(c.col, c.value)}`
}

function condsText(conditions) {
  const cs = (conditions || []).filter((c) => c && c.col).map(condText)
  if (cs.length === 0) return ''
  return 'ที่ ' + cs.join(' และ ')
}

function summarize(block) {
  const t = tableLabel(block.table)
  const conds = condsText(block.conditions)
  const join = (s) => (conds ? `${s} ${conds}` : s)
  switch (block.type) {
    case 'count':
      return join(`นับจำนวน${t}`)
    case 'stat': {
      const fn = AGG_LABELS[block.aggregate?.fn] || block.aggregate?.fn || ''
      const col = colLabel(block.aggregate?.col || '')
      return join(`${fn} ${col} ของ${t}`)
    }
    case 'single':
      return `ดึง "${colLabel(block.column || '')}" จาก${t} (${block.rowKey || '—'})`
    case 'list': {
      const order = block.orderBy?.column ? ` เรียงตาม ${colLabel(block.orderBy.column)} ${block.orderBy.dir === 'DESC' ? 'มาก→น้อย' : 'น้อย→มาก'}` : ''
      return join(`แสดง ${block.limit ?? 5} รายการจาก${t}${order}`)
    }
    default:
      return ''
  }
}

function BlockSummary({ block }) {
  const text = summarize(block)
  if (!text) return null
  return (
    <div className="rounded-md bg-cream-50/70 border border-line px-3 py-2 text-sm text-navy-700">
      <span className="text-muted">สรุป: </span>{text}
    </div>
  )
}

// A collapsible wrapper for the technical controls of a dynamic block.
function Advanced({ children }) {
  return (
    <details className="group mt-1 rounded-lg border border-line bg-white">
      <summary className="cursor-pointer select-none px-3 py-2 text-sm font-medium text-navy-700 list-none flex items-center gap-1.5">
        <span className="inline-block transition-transform group-open:rotate-90 text-muted">▸</span>
        ขั้นสูง · แก้ไขแหล่งข้อมูล / เงื่อนไข
      </summary>
      <div className="px-3 pb-3 pt-1 space-y-3 border-t border-line">{children}</div>
    </details>
  )
}

// ---------------------------------------------------------------------------
// 1) Text
// ---------------------------------------------------------------------------

export function TextBlock({ block, index, total, onChange, onMove, onRemove, onRestore }) {
  return (
    <BlockShell
      block={block} index={index} total={total}
      onMove={onMove} onRemove={onRemove} onRestore={onRestore}
      icon={<Type size={18} />}
    >
      <div>
        <label className="label"><span>ข้อความที่บอทจะตอบ</span></label>
        <textarea
          rows={3}
          value={block.text || ''}
          onChange={(e) => onChange({ ...block, text: e.target.value })}
          placeholder='เช่น "ตอนนี้มีห้องว่างพร้อมเข้าอยู่ค่ะ"'
          className="input text-sm"
        />
        <p className="help">ข้อความนี้จะถูกแทรกเข้าไปในคำตอบของบอทตามลำดับบล็อก</p>
      </div>
    </BlockShell>
  )
}

// Reusable "ประโยคที่บอทจะพูด" field for blocks that use a format template.
function SentenceField({ value, onChange, placeholder, help }) {
  return (
    <div>
      <label className="label"><span>ประโยคที่บอทจะพูด</span></label>
      <input
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input text-sm"
      />
      {help && <p className="help" dangerouslySetInnerHTML={{ __html: help }} />}
    </div>
  )
}

// ---------------------------------------------------------------------------
// 2) Count
// ---------------------------------------------------------------------------

export function CountBlock({ block, index, total, onChange, onMove, onRemove, onRestore }) {
  const table = TABLES[block.table] || TABLES.rooms
  return (
    <BlockShell
      block={block} index={index} total={total}
      onMove={onMove} onRemove={onRemove} onRestore={onRestore}
      icon={<Hash size={18} />}
    >
      <div className="space-y-3">
        <BlockSummary block={block} />
        <SentenceField
          value={block.format}
          onChange={(format) => onChange({ ...block, format })}
          placeholder='เช่น "ตอนนี้มีห้องว่าง {{n}} ห้องค่ะ"'
          help="ใช้ <code>{{n}}</code> ตรงตำแหน่งที่จะให้แสดงตัวเลขที่นับได้"
        />
        <Advanced>
          <div>
            <label className="label"><span>แหล่งข้อมูล</span></label>
            <select
              value={block.table || 'rooms'}
              onChange={(e) => onChange({ ...block, table: e.target.value })}
              className="input text-sm"
            >
              {Object.entries(TABLES).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <ConditionsEditor
            conditions={block.conditions || []}
            table={table}
            onChange={(conditions) => onChange({ ...block, conditions })}
          />
        </Advanced>
      </div>
    </BlockShell>
  )
}

// ---------------------------------------------------------------------------
// 3) Stat
// ---------------------------------------------------------------------------

export function StatBlock({ block, index, total, onChange, onMove, onRemove, onRestore }) {
  const table = TABLES[block.table] || TABLES.rooms
  return (
    <BlockShell
      block={block} index={index} total={total}
      onMove={onMove} onRemove={onRemove} onRestore={onRestore}
      icon={<BarChart size={18} />}
    >
      <div className="space-y-3">
        <BlockSummary block={block} />
        <SentenceField
          value={block.format}
          onChange={(format) => onChange({ ...block, format })}
          placeholder='เช่น "ค่าเช่าเฉลี่ย {{v:0,000}} บาท/เดือนค่ะ"'
          help="ใช้ <code>{{v:0,000}}</code> ติดจุลภาค, <code>{{v}}</code> ตัวเลขธรรมดา, <code>{{v:date}}</code> วันที่"
        />
        <Advanced>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="label"><span>แหล่งข้อมูล</span></label>
              <select
                value={block.table || 'rooms'}
                onChange={(e) => onChange({ ...block, table: e.target.value })}
                className="input text-sm"
              >
                {Object.entries(TABLES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label"><span>การคำนวณ</span></label>
              <select
                value={block.aggregate?.fn || 'AVG'}
                onChange={(e) => onChange({
                  ...block,
                  aggregate: { ...(block.aggregate || {}), fn: e.target.value },
                })}
                className="input text-sm"
              >
                {Object.entries(AGG_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>{label} ({k})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label"><span>คอลัมน์</span></label>
              <select
                value={block.aggregate?.col || ''}
                onChange={(e) => onChange({
                  ...block,
                  aggregate: { ...(block.aggregate || {}), col: e.target.value },
                })}
                className="input text-sm"
              >
                <option value="">— เลือก —</option>
                {table.columns.map((c) => <option key={c} value={c}>{colLabel(c)}</option>)}
              </select>
            </div>
          </div>
          <ConditionsEditor
            conditions={block.conditions || []}
            table={table}
            onChange={(conditions) => onChange({ ...block, conditions })}
          />
        </Advanced>
      </div>
    </BlockShell>
  )
}

// ---------------------------------------------------------------------------
// 4) Single
// ---------------------------------------------------------------------------

export function SingleBlock({ block, index, total, onChange, onMove, onRemove, onRestore }) {
  const table = TABLES[block.table] || TABLES.viewings
  return (
    <BlockShell
      block={block} index={index} total={total}
      onMove={onMove} onRemove={onRemove} onRestore={onRestore}
      icon={<Key size={18} />}
    >
      <div className="space-y-3">
        <BlockSummary block={block} />
        <SentenceField
          value={block.format}
          onChange={(format) => onChange({ ...block, format })}
          placeholder='เช่น "วันนัดชมของคุณคือ {{v:date}} ค่ะ"'
          help="ใช้ <code>{{v}}</code> หรือ <code>{{v:date}}</code> ตรงตำแหน่งที่จะให้แสดงค่า"
        />
        <Advanced>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="label"><span>แหล่งข้อมูล</span></label>
              <select
                value={block.table || 'viewings'}
                onChange={(e) => onChange({ ...block, table: e.target.value })}
                className="input text-sm"
              >
                {Object.entries(TABLES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label"><span>ดึงจาก</span></label>
              <select
                value={block.rowKey || 'viewingId'}
                onChange={(e) => onChange({ ...block, rowKey: e.target.value })}
                className="input text-sm"
              >
                <option value="roomId">ห้องที่กำลังดูอยู่ (roomId)</option>
                <option value="viewingId">นัดชมห้องที่กำลังพูดถึง (viewingId)</option>
                <option value="tenantId">ผู้ใช้ที่กำลังแชท (tenantId)</option>
              </select>
            </div>
            <div>
              <label className="label"><span>ข้อมูลที่จะดึง</span></label>
              <select
                value={block.column || ''}
                onChange={(e) => onChange({ ...block, column: e.target.value })}
                className="input text-sm"
              >
                <option value="">— เลือก —</option>
                {table.columns.map((c) => <option key={c} value={c}>{colLabel(c)}</option>)}
              </select>
            </div>
          </div>
        </Advanced>
      </div>
    </BlockShell>
  )
}

// ---------------------------------------------------------------------------
// 5) List
// ---------------------------------------------------------------------------

export function ListBlock({ block, index, total, onChange, onMove, onRemove, onRestore }) {
  const table = TABLES[block.table] || TABLES.rooms
  const columns = block.columns || []
  const conditions = block.conditions || []
  const orderBy = block.orderBy || { column: '', dir: 'ASC' }

  return (
    <BlockShell
      block={block} index={index} total={total}
      onMove={onMove} onRemove={onRemove} onRestore={onRestore}
      icon={<List size={18} />}
    >
      <div className="space-y-3">
        <BlockSummary block={block} />
        <SentenceField
          value={block.itemTemplate}
          onChange={(itemTemplate) => onChange({ ...block, itemTemplate })}
          placeholder='เช่น "{{row.title}} — {{row.monthly_rent:0,000}} บาท"'
          help="ใช้ <code>{{row.ชื่อคอลัมน์}}</code> ตรงตำแหน่งที่จะให้แสดงค่า — บอทจะใส่เลขลำดับ 1) 2) 3) ให้อัตโนมัติ"
        />
        <Advanced>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label"><span>แหล่งข้อมูล</span></label>
              <select
                value={block.table || 'rooms'}
                onChange={(e) => onChange({
                  ...block,
                  table: e.target.value,
                  columns: [],
                  orderBy: { column: '', dir: 'ASC' },
                })}
                className="input text-sm"
              >
                {Object.entries(TABLES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label"><span>จำนวนรายการ</span></label>
              <input
                type="number"
                min={1}
                max={5}
                value={block.limit ?? 5}
                onChange={(e) => onChange({ ...block, limit: Math.min(5, Math.max(1, Number(e.target.value) || 1)) })}
                className="input text-sm"
              />
            </div>
          </div>

          <div>
            <label className="label"><span>ข้อมูลที่จะแสดง (เลือกได้สูงสุด 6)</span></label>
            <div className="flex flex-wrap gap-2">
              {table.columns.map((c) => {
                const checked = columns.includes(c)
                return (
                  <label key={c} className="flex items-center gap-1.5 text-sm px-2 py-1 rounded-md border border-line bg-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...columns, c].slice(0, 6)
                          : columns.filter((x) => x !== c)
                        onChange({ ...block, columns: next })
                      }}
                      className="accent-navy-600"
                    />
                    {colLabel(c)}
                  </label>
                )
              })}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label"><span>เรียงตาม</span></label>
              <select
                value={orderBy.column || ''}
                onChange={(e) => onChange({ ...block, orderBy: { ...orderBy, column: e.target.value } })}
                className="input text-sm"
              >
                <option value="">— ไม่เรียง —</option>
                {table.columns.map((c) => <option key={c} value={c}>{colLabel(c)}</option>)}
              </select>
            </div>
            <div>
              <label className="label"><span>ทิศทาง</span></label>
              <select
                value={orderBy.dir || 'ASC'}
                onChange={(e) => onChange({ ...block, orderBy: { ...orderBy, dir: e.target.value } })}
                className="input text-sm"
              >
                <option value="ASC">น้อย → มาก</option>
                <option value="DESC">มาก → น้อย</option>
              </select>
            </div>
          </div>

          <ConditionsEditor
            conditions={conditions}
            table={table}
            onChange={(c) => onChange({ ...block, conditions: c })}
          />
        </Advanced>
      </div>
    </BlockShell>
  )
}

// ---------------------------------------------------------------------------
// 6) Link
// ---------------------------------------------------------------------------

export function LinkBlock({ block, index, total, onChange, onMove, onRemove, onRestore }) {
  return (
    <BlockShell
      block={block} index={index} total={total}
      onMove={onMove} onRemove={onRemove} onRestore={onRestore}
      icon={<LinkIcon size={18} />}
    >
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="label"><span>ข้อความลิงก์</span></label>
          <input
            value={block.label || ''}
            onChange={(e) => onChange({ ...block, label: e.target.value })}
            placeholder='เช่น "ดูเพิ่มเติม"'
            className="input text-sm"
          />
        </div>
        <div>
          <label className="label"><span>ลิงก์ (URL)</span></label>
          <input
            type="url"
            value={block.url || ''}
            onChange={(e) => onChange({ ...block, url: e.target.value })}
            placeholder='https://...'
            className="input text-sm"
          />
        </div>
      </div>
    </BlockShell>
  )
}

// ---------------------------------------------------------------------------
// Shared: conditions list (Add button + per-row ConditionEditor)
// ---------------------------------------------------------------------------

function ConditionsEditor({ conditions, table, onChange }) {
  const add = () => onChange([...(conditions || []), { col: '', op: '=', value: '' }])
  const upd = (i, c) => onChange(conditions.map((x, idx) => (idx === i ? c : x)))
  const del = (i) => onChange(conditions.filter((_, idx) => idx !== i))

  return (
    <div>
      <label className="label"><span>เงื่อนไขกรอง (AND)</span></label>
      {(conditions || []).length === 0 && (
        <p className="text-xs text-muted">ไม่มีเงื่อนไข → นับ/ดึงทุกแถว</p>
      )}
      <div className="space-y-2">
        {conditions.map((c, i) => (
          <ConditionEditor
            key={i}
            condition={c}
            table={table}
            onChange={(updated) => upd(i, updated)}
            onRemove={() => del(i)}
          />
        ))}
      </div>
      {conditions.length < 5 && (
        <button type="button" onClick={add} className="btn btn-ghost btn-sm mt-2">
          <Plus size={14} /> เพิ่มเงื่อนไข
        </button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Dispatch — used by the form's block list renderer.
// ---------------------------------------------------------------------------

export function renderBlockCard({
  block, index, total, onChange, onMove, onRemove, onRestore,
}) {
  switch (block.type) {
    case 'text':   return <TextBlock   {...{ block, index, total, onChange, onMove, onRemove, onRestore }} />
    case 'count':  return <CountBlock  {...{ block, index, total, onChange, onMove, onRemove, onRestore }} />
    case 'stat':   return <StatBlock   {...{ block, index, total, onChange, onMove, onRemove, onRestore }} />
    case 'single': return <SingleBlock {...{ block, index, total, onChange, onMove, onRemove, onRestore }} />
    case 'list':   return <ListBlock   {...{ block, index, total, onChange, onMove, onRemove, onRestore }} />
    case 'link':   return <LinkBlock   {...{ block, index, total, onChange, onMove, onRemove, onRestore }} />
    default:       return null
  }
}
