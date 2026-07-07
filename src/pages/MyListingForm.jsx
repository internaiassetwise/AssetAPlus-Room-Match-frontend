// src/pages/MyListingForm.jsx — Create/edit landlord room.
//
// Uses /my-listings POST or PATCH; map-picker lets the landlord click to set
// lat/lng without typing them manually.

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import DevMockBanner from '../components/DevMockBanner.jsx'
import MapView from '../components/MapView.jsx'
import { api, ApiError } from '../api/client.js'
import { useApi } from '../hooks/useApi.js'
import { Home, ArrowRight, MapPin } from '../components/icons.jsx'

const PROPERTY_TYPES = [
  { value: 'condo',     label: 'คอนโด' },
  { value: 'house',     label: 'บ้านเดี่ยว' },
  { value: 'townhouse', label: 'ทาวน์เฮ้าส์' },
  { value: 'apartment', label: 'อพาร์ทเมนท์' },
  { value: 'studio',    label: 'สตูดิโอ' },
]

export default function MyListingForm({ mode = 'create' }) {
  const navigate = useNavigate()
  const { id }    = useParams()
  const isEdit    = mode === 'edit'

  const { data: existing, loading } = useApi(
    () => isEdit ? api.getMyListing(id) : Promise.resolve(null),
    [id],
  )

  const zones = useApi(() => api.listZones(), [])

  const [form, setForm]     = useState({
    title: '', zoneId: '', propertyType: 'condo',
    bedrooms: 1, bathrooms: 1, sizeSqm: 25,
    monthlyRent: 15000, description: '',
    status: 'available', availableFrom: '', address: '',
    lat: null, lng: null,
    amenities: [], isFeatured: false,
  })
  const [status, setStatus] = useState('idle')
  const [errors, setErrors] = useState({})

  // Hydrate the form once the existing record (if any) is loaded.
  useEffect(() => {
    if (!existing) return
    setForm({
      title: existing.title || '',
      zoneId: existing.zone_id || '',
      propertyType: existing.property_type || 'condo',
      bedrooms: existing.bedrooms ?? 1,
      bathrooms: existing.bathrooms ?? 1,
      sizeSqm: existing.size_sqm ?? 25,
      monthlyRent: existing.monthly_rent ?? 15000,
      description: existing.description || '',
      status: existing.status || 'available',
      availableFrom: existing.available_from || '',
      address: existing.address || '',
      lat: existing.lat ?? null,
      lng: existing.lng ?? null,
      amenities: existing.amenities || [],
      isFeatured: !!existing.is_featured,
    })
  }, [existing])

  function update(k) { return (e) => setForm((s) => ({ ...s, [k]: e.target.value })) }

  function validate() {
    const e = {}
    if (form.title.trim().length < 2) e.title = 'กรุณากรอกชื่อห้อง'
    if (!form.zoneId) e.zoneId = 'กรุณาเลือกทำเล'
    if (!form.monthlyRent || Number(form.monthlyRent) < 1000) e.monthlyRent = 'กรุณากรอกค่าเช่า'
    setErrors(e); return Object.keys(e).length === 0
  }

  async function onSubmit(ev) {
    ev.preventDefault()
    if (!validate()) return
    setStatus('sending')
    try {
      const payload = {
        ...form,
        zoneId: Number(form.zoneId),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        sizeSqm: Number(form.sizeSqm),
        monthlyRent: Number(form.monthlyRent),
        lat: form.lat != null ? Number(form.lat) : undefined,
        lng: form.lng != null ? Number(form.lng) : undefined,
      }
      const saved = isEdit
        ? await api.updateMyListing(id, payload)
        : await api.createMyListing(payload)
      navigate(`/rooms/${saved.id}`)
    } catch (err) {
      if (err instanceof ApiError && err.code === 'VALIDATION_ERROR' && Array.isArray(err.details)) {
        const fieldErrs = {}
        for (const d of err.details) if (d.path && !fieldErrs[d.path]) fieldErrs[d.path] = d.message
        setErrors(fieldErrs)
      }
      setStatus('error')
    }
  }

  if (isEdit && loading) return <div className="container-page py-20 text-center text-muted">กำลังโหลด…</div>

  return (
    <>
      <DevMockBanner />
      <Navbar />
      <main className="container-page py-10 max-w-4xl">
        <header className="mb-6">
          <span className="eyebrow-navy"><Home size={14} /> {isEdit ? 'แก้ไขห้อง' : 'เพิ่มห้องใหม่'}</span>
          <h1 className="mt-3 text-3xl font-bold text-navy-700">
            {isEdit ? 'แก้ไขรายละเอียดห้อง' : 'เพิ่มห้องของคุณ'}
          </h1>
        </header>

        <form onSubmit={onSubmit} className="card p-7 sm:p-8 space-y-5">
          <Field id="f-title" label="ชื่อห้อง" required error={errors.title}>
            <input id="f-title" className={inputCls(errors.title)} value={form.title} onChange={update('title')} />
          </Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field id="f-zone" label="ทำเล" required error={errors.zoneId}>
              <select id="f-zone" className="input" value={form.zoneId} onChange={update('zoneId')}>
                <option value="">เลือกทำเล…</option>
                {(zones.data || []).map((z) => (
                  <option key={z.id} value={z.id}>{z.name_th}</option>
                ))}
              </select>
            </Field>
            <Field id="f-type" label="ประเภทห้อง">
              <select id="f-type" className="input" value={form.propertyType} onChange={update('propertyType')}>
                {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid sm:grid-cols-4 gap-4">
            <Field id="f-bed" label="ห้องนอน">
              <input id="f-bed" type="number" min="0" max="10" className="input" value={form.bedrooms} onChange={update('bedrooms')} />
            </Field>
            <Field id="f-bath" label="ห้องน้ำ">
              <input id="f-bath" type="number" min="0" max="10" className="input" value={form.bathrooms} onChange={update('bathrooms')} />
            </Field>
            <Field id="f-size" label="ขนาด (ตร.ม.)">
              <input id="f-size" type="number" min="1" max="2000" className="input" value={form.sizeSqm} onChange={update('sizeSqm')} />
            </Field>
            <Field id="f-rent" label="ค่าเช่า (฿/ด)" required error={errors.monthlyRent}>
              <input id="f-rent" type="number" min="1000" className={inputCls(errors.monthlyRent)} value={form.monthlyRent} onChange={update('monthlyRent')} />
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field id="f-status" label="สถานะ">
              <select id="f-status" className="input" value={form.status} onChange={update('status')}>
                <option value="available">ว่าง</option>
                <option value="reserved">จองแล้ว</option>
                <option value="matched">แมตช์แล้ว</option>
                <option value="inactive">ปิด</option>
              </select>
            </Field>
            <Field id="f-date" label="ว่างตั้งแต่">
              <input id="f-date" type="date" className="input" value={form.availableFrom} onChange={update('availableFrom')} />
            </Field>
          </div>

          <Field id="f-desc" label="รายละเอียด">
            <textarea id="f-desc" rows={4} className="input resize-none" value={form.description} onChange={update('description')} />
          </Field>

          {/* Map picker for lat/lng — click anywhere to drop a marker */}
          <div>
            <label className="label">
              <span className="inline-flex items-center gap-1.5"><MapPin size={14} /> ที่ตั้ง (คลิกบนแผนที่เพื่อปักหมุด)</span>
            </label>
            <MapView
              rooms={form.lat != null && form.lng != null ? [{ id: 'picked', lat: form.lat, lng: form.lng }] : []}
              center={form.lat != null && form.lng != null ? [form.lat, form.lng] : [13.7563, 100.5018]}
              zoom={form.lat != null ? 14 : 11}
              height={320}
              pickupMode
              onPick={({ lat, lng }) => setForm((s) => ({ ...s, lat, lng }))}
            />
            <div className="grid sm:grid-cols-3 gap-3 mt-3 text-sm">
              <div>
                <label className="label">lat</label>
                <input className="input" inputMode="decimal" value={form.lat ?? ''} onChange={(e) => setForm((s) => ({ ...s, lat: e.target.value }))} placeholder="13.7563" />
              </div>
              <div>
                <label className="label">lng</label>
                <input className="input" inputMode="decimal" value={form.lng ?? ''} onChange={(e) => setForm((s) => ({ ...s, lng: e.target.value }))} placeholder="100.5018" />
              </div>
              <div>
                <label className="label">ที่อยู่ (ข้อความ)</label>
                <input className="input" value={form.address} onChange={update('address')} placeholder="เช่น ทองหล่อ กรุงเทพมหานคร" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={status === 'sending'} className="btn btn-primary btn-lg w-full disabled:opacity-60">
            {status === 'sending' ? 'กำลังบันทึก…' : (isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มห้อง')}
            <ArrowRight size={18} />
          </button>
          {status === 'error' && (
            <div className="text-ember-700 text-sm text-center">บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง</div>
          )}
        </form>
      </main>
      <Footer />
    </>
  )
}

function Field({ id, label, required, error, children }) {
  return (
    <div>
      <label className="label" htmlFor={id}>{label} {required && <span className="text-ember-600">*</span>}</label>
      {children}
      {error && <div className="error">{error}</div>}
    </div>
  )
}

function inputCls(errored) {
  return errored ? 'input border-ember-500 focus:border-ember-500 focus:ring-ember-500/15' : 'input'
}