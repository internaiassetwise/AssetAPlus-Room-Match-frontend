// src/i18n/useContent.js — the landing page's copy, in the chosen language.
//
//   const { HERO, FAQS, UI } = useContent()
//
// Swaps the whole content module rather than looking up keys one at a time, so
// a component reads the same names it always did and there is no per-string
// fallback logic to get wrong. The trade is that the two modules must stay
// shape-identical — a key present in one and not the other renders `undefined`
// instead of quietly falling back to Thai. That is deliberate: a visible gap
// gets fixed, a silent fallback ships half-translated forever.
//
// contentParity.test-style check: scripts can diff the two modules' exports.

import * as th from '../data/content.js'
import * as en from '../data/content.en.js'
import { useLang } from './LanguageContext.jsx'

const BUNDLES = { th, en }

export function useContent() {
  const { lang } = useLang()
  return BUNDLES[lang] || th
}
