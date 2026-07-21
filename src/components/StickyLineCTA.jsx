// src/components/StickyLineCTA.jsx — Persistent "ติดต่อแอดมินทาง Line"
// CTA that follows the viewport. Mounted once at the app root.
//
// Visible on every page except admin and login. On /contact-admin itself the
// CTA is hidden because the page already shows the same buttons prominently.

import { useLocation } from 'react-router-dom'
import { LineChat } from './icons.jsx'
import { LINE_OA_DISPLAY, lineUrlWithMessage } from '../config/line.js'

const LINE_URL = lineUrlWithMessage('สวัสดีค่ะ')

function shouldHide(pathname) {
  if (!pathname) return false
  // Pages that render their own prominent CTA — don't double up.
  if (pathname.startsWith('/contact-admin')) return true
  if (pathname.startsWith('/admin'))         return true
  if (pathname.startsWith('/login'))         return true
  return false
}

export default function StickyLineCTA() {
  const { pathname } = useLocation()
  if (shouldHide(pathname)) return null

  return (
    <a
      href={LINE_URL}
      target="_blank"
      rel="noreferrer noopener"
      aria-label="ติดต่อแอดมินทาง Line"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full px-5 py-3 shadow-lift bg-[#06C755] text-white font-semibold hover:bg-[#05b34c] transition-colors"
    >
      <LineChat size={18} />
      <span className="hidden sm:inline">แชท Line {LINE_OA_DISPLAY}</span>
      <span className="sm:hidden">แชท Line</span>
    </a>
  )
}