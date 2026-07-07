// src/components/admin/AdminRoomForm.jsx — Create + edit a single room.
import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowRight, Home } from '../icons.jsx'
import { useApi } from '../../hooks/useApi.js'
import { api, ApiError } from '../../api/client.js'

const PROPERTY_TYPES = [
  { value: 'condo',      label: 'คอนโด' },
  { value: 'townhouse',  label: 'ทาวน์เฮ้าส์' },
  { value: 'house',      label: 'บ้านเดี่ยว' },
  { value: 'apartment',  label: 'อพาร์ทเมนท์' },
  { value: 'studio',     label: 'สตูดิโอ' },
]

const STATUSES = [
  { value: 'available', label: 'ว่าง' },
  { value: 'reserved',  label: 'จองแล้ว' },
  { value: 'matched',   label: 'มีผู้เช่า' },
  { value: 'inactive',  label: 'ปิด' },
]

const EMPTY_FORM = {
  title: '', description: '',
  landlordId: '', zoneId: '',
  propertyType: 'condo',
  bedrooms: 1, bathrooms: 1, sizeSqm: '',
  monthlyRent: '',
  status: 'available',
  availableFrom: '',
  amenitiesText: '',
  isFeatured: false,
}

export default function AdminRoomForm({ mode }) {
  const navigate = useNavigate()
  const params   = useParams()
  const isEdit   = mode === 'edit'
  const roomId   = isEdit ? Number(params.id) : null

  const { data: landlords } = useApi(() => api.listLandlords({ limit: 200 }), [])
  const { data: zones }     = useApi(() => api.listZones(), [])
  const { data: existing, loading: loadingRoom } = useApi(
    () => isEdit ? api.getRoom(roomId) : Promise.resolve(null),
    [roomId],
  )

  const [form, setForm]     = useState(EMPTY_FORM)
  const [status, setStatus] = useState('idle')    // idle | sending | sent | error
  const [errors, setErrors] = useState({})

  // Hydrate form when editing.
  useEffect(() => {
    if (!isEdit || !existing) return
    setForm({
      title: existing.title || '',
      description: existing.description || '',
      landlordId: existing.landlordId ? String(existing.landlordId) : (landlords?.[0]?.id ? String(landlords[0].id) : ''),
      zoneId:     existing.zoneId     ? String(existing.zoneId)     : (zones?.[0]?.id     ? String(zones[0].id)     : ''),
      propertyType: existing.propertyType || 'condo',
      bedrooms:  existing.beds ?? 1,
      bathrooms: existing.baths ?? 1,
      sizeSqm:   existing.sqm ?? '',
      monthlyRent: existing.price ?? '',
      status:    existing.status || 'available',
      availableFrom: existing.availableFrom || '',
      amenitiesText: Array.isArray(existing.amenities) ? existing.amenities.join(', ') : '',
      isFeatured: !!existing.isFeatured,
    })
  }, [existing, landlords, zones, isEdit])

  const update = (k) => (e) => {
    const v = e?.target?.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((s) => ({ ...s, [k]: v }))
  }

  const landlordsEmpty = landlords && landlords.length === 0
  const zonesEmpty     = zones && zones.length === 0

  function validate() {
    const e = {}
    if (!form.title.trim())              e.title       = 'กรุณากรอกชื่อห้อง'
    if (!form.landlordId)                e.landlordId  = 'กรุณาเลือกเจ้าของห้อง'
    if (!form.zoneId)                    e.zoneId      = 'กรุณาเลือกโซน'
    if (!form.monthlyRent || form.monthlyRent < 1000) e.monthlyRent = 'ค่าเช่าต้องอย่างน้อย 1,000 บาท'
    if (form.availableFrom && !/^\d{4}-\d{2}-\d{2}$/.test(form.availableFrom)) e.availableFrom = 'รูปแบบวันที่ไม่ถูกต้อง'
    return e
  }

  async function onSubmit(ev) {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) return

    setStatus('sending')
    const body = {
      title:       form.title.trim(),
      description: form.description.trim() || undefined,
      landlordId:  Number(form.landlordId),
      zoneId:      Number(form.zoneId),
      propertyType: form.propertyType,
      bedrooms:    Number(form.bedrooms),
      bathrooms:   Number(form.bathrooms),
      sizeSqm:     form.sizeSqm ? Number(form.sizeSqm) : undefined,
      monthlyRent: Number(form.monthlyRent),
      status:      form.status,
      availableFrom: form.availableFrom || undefined,
      amenities:   form.amenitiesText
        ? form.amenitiesText.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      isFeatured: !!form.isFeatured,
    }
    try {
      if (isEdit) await api.updateRoom(roomId, body)
      else        await api.createRoom(body)
      setStatus('sent')
      navigate('/admin', { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.code === 'VALIDATION_ERROR' && Array.isArray(err.details)) {
        const fe = {}
        for (const d of err.details) if (d.path && !fe[d.path]) fe[d.path] = d.message
        setErrors(fe)
      }
      setStatus('error')
    }
  }

  if (isEdit && loadingRoom) {
    return <div className="text-center py-16 text-muted">กำลังโหลดข้อมูลห้อง…</div>
  }

  return (
    <section>
      <div className="mb-7">
        <Link to="/admin" className="text-sm text-muted hover:text-navy-700">← กลับไปรายการห้อง</Link>
        <h1 className="mt-3 font-bold text-navy-700 text-3xl sm:text-4xl tracking-tight">
          {isEdit ? 'แก้ไขห้อง' : 'เพิ่มห้องใหม่'}
        </h1>
      </div>

      {landlordsEmpty && (
        <div className="mb-6 text-ember-700 text-sm bg-ember-50 border border-ember-200 rounded-lg px-4 py-3">
          ⚠ ยังไม่มีเจ้าของห้องในระบบ — เพิ่มผ่าน <code className="px-1 bg-white rounded">POST /api/preferences</code> ก่อนสร้างห้อง
        </div>
      )}
      {zonesEmpty && (
        <div className="mb-6 text-ember-700 text-sm bg-ember-50 border border-ember-200 rounded-lg px-4 py-3">
          ⚠ ยังไม่มีโซนในระบบ — seed ฐานข้อมูลก่อน
        </div>
      )}

      <form onSubmit={onSubmit} noValidate className="card p-7 sm:p-8 space-y-6">
        <Header icon={Home} title="รายละเอียดห้อง" sub={isEdit ? 'แก้ไขข้อมูลและบันทึก' : 'กรอกข้อมูลให้ครบก่อนบันทึก'} />

        <Field id="f-title" label="ชื่อห้อง" required error={errors.title}>
          <input id="f-title" className={inputCls(errors.title)} value={form.title} onChange={update('title')} placeholder="เช่น The Line สาทร, คอนโดทองหล่อ" />
        </Field>

        <Field id="f-desc" label="คำอธิบาย">
          <textarea id="f-desc" rows={4} className="input resize-none" value={form.description} onChange={update('description')} placeholder="จุดเด่น ทำเล สภาพห้อง ฯลฯ" />
        </Field>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field id="f-landlord" label="เจ้าของห้อง" required error={errors.landlordId}>
            <select id="f-landlord" className={inputCls(errors.landlordId)} value={form.landlordId} onChange={update('landlordId')}>
              <option value="">— เลือกเจ้าของห้อง —</option>
              {(landlords || []).map((l) => (
                <option key={l.id} value={l.id}>{l.fullName} · {l.phone}</option>
              ))}
            </select>
          </Field>
          <Field id="f-zone" label="โซน / ทำเล" required error={errors.zoneId}>
            <select id="f-zone" className={inputCls(errors.zoneId)} value={form.zoneId} onChange={update('zoneId')}>
              <option value="">— เลือกโซน —</option>
              {(zones || []).map((z) => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
          </Field>
        </div>

        <div>
          <label className="label">ประเภทห้อง</label>
          <ChipGroup options={PROPERTY_TYPES} value={form.propertyType} onChange={(v) => setForm((s) => ({ ...s, propertyType: v }))} />
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          <Field id="f-beds" label="ห้องนอน">
            <input id="f-beds" type="number" min="0" max="10" className="input" value={form.bedrooms} onChange={update('bedrooms')} />
          </Field>
          <Field id="f-baths" label="ห้องน้ำ">
            <input id="f-baths" type="number" min="0" max="10" className="input" value={form.bathrooms} onChange={update('bathrooms')} />
          </Field>
          <Field id="f-sqm" label="พื้นที่ (ตร.ม.)">
            <input id="f-sqm" type="number" min="1" max="2000" className="input" value={form.sizeSqm} onChange={update('sizeSqm')} placeholder="35" />
          </Field>
        </div>

        <Field id="f-rent" label="ค่าเช่า (บาท/เดือน)" required error={errors.monthlyRent}>
          <input id="f-rent" type="number" min="1000" className={inputCls(errors.monthlyRent)} value={form.monthlyRent} onChange={update('monthlyRent')} placeholder="18000" />
        </Field>

        <div>
          <label className="label">สถานะ</label>
          <ChipGroup options={STATUSES} value={form.status} onChange={(v) => setForm((s) => ({ ...s, status: v }))} />
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field id="f-from" label="วันที่ว่าง" error={errors.availableFrom}>
            <input id="f-from" type="date" className={inputCls(errors.availableFrom)} value={form.availableFrom} onChange={update('availableFrom')} />
          </Field>
          <Field id="f-feat" label="ตั้งเป็นห้องแนะนำ">
            <label className="inline-flex items-center gap-3 mt-2 cursor-pointer">
              <input
                id="f-feat"
                type="checkbox"
                checked={!!form.isFeatured}
                onChange={(e) => setForm((s) => ({ ...s, isFeatured: e.target.checked }))}
                className="w-5 h-5 rounded border-navy-300 text-navy-600 focus:ring-navy-600/30"
              />
              <span className="text-navy-700 text-[15px]">แสดงเป็น "ยอดนิยม" บนหน้าแรก</span>
            </label>
          </Field>
        </div>

        <Field id="f-amenities" label="สิ่งอำนวยความสะดวก" hint="คั่นด้วยเครื่องหมายจุลภาค เช่น wifi, pool, gym">
          <input id="f-amenities" className="input" value={form.amenitiesText} onChange={update('amenitiesText')} placeholder="wifi, pool, near-bts" />
        </Field>

        <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-line">
          <Link to="/admin" className="btn btn-outline">ยกเลิก</Link>
          <button
            type="submit"
            disabled={status === 'sending' || landlordsEmpty || zonesEmpty}
            className="btn btn-primary btn-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {status === 'sending' ? 'กำลังบันทึก…' : (isEdit ? 'บันทึกการแก้ไข' : 'สร้างห้อง')}
            <ArrowRight size={18} />
          </button>
        </div>

        {status === 'error' && (
          <div className="text-ember-700 text-sm text-center bg-ember-50 border border-ember-200 rounded-lg px-3 py-2">
            บันทึกไม่สำเร็จ กรุณาตรวจสอบข้อมูลและลองใหม่อีกครั้ง
          </div>
        )}
      </form>
    </section>
  )
}

// ───────────────────────────────── Shared bits ──────────────────────────────

function Header({ icon: Icon, title, sub }) {
  return (
    <div className="flex items-center gap-3.5 pb-4 border-b border-line">
      <span className="w-11 h-11 rounded-lg bg-navy-50 grid place-items-center text-navy-600">
        <Icon size={20} />
      </span>
      <div>
        <div className="font-semibold text-navy-700 text-base">{title}</div>
        <div className="text-sm text-muted">{sub}</div>
      </div>
    </div>
  )
}

function Field({ id, label, required, error, hint, children }) {
  return (
    <div>
      <label className="label" htmlFor={id}>
        {label} {required && <span className="text-ember-600">*</span>}
      </label>
      {children}
      {hint && !error && <div className="help">{hint}</div>}
      {error && <div className="error">{error}</div>}
    </div>
  )
}

function ChipGroup({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const opt = typeof o === 'string' ? { value: o, label: o } : o
        const active = String(value) === String(opt.value)
        return (
          <button
            type="button"
            key={String(opt.value)}
            onClick={() => onChange(opt.value)}
            className={`chip ${active ? 'chip-active' : ''}`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function inputCls(errored) {
  return errored
    ? 'input border-ember-500 focus:border-ember-500 focus:ring-ember-500/15'
    : 'input'
}