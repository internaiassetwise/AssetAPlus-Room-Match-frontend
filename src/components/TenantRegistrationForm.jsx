// src/components/TenantRegistrationForm.jsx — anonymous tenant lead capture.
//
// 6 fields per brief page 5. POSTs to /api/leads/tenant. No login required.
// On success: green check card. On error: inline message.

import { useState } from 'react'
import { Phone, Home, BadgeCheck, ArrowRight, Search } from './icons.jsx'
import { api, ApiError } from '../api/client.js'
import { TENANT_ZONES, TENANT_PROPERTY_TYPES, TENANT_MOVE_IN_OPTIONS, TENANT_FORM } from '../data/content.js'

function Field({ label, children, hint, required }) {
  return (
    <label className="block">
      <span className="label">
        {label}{required && <span className="text-ember-600 ml-1">*</span>}
      </span>
      {children}
      {hint && <span className="help">{hint}</span>}
    </label>
  )
}

export default function TenantRegistrationForm() {
  const [zone, setZone]               = useState('')
  const [propertyType, setPropType]   = useState('')
  const [moveIn, setMoveIn]           = useState('')
  const [budgetRaw, setBudgetRaw]     = useState('')
  const [fullName, setFullName]       = useState('')
  const [phone, setPhone]             = useState('')
  const [status, setStatus]           = useState('idle')
  const [error, setError]             = useState('')

  async function submit(ev) {
    ev.preventDefault()
    setStatus('sending')
    setError('')
    const monthlyBudget = budgetRaw.trim() ? Number(budgetRaw) : undefined
    try {
      await api.submitTenantLead({
        zone,
        monthlyBudget: Number.isFinite(monthlyBudget) ? monthlyBudget : undefined,
        propertyType,
        moveIn,
        fullName: fullName.trim(),
        phone: phone.trim(),
      })
      setStatus('sent')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'ส่งข้อมูลไม่สำเร็จ')
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 flex items-start gap-3">
        <BadgeCheck size={24} className="text-emerald-600 mt-0.5 shrink-0" />
        <div className="text-emerald-900">
          <div className="font-bold text-lg">{TENANT_FORM.form.success}</div>
          <div className="mt-1 text-sm">เจ้าหน้าที่จะโทรหาคุณ พร้อมข้อมูลห้องที่ใกล้เคียงความต้องการที่สุด</div>
        </div>
      </div>
    )
  }

  const accent = 'border-navy-300 focus:border-navy-600 focus:ring-navy-600/15'
  const accentBtn = 'bg-navy-600 hover:bg-navy-700 active:bg-navy-800'

  return (
    <div className="rounded-2xl border-2 border-navy-200 bg-white p-6 sm:p-7 shadow-card">
      <div className="flex items-center gap-2 text-sm font-semibold text-navy-700 mb-5">
        <Search size={18} /> {TENANT_FORM.eyebrow}
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Field label={TENANT_FORM.form.fields.zone} hint={TENANT_FORM.form.zoneHelp}>
          <div className="flex flex-wrap gap-2">
            {TENANT_ZONES.map((z) => (
              <button
                type="button"
                key={z}
                onClick={() => setZone(zone === z ? '' : z)}
                className={`chip ${zone === z ? 'chip-active' : ''}`}
              >
                {z}
              </button>
            ))}
          </div>
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label={TENANT_FORM.form.fields.budget}>
            <input
              inputMode="numeric"
              type="number"
              min="0"
              className={`input ${accent}`}
              value={budgetRaw}
              onChange={(e) => setBudgetRaw(e.target.value)}
              placeholder="เช่น 15000"
            />
          </Field>

          <Field label={TENANT_FORM.form.fields.propertyType}>
            <select
              className={`input ${accent}`}
              value={propertyType}
              onChange={(e) => setPropType(e.target.value)}
            >
              <option value="">เลือกประเภทห้อง</option>
              {TENANT_PROPERTY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label={TENANT_FORM.form.fields.moveIn}>
          <div className="flex flex-wrap gap-2">
            {TENANT_MOVE_IN_OPTIONS.map((o) => (
              <button
                type="button"
                key={o.value}
                onClick={() => setMoveIn(moveIn === o.value ? '' : o.value)}
                className={`chip ${moveIn === o.value ? 'chip-active' : ''}`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label={TENANT_FORM.form.fields.fullName} required>
            <input
              className={`input ${accent}`}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="เช่น คุณสมชาย"
              required
            />
          </Field>
          <Field label={TENANT_FORM.form.fields.phone} required>
            <input
              inputMode="tel"
              className={`input ${accent}`}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="เช่น 081-234-5678"
              required
              minLength={8}
            />
          </Field>
        </div>

        <p className="text-xs text-muted">{TENANT_FORM.form.requiredHint}</p>

        {error && (
          <div className="text-ember-700 text-sm bg-ember-50 border border-ember-200 rounded px-3 py-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'sending'}
          className={`btn ${accentBtn} text-white w-full disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          <ArrowRight size={18} />
          {status === 'sending' ? 'กำลังส่ง…' : TENANT_FORM.form.submitText}
          <ArrowRight size={16} />
        </button>
      </form>
    </div>
  )
}
