// src/components/admin/AdminRoomForm.jsx — Create + edit a single room.
import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowRight, Home, ImagePlus, Trash, Camera } from '../icons.jsx'
import { useApi } from '../../hooks/useApi.js'
import { api, ApiError } from '../../api/client.js'
import { ZONE_NAMES, projectsForZone } from '../../data/projects.js'

const PROPERTY_TYPES = [
  { value: 'condo',      label: 'คอนโด' },
  { value: 'townhouse',  label: 'ทาวน์เฮ้าส์' },
  { value: 'house',      label: 'บ้านเดี่ยว' },
  { value: 'apartment',  label: 'อพาร์ทเมนท์' },
  { value: 'studio',     label: 'สตูดิโอ' },
]

const ROOM_TYPES = [
  'STUDIO',
  '1 BEDROOM',
  '1 BEDROOM EXCLUSIVE',
  '1 BEDROOM EXTRA',
  '1 BEDROOM PLUS',
]

const VIEW_TYPES = [
  { value: 'pool',    label: 'วิวสระ' },
  { value: 'garden',  label: 'วิวสวน' },
  { value: 'outside', label: 'วิวนอกโครงการ' },
]

const STATUSES = [
  { value: 'available', label: 'ว่าง' },
  { value: 'reserved',  label: 'จองแล้ว' },
  { value: 'matched',   label: 'มีผู้เช่า' },
  { value: 'inactive',  label: 'ปิด' },
]

