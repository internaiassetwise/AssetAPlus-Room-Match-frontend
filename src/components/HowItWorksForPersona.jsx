// src/components/HowItWorksForPersona.jsx — three-step journey card row.
// Persona-aware: swaps copy + accent color based on the active persona from
// the parent PersonaFlow wrapper.

import { Sparkles, Phone, Heart, MessageSquare, Check, List, Inbox } from './icons.jsx'
import { HOW_TENANT_STEPS, HOW_LANDLORD_STEPS } from '../data/content.js'

const ICON_MAP = {
  form:   List,
  phone:  Phone,
  heart:  Heart,
  chat:   MessageSquare,
  bell:   Inbox,
  check:  Check,
  sparkles: Sparkles,
}

function Step({ step, accent }) {
  const Icon = ICON_MAP[step.icon] || List
  const accentBg = accent === 'tenant' ? 'bg-navy-50 text-navy-600' : 'bg-ember-50 text-ember-600'
  const accentColor = accent === 'tenant' ? 'text-navy-600' : 'text-ember-600'
  return (
    <div className="card card-hover p-7 relative">
      <div className="flex items-center justify-between mb-6">
        <span className={`font-semibold text-sm tracking-wider ${accentColor}`}>
          ขั้นตอนที่ {step.num}
        </span>
        <div className={`w-12 h-12 rounded-lg grid place-items-center ${accentBg}`}>
          <Icon size={22} strokeWidth={1.75} />
        </div>
      </div>
      <h3 className="font-bold text-navy-700 text-xl mb-3">{step.title}</h3>
      <p className="text-muted text-[15px] leading-relaxed">{step.desc}</p>
    </div>
  )
}

export default function HowItWorksForPersona({ persona }) {
  const steps = persona === 'tenant' ? HOW_TENANT_STEPS : HOW_LANDLORD_STEPS
  return (
    <div
      id={`persona-panel-${persona}`}
      role="tabpanel"
      className="grid md:grid-cols-3 gap-6"
    >
      {steps.map((s) => (
        <Step key={s.num} step={s} accent={persona} />
      ))}
    </div>
  )
}
