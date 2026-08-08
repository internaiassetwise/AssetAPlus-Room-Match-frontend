// src/components/StickyLineCTA.jsx — Persistent {UI.lineContactAdmin}
// CTA that follows the viewport. Mounted once at the app root.
//
// Visible on every page except admin and login. On /contact-admin itself the
// CTA is hidden because the page already shows the same buttons prominently.

import { useLocation } from 'react-router-dom'
import { LineChat } from './icons.jsx'
import { LINE_OA_DISPLAY, lineUrlWithMessage } from '../config/line.js'
import { useContent } from '../i18n/useContent.js'

function shouldHide(pathname) {
  if (!pathname) return false
  // Pages that render their own prominent CTA — don't double up.
  if (pathname.startsWith('/contact-admin')) return true
  if (pathname.startsWith('/admin'))         return true
  if (pathname.startsWith('/login'))         return true
  // Room detail already carries two: the navbar's OA link and, more usefully,
  // "สอบถามห้องนี้ทาง Line" which arrives attached to the room. A third floating
  // one competes with the specific button and wins on visual weight.
  if (/^\/rooms\/[^/]+\/?$/.test(pathname))   return true
  return false
}

export default function StickyLineCTA() {
  const { UI } = useContent()
  // Built here, not at module scope: the greeting is translated, and a
  // module-level constant would freeze whichever language loaded first.
  const LINE_URL = lineUrlWithMessage(UI.lineGreeting)
  const { pathname } = useLocation()
  if (shouldHide(pathname)) return null

  return (
    <a
      href={LINE_URL}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={UI.lineContactAdmin}
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full px-5 py-3 shadow-lift bg-[#06C755] text-white font-semibold hover:bg-[#05b34c] transition-colors"
    >
      <LineChat size={18} />
      <span className="hidden sm:inline">{UI.lineChat} {LINE_OA_DISPLAY}</span>
      <span className="sm:hidden">{UI.lineChat}</span>
    </a>
  )
}