const EMPTY_FORM = {
  title: '', description: '',
  projectName: '', roomCode: '',
  landlordId: '', zoneId: '',
  propertyType: 'condo',
  roomType: '',
  building: '', floor: '',
  viewType: '',
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
  const { data: rooms }     = useApi(() => api.listRooms({ limit: 200 }), [])
  const { data: existing, loading: loadingRoom } = useApi(
    () => isEdit ? api.getRoom(roomId) : Promise.resolve(null),
    [roomId],
  )

  const [form, setForm]     = useState(EMPTY_FORM)
  const [status, setStatus] = useState('idle')    // idle | sending | sent | error
  const [errors, setErrors] = useState({})

  // ── Photo manager state ────────────────────────────────────────────────
  // stagedPhotos: files picked locally, not yet uploaded. Each item carries
  //   an object URL for thumbnail preview; cleanup runs on unmount + on remove.
  // savedPhotos:  rows already persisted (edit mode only), loaded via the
  //   admin listRoomPhotos endpoint so we get IDs for delete.
  const [stagedPhotos, setStagedPhotos] = useState([])  // [{ key, file, previewUrl, status, error }]
  const [savedPhotos,  setSavedPhotos]  = useState([])  // [{ id, url }]
  const fileInputRef = useRef(null)

  // Hydrate form when editing.
  useEffect(() => {
    if (!isEdit || !existing) return
    setForm({
      title: existing.title || '',
      description: existing.description || '',
      projectName: existing.projectName || '',
      roomCode: existing.roomCode || '',
      landlordId: existing.landlordId ? String(existing.landlordId) : '',
      zoneId:     existing.zoneId     ? String(existing.zoneId)     : (zones?.[0]?.id     ? String(zones[0].id)     : ''),
      propertyType: existing.propertyType || 'condo',
      roomType: existing.roomType || '',
      building: existing.building || '',
      floor: existing.floor || '',
      viewType: existing.viewType || '',
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

  // Load existing photos in edit mode (separate from the room fetch so a
  // failure here doesn't block the form). Best-effort — on error we just leave
  // the gallery empty, which is safe since the room is still editable.
  useEffect(() => {
    if (!isEdit || !roomId) return
    let cancelled = false
    api.listRoomPhotos(roomId)
      .then((rows) => { if (!cancelled) setSavedPhotos(rows.map((r) => ({ id: r.id, url: r.url }))) })
      .catch(() => { /* gallery is best-effort */ })
    return () => { cancelled = true }
  }, [isEdit, roomId])

  // Revoke staged object URLs ONLY on unmount — not on every state change,
  // otherwise thumbnails flicker out as new files are added. We use a ref so
  // the unmount cleanup sees the latest staged list, not the stale closure.
  const stagedRef = useRef(stagedPhotos)
  stagedRef.current = stagedPhotos
  useEffect(() => () => {
    for (const p of stagedRef.current) {
      try { URL.revokeObjectURL(p.previewUrl) } catch { /* already revoked */ }
    }
  }, [])

  const update = (k) => (e) => {
    const v = e?.target?.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((s) => ({ ...s, [k]: v }))
  }

  // ── Photo handlers ───────────────────────────────────────────────────
  // accept="image/*" lets desktops pick any image file; on mobile it opens
  // the native chooser (gallery OR camera). `multiple` lets admins stage
  // several at once. We don't set `capture` because that would skip the
  // gallery option on phones — the user explicitly wanted both to work.
  const MAX_PHOTOS = 12
  const MAX_FILE_SIZE = 10 * 1024 * 1024   // 10 MB, matches server multer limit

  function onPickFiles(fileList) {
    const incoming = Array.from(fileList || [])
    const room = MAX_PHOTOS - stagedPhotos.length - savedPhotos.length
    const accepted = []
    const rejected = []
    for (const f of incoming) {
      if (!f.type.startsWith('image/')) { rejected.push({ name: f.name, reason: 'ไม่ใช่รูปภาพ' }); continue }
      if (f.size > MAX_FILE_SIZE)      { rejected.push({ name: f.name, reason: 'ใหญ่เกิน 10 MB' }); continue }
      if (accepted.length >= room)     { rejected.push({ name: f.name, reason: `เกินจำนวนสูงสุด (${MAX_PHOTOS} รูป)` }); continue }
      accepted.push(f)
    }
    if (accepted.length === 0 && rejected.length > 0) {
      // Surface the first rejection in an alert — these aren't tied to a field.
      window.alert(`ไม่สามารถเพิ่มรูปได้: ${rejected[0].name} — ${rejected[0].reason}`)
    }
    setStagedPhotos((prev) => [
      ...prev,
      ...accepted.map((file) => ({
        key:        `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        status:     'pending',   // pending | uploading | done | error
        error:      null,
      })),
    ])
    // Reset the input so the same file can be re-picked (rare but possible
    // after the user removes the staged entry).
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removeStaged(key) {
    setStagedPhotos((prev) => {
      const target = prev.find((p) => p.key === key)
      if (target) { try { URL.revokeObjectURL(target.previewUrl) } catch { /* noop */ } }
      return prev.filter((p) => p.key !== key)
    })
  }

  async function removeSaved(photoId) {
    if (!roomId) return
    if (!window.confirm('ลบรูปภาพนี้?')) return
    // Optimistic: remove from state immediately so the UI feels instant.
    setSavedPhotos((prev) => prev.filter((p) => p.id !== photoId))
    try {
      await api.deleteRoomPhoto(roomId, photoId)
    } catch (err) {
      // Roll back on failure and tell the user why.
      const row = await api.listRoomPhotos(roomId).catch(() => [])
      const back = row.find((r) => r.id === photoId)
      if (back) setSavedPhotos((prev) => [...prev, { id: back.id, url: back.url }])
      window.alert(`ลบไม่สำเร็จ${err?.code && err.code !== 'NETWORK' ? ` (${err.message})` : ''}`)
    }
  }

  /** Upload every staged photo to a freshly-saved room. Returns count of failures. */
  async function uploadStagedPhotos(roomId) {
    let failures = 0
    for (const photo of stagedPhotos) {
      setStagedPhotos((prev) => prev.map((p) => p.key === photo.key ? { ...p, status: 'uploading' } : p))
      try {
        await api.uploadRoomPhoto(roomId, photo.file)
        setStagedPhotos((prev) => prev.map((p) => p.key === photo.key ? { ...p, status: 'done' } : p))
      } catch (err) {
        failures++
        setStagedPhotos((prev) => prev.map((p) => p.key === photo.key ? { ...p, status: 'error', error: err?.message || 'อัปโหลดล้มเหลว' } : p))
      }
    }
    return failures
  }

  const landlordsEmpty = landlords && landlords.length === 0
  const zonesEmpty     = zones && zones.length === 0

  function validate() {
    const e = {}
    if (!form.title.trim() && !form.projectName.trim()) e.title = 'กรุณากรอกชื่อโครงการหรือชื่อห้อง'
    if (!form.zoneId)                    e.zoneId      = 'กรุณาเลือกโซน'
    if (!form.roomCode.trim())           e.roomCode    = 'กรุณากรอกเลขห้อง'
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
    // Public title = project name only. The room number (roomCode) is captured
    // separately and kept off the public site, so it must NOT be baked into the
    // title. Fall back to roomCode only if no project name was given.
    const title = form.title.trim() || form.projectName.trim() || form.roomCode.trim()
    const body = {
      title,
      description: form.description.trim() || undefined,
      landlordId:  form.landlordId ? Number(form.landlordId) : undefined,
      zoneId:      Number(form.zoneId),
      propertyType: form.propertyType,
      roomType:    form.roomType || undefined,
      projectName: form.projectName.trim() || undefined,
      roomCode:    form.roomCode.trim() || undefined,
      building:    form.building.trim() || undefined,
      floor:       form.floor ? Number(form.floor) : undefined,
      viewType:    form.viewType || undefined,
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
      // 1. Create / update the room first — we need its id to attach photos.
      const saved = isEdit
        ? await api.updateRoom(roomId, body)
        : await api.createRoom(body)
      const targetId = saved?.id ?? roomId

      // 2. Upload any staged photos. Failures are surfaced but don't roll
      //    back the room write — the room exists either way, and the user
      //    can re-add photos via the edit page.
      if (stagedPhotos.length > 0 && targetId) {
        const failures = await uploadStagedPhotos(targetId)
        if (failures > 0) {
          window.alert(`บันทึกห้องแล้ว แต่อัปโหลดรูปไม่สำเร็จ ${failures} จาก ${stagedPhotos.length} รูป — สามารถแก้ไขห้องเพื่อเพิ่มรูปใหม่ได้`)
        }
      }
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

      {zonesEmpty && (
        <div className="mb-6 text-ember-700 text-sm bg-ember-50 border border-ember-200 rounded-lg px-4 py-3">
          ⚠ ยังไม่มีโซนในระบบ — seed ฐานข้อมูลก่อน
        </div>
      )}

      <form onSubmit={onSubmit} noValidate className="card p-7 sm:p-8 space-y-6">
        <Header icon={Home} title="รายละเอียดห้อง" sub={isEdit ? 'แก้ไขข้อมูลและบันทึก' : 'กรอกข้อมูลให้ครบก่อนบันทึก'} />

        {/* 1. โซน + โครงการ (cascading: เลือกโซนก่อน → เห็นโครงการในโซนนั้น) */}
        <div className="grid sm:grid-cols-2 gap-5">
          <Field id="f-zone" label="โซน / ทำเล" required error={errors.zoneId}>
            <select id="f-zone" className={inputCls(errors.zoneId)} value={form.zoneId} onChange={(e) => { update('zoneId')(e); setForm((s) => ({ ...s, projectName: '' })) }}>
              <option value="">— เลือกโซน —</option>
              {(zones || []).map((z) => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
          </Field>
          <Field id="f-project" label="ชื่อโครงการ" required error={errors.title}>
            {(() => {
              const zoneName = (zones || []).find((z) => String(z.id) === form.zoneId)?.name || ''
              const projects = projectsForZone(zoneName)
              if (projects.length > 0) {
                return (
                  <select id="f-project" className={inputCls(errors.title)} value={form.projectName} onChange={update('projectName')}>
                    <option value="">— เลือกโครงการ —</option>
                    {projects.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                )
              }
              return (
                <input id="f-project" className={inputCls(errors.title)} value={form.projectName} onChange={update('projectName')} placeholder={form.zoneId ? 'พิมพ์ชื่อโครงการ' : 'เลือกโซนก่อน'} disabled={!form.zoneId} />
              )
            })()}
          </Field>
        </div>

        {/* รหัสห้อง / เลขห้อง — required */}
        <Field id="f-code" label="รหัสห้อง / เลขห้อง" required error={errors.roomCode}>
          <input id="f-code" className={inputCls(errors.roomCode)} value={form.roomCode} onChange={update('roomCode')} placeholder="เช่น A-301 หรือ 301/1204" />
        </Field>

        <Field id="f-desc" label="คำอธิบาย">
          <textarea id="f-desc" rows={4} className="input resize-none" value={form.description} onChange={update('description')} placeholder="จุดเด่น ทำเล สภาพห้อง ฯลฯ" />
        </Field>

        {/* ประเภทที่พักอาศัย */}
        <div className="grid sm:grid-cols-2 gap-5">
          <Field id="f-prop" label="ประเภทที่พักอาศัย">
            <select id="f-prop" className="input" value={form.propertyType} onChange={update('propertyType')}>
              {PROPERTY_TYPES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </Field>
          <Field id="f-roomtype" label="ประเภทห้อง">
            <select id="f-roomtype" className="input" value={form.roomType} onChange={update('roomType')}>
              <option value="">— เลือกประเภทห้อง —</option>
              {ROOM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
        </div>

        {/* ตึก + ชั้น + วิว */}
        <div className="grid sm:grid-cols-3 gap-5">
          <Field id="f-building" label="ตึก">
            <input id="f-building" className="input" value={form.building} onChange={update('building')} placeholder="เช่น C" />
          </Field>
          <Field id="f-floor" label="ชั้น">
            <input id="f-floor" type="number" min="0" max="200" className="input" value={form.floor} onChange={update('floor')} placeholder="เช่น 3" />
          </Field>
          <Field id="f-view" label="วิว">
            <select id="f-view" className="input" value={form.viewType} onChange={update('viewType')}>
              <option value="">— เลือกวิว —</option>
              {VIEW_TYPES.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
            </select>
          </Field>
        </div>

        {/* 5. ห้องนอน / ห้องน้ำ / พื้นที่ */}
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

        {/* ── Photo manager ──────────────────────────────────────────────
            Works on desktop (file picker) and phone (gallery OR camera via
            accept="image/*"). Photos are staged locally; upload happens on
            submit after the room write succeeds, so a create-mode room gets
            its id first. */}
        <div>
          <label className="label">รูปภาพห้อง</label>
          <PhotoPicker
            stagedPhotos={stagedPhotos}
            savedPhotos={savedPhotos}
            fileInputRef={fileInputRef}
            onPickFiles={onPickFiles}
            onRemoveStaged={removeStaged}
            onRemoveSaved={removeSaved}
            max={MAX_PHOTOS}
            disabled={status === 'sending'}
          />
          <div className="help">
            รองรับ jpg / png / webp · สูงสุด 10 MB/รูป · ไม่เกิน {MAX_PHOTOS} รูป/ห้อง
            <br className="sm:hidden" />
            <span className="text-muted/80"> รูปจะอัปโหลดหลังกด “{isEdit ? 'บันทึกการแก้ไข' : 'สร้างห้อง'}”</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-line">
          <Link to="/admin" className="btn btn-outline">ยกเลิก</Link>
            <button
              type="submit"
              disabled={status === 'sending' || zonesEmpty}
              className="btn btn-primary btn-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === 'sending'
                ? (stagedPhotos.some((p) => p.status === 'uploading') ? 'กำลังอัปโหลดรูป…' : 'กำลังบันทึก…')
                : (isEdit ? 'บันทึกการแก้ไข' : 'สร้างห้อง')}
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

// ───────────────────────────────── Photo picker ──────────────────────────────
//
// Two-zone gallery:
//   • savedPhotos — already-persisted rows (edit mode). ×  removes via API.
//   • stagedPhotos — files picked locally, not yet uploaded. ×  unstages.
//
// Upload happens on form submit (after the room is created/updated) so we
// need a stable roomId first. The input itself is a single <input type=file
// accept="image/*" multiple> — on desktop that opens the OS file picker; on
// mobile browsers it offers a choice of gallery or camera, satisfying the
// "works on PC, Mac, and phone" requirement without a separate capture path.

function PhotoPicker({ stagedPhotos, savedPhotos, fileInputRef, onPickFiles, onRemoveStaged, onRemoveSaved, max, disabled }) {
  const total = stagedPhotos.length + savedPhotos.length
  const remaining = Math.max(0, max - total)

  return (
    <div className="space-y-3">
      {/* Dropzone-style picker button — click opens the file dialog on every
          platform. Drag/drop is intentionally NOT implemented: native mobile
          browsers don't support it consistently, and a button is universally
          discoverable. */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || remaining === 0}
        className="w-full rounded-xl border-2 border-dashed border-navy-200 bg-navy-50/40
                   hover:border-navy-300 hover:bg-navy-50 transition-colors
                   px-4 py-6 sm:py-8 flex flex-col items-center justify-center gap-2
                   text-navy-700 disabled:opacity-50 disabled:cursor-not-allowed
                   min-h-[120px]"
      >
        <span className="w-12 h-12 rounded-full bg-white grid place-items-center text-navy-600 shadow-card">
          <ImagePlus size={22} />
        </span>
        <span className="font-medium text-[15px]">คลิกเพื่อเพิ่มรูปภาพ</span>
        <span className="text-xs text-muted flex items-center gap-1.5">
          <Camera size={13} /> ถ่ายจากกล้องหรือเลือกจากคลังในมือถือ
        </span>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(e) => onPickFiles(e.target.files)}
        aria-label="เลือกไฟล์รูปภาพ"
      />

      {/* Gallery — saved first (the existing photos), then staged. */}
      {(savedPhotos.length > 0 || stagedPhotos.length > 0) && (
        <ul className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
          {savedPhotos.map((p) => (
            <li key={`s-${p.id}`} className="group relative aspect-square rounded-lg overflow-hidden border border-line bg-navy-50">
              <img src={p.url} alt="" className="w-full h-full object-cover" loading="lazy" />
              <RemoveButton onClick={() => onRemoveSaved(p.id)} disabled={disabled} />
            </li>
          ))}
          {stagedPhotos.map((p) => (
            <li
              key={p.key}
              className={`group relative aspect-square rounded-lg overflow-hidden border bg-navy-50 ${
                p.status === 'error' ? 'border-ember-400' : 'border-line'
              }`}
            >
              <img src={p.previewUrl} alt="" className="w-full h-full object-cover" />
              {p.status === 'uploading' && (
                <div className="absolute inset-0 bg-navy-900/55 grid place-items-center text-white text-[11px] font-medium">
                  <Spinner /> อัปโหลด…
                </div>
              )}
              {p.status === 'error' && (
                <div className="absolute inset-x-0 bottom-0 bg-ember-600/90 text-white text-[10px] px-1.5 py-0.5 truncate" title={p.error}>
                  ล้มเหลว
                </div>
              )}
              {p.status === 'pending' && (
                <div className="absolute top-1 left-1 bg-navy-700/85 text-white text-[10px] px-1.5 py-0.5 rounded">
                  รอบันทึก
                </div>
              )}
              {p.status !== 'uploading' && <RemoveButton onClick={() => onRemoveStaged(p.key)} disabled={disabled} />}
            </li>
          ))}
        </ul>
      )}

      {total > 0 && (
        <div className="text-xs text-muted">
          {total}/{max} รูป
        </div>
      )}
    </div>
  )
}

function RemoveButton({ onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="ลบรูปภาพ"
      // Always visible on touch (mobile has no hover); desktop hides until
      // hover/focus for a cleaner gallery look.
      className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-white/90 text-navy-700
                 shadow-card grid place-items-center opacity-100
                 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100
                 transition-opacity hover:bg-ember-50 hover:text-ember-700
                 disabled:cursor-not-allowed"
    >
      <Trash size={14} />
    </button>
  )
}

function Spinner() {
  return (
    <span
      className="inline-block w-3 h-3 mr-1 align-middle border-2 border-white/40 border-t-white rounded-full animate-spin"
      aria-hidden="true"
    />
  )
}