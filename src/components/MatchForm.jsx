import { useState, useEffect } from 'react'
import { ArrowRight, Home, Bed, Users, Phone, BadgeCheck } from './icons.jsx'
import { api, ApiError } from '../api/client.js'
import { useUserAuth } from '../contexts/UserAuthContext.jsx'

const PROPERTY_TYPES = ['คอนโด', 'ทาวน์เฮ้าส์', 'บ้านเดี่ยว', 'อพาร์ทเมนท์']
const OCCUPATIONS = [
  { value: 'student',        label: 'นักศึกษา' },
  { value: 'professional',   label: 'มืออาชีพ' },
  { value: 'business_owner', label: 'เจ้าของธุรกิจ' },
  { value: 'other',          label: 'อื่นๆ' },
]

// Bedroom values are NUMERIC so backend z.coerce.number() accepts them.
//   สตูดิโอ = 0  (studio, technically zero separate bedrooms)
//   3+      = 3  (anything 3 and above bucket)
const BEDROOMS = [
  { label: 'สตูดิโอ', value: 0 },
  { label: '1',       value: 1 },
  { label: '2',       value: 2 },
  { label: '3+',      value: 3 },
]

const TABS = [
  { id: 'landlord', label: 'ฝากห้อง',     icon: Home  },
  { id: 'tenant',   label: 'หาห้อง',      icon: Users },
]

