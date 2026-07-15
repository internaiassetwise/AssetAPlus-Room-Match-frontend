// src/components/PersonaToggle.jsx — segmented pill that drives the persona
// state for the landing page's body section. No internal state — it is a
// controlled component so the parent can read the value once and pass it
// down to every dependent child.
//
// The active side fills with the persona's brand color (navy for tenant,
// ember for landlord) — gives a visual cue as to which journey is live.

export default function PersonaToggle({ value, onChange }) {
  const OPTIONS = [
    { value: 'tenant',   label: 'ฉันอยากเช่า' },
    { value: 'landlord', label: 'ฉันอยากปล่อยเช่า' },
  ]
  return (
    <div
      role="tablist"
      aria-label="เลือกประเภทผู้ใช้งาน"
      className="inline-flex rounded-full border border-navy-100 bg-white p-1 shadow-soft"
    >
      {OPTIONS.map(({ value: v, label }) => {
        const active = value === v
        const activeClasses =
          v === 'tenant'
            ? 'bg-navy-600 text-white'
            : 'bg-ember-500 text-white'
        return (
          <button
            key={v}
            role="tab"
            type="button"
            aria-selected={active}
            aria-controls={`persona-panel-${v}`}
            onClick={() => onChange(v)}
            className={`px-6 sm:px-8 py-2.5 rounded-full text-sm sm:text-base font-semibold transition-colors duration-150 ${
              active ? activeClasses : 'text-navy-700 hover:bg-navy-50'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
