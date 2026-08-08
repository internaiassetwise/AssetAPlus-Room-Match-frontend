// src/i18n/LanguageContext.jsx — which language the marketing site renders in.
//
// Thai is the default and stays the default: this is a Thai rental market, and
// English is the exception a visitor opts into, not something to guess at from
// browser headers. A Thai speaker on an English-locale laptop should still land
// on Thai.
//
// The choice persists in localStorage so it survives navigation and return
// visits — having to re-pick English on every page would be worse than no
// toggle at all.
//
// Deliberately no i18n library: this project doesn't add npm packages, and the
// need here is one boolean and two content bundles.

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'rm.lang'
export const LANGUAGES = ['th', 'en']

const LanguageContext = createContext({ lang: 'th', setLang: () => {}, toggle: () => {} })

function readStored() {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return LANGUAGES.includes(v) ? v : 'th'
  } catch {
    // Private mode / storage disabled — fall back to the default rather than
    // taking the whole page down over a preference.
    return 'th'
  }
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(readStored)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, lang) } catch { /* preference only */ }
    // Screen readers and browser translation prompts key off this; leaving it
    // as "th" while showing English makes both behave badly.
    document.documentElement.lang = lang
  }, [lang])

  const value = useMemo(() => ({
    lang,
    setLang: (next) => LANGUAGES.includes(next) && setLangState(next),
    toggle: () => setLangState((l) => (l === 'th' ? 'en' : 'th')),
  }), [lang])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLang() {
  return useContext(LanguageContext)
}
