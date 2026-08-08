// src/components/LanguageToggle.jsx — TH / EN switch for the marketing site.
//
// A two-state segmented control rather than a single "EN" button, because a
// lone button doesn't say which language you are currently reading — the user
// has to infer it from the page. Both options visible, current one highlighted.
//
// Labels stay in their own language ("ไทย", not "Thai"): someone who can only
// read English still recognises "ไทย" as the way back, and vice versa.

import { useLang } from '../i18n/LanguageContext.jsx'

const OPTIONS = [
  { code: 'th', label: 'ไทย', aria: 'เปลี่ยนเป็นภาษาไทย' },
  { code: 'en', label: 'EN',  aria: 'Switch to English' },
]

export default function LanguageToggle({ className = '' }) {
  const { lang, setLang } = useLang()

  return (
    <div
      role="group"
      aria-label="Language / ภาษา"
      className={`inline-flex items-center rounded-full border border-line bg-white p-0.5 ${className}`}
    >
      {OPTIONS.map((o) => {
        const active = lang === o.code
        return (
          <button
            key={o.code}
            type="button"
            onClick={() => setLang(o.code)}
            aria-label={o.aria}
            aria-pressed={active}
            // min-h-8 keeps the control usable on touch without making the
            // navbar taller than the buttons beside it.
            className={`min-h-8 px-2.5 rounded-full text-xs font-semibold transition-colors ${
              active ? 'bg-navy-700 text-white' : 'text-navy-700 hover:bg-navy-50'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
