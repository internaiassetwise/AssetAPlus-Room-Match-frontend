// src/components/HowItWorksForPersona.jsx — three-step journey card row.
// Persona-aware: swaps copy + accent color based on the active persona from
// the parent PersonaFlow wrapper.
//
// Annotation #14 — persona hex colors used directly (not Tailwind tokens) so
// the brief's exact brand palette shows up regardless of any theme drift.

import { Phone, Heart, MessageSquare, Check, List, Inbox, Search } from './icons.jsx'
import { HOW_TENANT_STEPS, HOW_LANDLORD_STEPS } from '../data/content.js'

const ICON_MAP = {
  form:   Search,
  phone:  Phone,
  heart:  Heart,
  chat:   MessageSquare,
  bell:   Inbox,
  check:  Check,
}

function Step({ step, persona, theme }) {
  const Icon = ICON_MAP[step.icon] || List
  // Persona-colored number + icon container. tenant = navy, landlord = ember.
  // Safe access — parent may pass undefined theme when reverting to the old
  // PersonaFlow contract (no theme prop on HowItWorksForPersona).
  const accentBg   = theme?.accentSolid   || (persona === 'tenant' ? 'bg-navy-600' : 'bg-ember-500')
  const accentText = theme?.accentText     || (persona === 'tenant' ? 'text-navy-600' : 'text-ember-600')
  return (
    <div className="card card-hover p-7 relative bg-white">
      <div className="flex items-center justify-between mb-6">
        <span className={`font-semibold text-sm tracking-wider ${accentText}`}>
          ขั้นตอนที่ {step.num}
        </span>
        <div className={`w-12 h-12 rounded-lg grid place-items-center text-white ${accentBg}`}>
          <Icon size={22} strokeWidth={1.75} />
        </div>
      </div>
      <h3 className="font-bold text-navy-700 text-xl mb-3">{step.title}</h3>
      <p className="text-muted text-[15px] leading-relaxed">{step.desc}</p>
    </div>
  )
}

export default function HowItWorksForPersona({ persona, theme }) {
  const steps = persona === 'tenant' ? HOW_TENANT_STEPS : HOW_LANDLORD_STEPS
  return (
    <div
      id={`persona-panel-${persona}`}
      role="tabpanel"
      className="grid md:grid-cols-3 gap-6"
    >
      {steps.map((s) => (
        <Step key={s.num} step={s} persona={persona} theme={theme} />
      ))}
    </div>
  )
}