export default function MatchForm() {
  const [tab, setTab] = useState('landlord')

  return (
    <section id="match" className="section bg-cream-50">
      <div className="container-page">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="eyebrow">แอดมินช่วยต่อให้</span>
          <h2 className="mt-4 font-bold text-navy-700 text-4xl sm:text-5xl tracking-tight">
            ฝากข้อมูล<span className="text-ember-600"> ให้เราจับคู่</span>
          </h2>
          <p className="mt-5 text-muted text-lg leading-relaxed">
            ทั้งเจ้าของห้องและผู้เช่า กรอกแบบฟอร์มสั้นๆ แอดมินจะติดต่อกลับทาง Line ภายใน 24 ชม.
          </p>
        </div>

        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1.5 rounded-xl bg-navy-50 border border-navy-100">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-[15px] font-medium transition-colors ${
                  tab === id
                    ? 'bg-white text-navy-700 shadow-soft'
                    : 'text-muted hover:text-navy-700'
                }`}
              >
                <Icon size={18} /> {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-[0.9fr_1fr] gap-10 lg:gap-14 items-start max-w-6xl mx-auto">
          {/* Copy */}
          <div className="lg:sticky lg:top-28">
            {tab === 'landlord' ? <LandlordCopy /> : <TenantCopy />}
          </div>

          {/* Form */}
          {tab === 'landlord' ? <LandlordForm /> : <TenantPanel />}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────── Copy columns ───────────────────────────────

function LandlordCopy() {
  return (
    <div>
      <h3 className="font-bold text-navy-700 text-3xl sm:text-4xl tracking-tight">
        ฝากห้องให้เรา<span className="text-ember-600"> จับคู่</span>ผู้เช่า
      </h3>
      <p className="mt-5 text-muted text-lg leading-relaxed">
        กรอกแบบฟอร์มสั้นๆ ทีมงานจะติดต่อกลับเพื่อยืนยันรายละเอียด
        และเริ่มกระบวนการหาผู้เช่าให้ทันที
      </p>

      <ul className="check-list mt-7">
        <li>ไม่มีค่าลงทะเบียนล่วงหน้า</li>
        <li>สำเร็จค่อยจ่ายค่าธรรมเนียม</li>
        <li>สัญญามาตรฐาน ปกป้องเจ้าของห้อง</li>
      </ul>

      <figure className="mt-10 border-l-2 border-ember-500 pl-5">
        <blockquote className="text-navy-700 text-lg italic leading-snug">
          "ห้องว่าง 4 เดือน ฝาก Asset A Plus ได้ผู้เช่าภายใน 9 วัน"
        </blockquote>
        <figcaption className="mt-3 text-sm text-muted">
          <span className="font-semibold text-navy-700">คุณพิม</span> · เจ้าของคอนโดย่านอโศก
        </figcaption>
      </figure>
    </div>
  )
}

function TenantCopy() {
  return (
    <div>
      <h3 className="font-bold text-navy-700 text-3xl sm:text-4xl tracking-tight">
        บอกความต้องการ<span className="text-ember-600"> ให้เราหาให้</span>
      </h3>
      <p className="mt-5 text-muted text-lg leading-relaxed">
        บอกทำเล งบประมาณ และไลฟ์สไตล์คร่าวๆ
        เราจะแมตช์ห้องที่ใช่และติดต่อกลับพร้อมนัดชม
      </p>

      <ul className="check-list mt-7">
        <li>ไม่เสียค่าใช้จ่ายในการสมัคร</li>
        <li>เห็นห้องจริงก่อนตัดสินใจ</li>
        <li>เจ้าหน้าที่ช่วยประสานงานจนเข้าอยู่</li>
      </ul>

      <figure className="mt-10 border-l-2 border-ember-500 pl-5">
        <blockquote className="text-navy-700 text-lg italic leading-snug">
          "บอกแค่งบกับย่าน ได้ห้องตรงใจภายใน 3 วัน"
        </blockquote>
        <figcaption className="mt-3 text-sm text-muted">
          <span className="font-semibold text-navy-700">คุณแนน</span> · ผู้เช่าย่านพร้อมพงษ์
        </figcaption>
      </figure>
    </div>
  )
}

// ─────────────────────────────── Landlord form ──────────────────────────────

function LandlordForm() {
  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    propertyType: 'คอนโด', bedrooms: 1, zone: '', note: '',
  })
  const [status, setStatus] = useState('idle')
  const [errors, setErrors] = useState({})

  const update = (field) => (e) => setForm((s) => ({ ...s, [field]: e.target.value }))

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'กรุณากรอกชื่อ'
    if (!form.phone.trim()) e.phone = 'กรุณากรอกเบอร์โทร'
    else if (!/^[0-9+\-\s]{8,}$/.test(form.phone)) e.phone = 'เบอร์โทรไม่ถูกต้อง'
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'อีเมลไม่ถูกต้อง'
    if (!form.zone.trim()) e.zone = 'กรุณากรอกทำเล'
    return e
  }

  async function onSubmit(ev) {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) return
    setStatus('sending')
    try {
      // bedrooms is already numeric from the chip selection
      await api.submitPreference({ ...form, bedrooms: Number(form.bedrooms) })
      setStatus('sent')
    } catch (err) {
      if (err instanceof ApiError && err.code === 'VALIDATION_ERROR' && Array.isArray(err.details)) {
        const fieldErrs = {}
        for (const d of err.details) {
          if (d.path && !fieldErrs[d.path]) fieldErrs[d.path] = d.message
        }
        setErrors(fieldErrs)
      }
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <SentCard
        title="รับข้อมูลเรียบร้อย"
        body="ทีมงานจะติดต่อกลับภายใน 24 ชม. เพื่อยืนยันข้อมูลและนัดสำรวจห้อง"
        asideTitle="สำหรับเจ้าของห้อง"
        onReset={() => { setStatus('idle'); setForm({ name:'',phone:'',email:'',propertyType:'คอนโด',bedrooms:1,zone:'',note:'' }) }}
      />
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="card p-7 sm:p-8 space-y-5">
      <FormHeader icon={Home} title="ฝากห้องของคุณ" sub="ใช้เวลาไม่ถึง 1 นาที" />

      <div className="grid sm:grid-cols-2 gap-4">
        <Field id="l-name"  label="ชื่อ-นามสกุล" required error={errors.name}>
          <input id="l-name" className={inputCls(errors.name)} value={form.name} onChange={update('name')} placeholder="คุณสมชาย ใจดี" />
        </Field>
        <Field id="l-phone" label="เบอร์โทร" required error={errors.phone}>
          <input id="l-phone" inputMode="tel" className={inputCls(errors.phone)} value={form.phone} onChange={update('phone')} placeholder="08x-xxx-xxxx" />
        </Field>
      </div>

      <Field id="l-email" label="อีเมล (ถ้ามี)" error={errors.email}>
        <input id="l-email" type="email" className={inputCls(errors.email)} value={form.email} onChange={update('email')} placeholder="you@example.com" />
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="ประเภทห้อง">
          <ChipGroup options={PROPERTY_TYPES} value={form.propertyType} onChange={(v) => setForm((s) => ({ ...s, propertyType: v }))} />
        </Field>
        <Field label="จำนวนห้องนอน">
          <ChipGroup
            options={BEDROOMS.map(b => ({ value: b.value, label: b.label }))}
            value={form.bedrooms}
            onChange={(v) => setForm((s) => ({ ...s, bedrooms: v }))}
          />
        </Field>
      </div>

      <Field id="l-zone" label="ทำเล / ย่าน" required error={errors.zone}>
        <input id="l-zone" className={inputCls(errors.zone)} value={form.zone} onChange={update('zone')} placeholder="เช่น ทองหล่อ, อโศก, พร้อมพงษ์" />
      </Field>

      <Field id="l-note" label="รายละเอียดเพิ่มเติม">
        <textarea id="l-note" rows={3} className="input resize-none" value={form.note} onChange={update('note')} placeholder="ราคาที่ต้องการ, ขนาดห้อง, จุดเด่น…" />
      </Field>

      <SubmitButton sending={status === 'sending'} errored={status === 'error'} label="ส่งข้อมูลให้ทีมงาน" />
    </form>
  )
}

// ─────────────────────────────── Tenant gate ───────────────────────────────
//
// Tenant tab is gated by Google sign-in. Landlord tab stays anonymous.
// When signed in, we pre-fill name/email from the Google profile — the user
// can override either before submitting.

function TenantPanel() {
  const { user, loading } = useUserAuth()
  if (loading && !import.meta.env.DEV) return <TenantSkeleton />
  // In mock-auth dev mode the user is always signed in. The TenantForm
  // handles a null `user` gracefully (fields just start empty).
  return <TenantForm user={user} />
}

function TenantSkeleton() {
  return (
    <div className="card p-7 sm:p-8 animate-pulse space-y-4">
      <div className="h-12 bg-navy-50 rounded-lg" />
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="h-10 bg-navy-50 rounded-lg" />
        <div className="h-10 bg-navy-50 rounded-lg" />
      </div>
      <div className="h-10 bg-navy-50 rounded-lg" />
      <div className="h-32 bg-navy-50 rounded-lg" />
    </div>
  )
}

// ─────────────────────────────── Tenant form ────────────────────────────────

function TenantForm({ user }) {
  const [form, setForm] = useState(() => ({
    // Pre-fill from Google profile. User can override.
    fullName: user?.name || '',
    phone:    '',
    email:    user?.email || '',
    occupation: 'professional', monthlyIncome: '', moveInDate: '',
    hasPets: false, smoker: false,
    zone: '', propertyType: 'คอนโด',
    minBedrooms: 1, maxBedrooms: 2,
    minRent: '', maxRent: '',
    note: '',
  }))
  const [status, setStatus] = useState('idle')
  const [errors, setErrors] = useState({})

  // If the user logs out + back in with a different account, refresh pre-fill.
  useEffect(() => {
    if (!user) return
    setForm((s) => ({
      ...s,
      fullName: s.fullName || user.name || '',
      email:    s.email    || user.email || '',
    }))
  }, [user?.id])

  const update = (field) => (e) => setForm((s) => ({ ...s, [field]: e.target.value }))

  function validate() {
    const e = {}
    if (!form.fullName.trim()) e.fullName = 'กรุณากรอกชื่อ'
    if (!form.phone.trim()) e.phone = 'กรุณากรอกเบอร์โทร'
    else if (!/^[0-9+\-\s]{8,}$/.test(form.phone)) e.phone = 'เบอร์โทรไม่ถูกต้อง'
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'อีเมลไม่ถูกต้อง'
    return e
  }

  async function onSubmit(ev) {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) return
    setStatus('sending')
    try {
      await api.submitTenantPreference({
        ...form,
        monthlyIncome: form.monthlyIncome === '' ? undefined : Number(form.monthlyIncome),
        minRent: form.minRent === '' ? undefined : Number(form.minRent),
        maxRent: form.maxRent === '' ? undefined : Number(form.maxRent),
        minBedrooms: form.minBedrooms === '' ? undefined : Number(form.minBedrooms),
        maxBedrooms: form.maxBedrooms === '' ? undefined : Number(form.maxBedrooms),
      })
      setStatus('sent')
    } catch (err) {
      if (err instanceof ApiError && err.code === 'VALIDATION_ERROR' && Array.isArray(err.details)) {
        const fieldErrs = {}
        for (const d of err.details) {
          if (d.path && !fieldErrs[d.path]) fieldErrs[d.path] = d.message
        }
        setErrors(fieldErrs)
      }
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <SentCard
        title="ได้รับความสนใจแล้ว"
        body="ทีมงานจะแมตช์ห้องที่ใช่และติดต่อกลับภายใน 24 ชม."
        asideTitle="สำหรับผู้เช่า"
        onReset={() => { setStatus('idle') }}
      />
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="card p-7 sm:p-8 space-y-5">
      <SignedInBanner user={user} />
      <FormHeader icon={Users} title="บอกความต้องการ" sub="ใช้เวลาไม่ถึง 1 นาที" />

      <div className="grid sm:grid-cols-2 gap-4">
        <Field id="t-fullName"  label="ชื่อ-นามสกุล" required error={errors.fullName}>
          <input id="t-fullName" className={inputCls(errors.fullName)} value={form.fullName} onChange={update('fullName')} placeholder="คุณสมหญิง ดีงาม" />
        </Field>
        <Field id="t-phone" label="เบอร์โทร" required error={errors.phone}>
          <input id="t-phone" inputMode="tel" className={inputCls(errors.phone)} value={form.phone} onChange={update('phone')} placeholder="08x-xxx-xxxx" />
        </Field>
      </div>

      <Field id="t-email" label="อีเมล" error={errors.email}>
        <input id="t-email" type="email" className={inputCls(errors.email)} value={form.email} onChange={update('email')} placeholder="you@example.com" />
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="อาชีพ">
          <ChipGroup
            options={OCCUPATIONS.map(o => ({ value: o.value, label: o.label }))}
            value={form.occupation}
            onChange={(v) => setForm((s) => ({ ...s, occupation: v }))}
          />
        </Field>
        <Field id="t-income" label="รายได้ต่อเดือน (฿)">
          <input id="t-income" inputMode="numeric" className="input" value={form.monthlyIncome} onChange={update('monthlyIncome')} placeholder="45000" />
        </Field>
      </div>

      <Field id="t-move" label="วันที่ต้องการย้ายเข้า">
        <input id="t-move" type="date" className="input" value={form.moveInDate} onChange={update('moveInDate')} />
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <ToggleField
          label="มีสัตว์เลี้ยง"
          value={form.hasPets}
          onChange={(v) => setForm((s) => ({ ...s, hasPets: v }))}
        />
        <ToggleField
          label="สูบบุหรี่"
          value={form.smoker}
          onChange={(v) => setForm((s) => ({ ...s, smoker: v }))}
        />
      </div>

      <div className="border-t border-line pt-5">
        <div className="text-sm font-semibold text-navy-700 mb-4">ความต้องการห้อง</div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field id="t-zone" label="ทำเล / ย่าน">
            <input id="t-zone" className="input" value={form.zone} onChange={update('zone')} placeholder="เช่น อโศก, พร้อมพงษ์, ทองหล่อ" />
          </Field>
          <Field label="ประเภทห้อง">
            <ChipGroup options={PROPERTY_TYPES} value={form.propertyType} onChange={(v) => setForm((s) => ({ ...s, propertyType: v }))} />
          </Field>
        </div>

        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <Field id="t-min-bed" label="ห้องนอนขั้นต่ำ">
            <select id="t-min-bed" className="input" value={form.minBedrooms} onChange={update('minBedrooms')}>
              {[0, 1, 2, 3].map((n) => <option key={n} value={n}>{n === 0 ? 'สตูดิโอ' : `${n}+`}</option>)}
            </select>
          </Field>
          <Field id="t-max-bed" label="ห้องนอนสูงสุด">
            <select id="t-max-bed" className="input" value={form.maxBedrooms} onChange={update('maxBedrooms')}>
              {[1, 2, 3, 5].map((n) => <option key={n} value={n}>{n}+</option>)}
            </select>
          </Field>
        </div>

        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <Field id="t-min-rent" label="งบขั้นต่ำ (฿/เดือน)">
            <input id="t-min-rent" inputMode="numeric" className="input" value={form.minRent} onChange={update('minRent')} placeholder="12000" />
          </Field>
          <Field id="t-max-rent" label="งบสูงสุด (฿/เดือน)">
            <input id="t-max-rent" inputMode="numeric" className="input" value={form.maxRent} onChange={update('maxRent')} placeholder="25000" />
          </Field>
        </div>
      </div>

      <Field id="t-note" label="รายละเอียดเพิ่มเติม">
        <textarea id="t-note" rows={3} className="input resize-none" value={form.note} onChange={update('note')} placeholder="เช่น ต้องการใกล้ BTS, มีที่จอดรถ…" />
      </Field>

      <SubmitButton sending={status === 'sending'} errored={status === 'error'} label="ส่งความต้องการให้ทีมงาน" />
    </form>
  )
}

// ───────────────────────────────── Shared bits ──────────────────────────────

// Tiny "signed in as" pill at the top of the tenant form. Reassures the user
// that the Google identity is recognized and where their name/email came from.
function SignedInBanner({ user }) {
  if (!user) return null
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-navy-50 border border-navy-100">
      {user.picture ? (
        <img src={user.picture} alt="" className="w-9 h-9 rounded-full ring-2 ring-white" />
      ) : (
        <div className="w-9 h-9 rounded-full bg-navy-200 grid place-items-center text-navy-700 font-semibold text-sm">
          {(user.name || user.email || '?').slice(0, 1).toUpperCase()}
        </div>
      )}
      <div className="min-w-0">
        <div className="text-sm font-semibold text-navy-700 truncate">{user.name || 'ผู้ใช้ Google'}</div>
        <div className="text-xs text-muted truncate">{user.email}</div>
      </div>
      <span className="ml-auto text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full whitespace-nowrap">
        ลงชื่อเข้าใช้แล้ว
      </span>
    </div>
  )
}

function FormHeader({ icon: Icon, title, sub }) {
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

function Field({ id, label, required, error, children }) {
  return (
    <div>
      <label className="label" htmlFor={id}>
        {label} {required && <span className="text-ember-600">*</span>}
      </label>
      {children}
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
            {opt.value === 0 && opt.label === 'สตูดิโอ' ? <Bed size={14} /> : null}
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function ToggleField({ label, value, onChange }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex gap-2">
        {[true, false].map((v) => (
          <button
            type="button"
            key={String(v)}
            onClick={() => onChange(v)}
            className={`chip flex-1 ${value === v ? 'chip-active' : ''}`}
          >
            {v ? 'ใช่' : 'ไม่'}
          </button>
        ))}
      </div>
    </div>
  )
}

function SubmitButton({ sending, errored, label }) {
  return (
    <>
      <button
        type="submit"
        disabled={sending}
        className="btn btn-primary btn-lg w-full disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {sending ? 'กำลังส่ง…' : label}
        <ArrowRight size={18} />
      </button>
      {errored && (
        <div className="text-ember-700 text-sm text-center">ส่งไม่สำเร็จ กรุณาลองใหม่อีกครั้ง</div>
      )}
      <p className="text-sm text-muted text-center pt-1">
        กดส่งแล้วถือว่ายอมรับนโยบายความเป็นส่วนตัวของเรา
      </p>
    </>
  )
}

function SentCard({ title, body, asideTitle, onReset }) {
  return (
    <div className="card p-10 sm:p-12 text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-50 grid place-items-center mx-auto">
        <BadgeCheck size={32} className="text-emerald-600" />
      </div>
      <h3 className="mt-5 font-bold text-navy-700 text-2xl sm:text-3xl">{title}</h3>
      <p className="mt-3 text-muted text-base leading-relaxed">{body}</p>
      <div className="mt-7 rounded-xl bg-navy-50 border border-navy-100 p-5 text-left">
        <div className="text-sm font-semibold text-navy-700">{asideTitle}</div>
        <div className="mt-2 text-muted text-[15px] leading-relaxed">
          โทร <a href="tel:021680000" className="font-semibold text-navy-700">02-168-0000</a><br />
          หรือแชท Line <span className="font-semibold text-navy-700">@assetaplus</span>
        </div>
      </div>
      <button onClick={onReset} className="mt-7 btn btn-outline">ส่งข้อมูลอีกครั้ง</button>
    </div>
  )
}

function inputCls(errored) {
  return errored
    ? 'input border-ember-500 focus:border-ember-500 focus:ring-ember-500/15'
    : 'input'
}