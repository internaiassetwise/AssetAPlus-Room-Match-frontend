// src/components/Landing.jsx — the public landing page composition.
//
// Section order per designer brief (pages 1-8):
//   1. Navbar       — sticky top, white w/ thin border (unchanged)
//   2. Hero         — project image bg, headline + 3 stat tiles
//   3. PersonaFlow  — owns the tenant/landlord toggle, renders:
//        · 3-step journey copy (swaps by persona)
//        · room listings preview (with filters)
//        · tenant lead form OR landlord CTA (swaps by persona)
//   4. FAQ          — 5 items, accordion
//   5. Bottom CTA   — dark navy "ทุกเรื่อง ติดต่อผ่านแอดมิน"
//   6. Footer       — links + phone + line

import Navbar       from './Navbar.jsx'
import Hero         from './Hero.jsx'
import PersonaFlow  from './PersonaFlow.jsx'
import FAQ          from './FAQ.jsx'
import CTA          from './CTA.jsx'
import Footer       from './Footer.jsx'
import StickyLineCTA from './StickyLineCTA.jsx'

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <PersonaFlow />
        <FAQ />
        <CTA />
      </main>
      <Footer />
      <StickyLineCTA />
    </div>
  )
}
