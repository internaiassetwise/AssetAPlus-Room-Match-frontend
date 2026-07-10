import Navbar    from './Navbar.jsx'
import Hero      from './Hero.jsx'
import Listings  from './Listings.jsx'
import HowItWorks from './HowItWorks.jsx'
import FAQ        from './FAQ.jsx'
import CTA        from './CTA.jsx'
import Footer     from './Footer.jsx'

// Tenant-primary landing. Five sections in scroll order:
//   Hero       – "ห้องว่างในย่านเดียวกับคุณ", primary CTA → /search,
//                secondary CTA → Line @973rjazt
//   Listings   – Zone chip filter + room grid + "ดูบนแผนที่" → /search
//   HowItWorks – 3-step tenant flow (no tab switcher)
//   FAQ        – "มีคำถาม?" answers the common hyperlocal-renter questions
//   CTA        – Line-first banner ("ทุกเรื่อง ติดต่อผ่านแอดมิน")
//
// Sections that used to live here were cut because they pitched landlord
// acquisition (ForLandlords), generic SaaS content (Marquee/PainPoints),
// or duplicated state already in the room detail (MatchForm intake).
// Landlord discovery now goes through /contact-admin (linked in the footer)
// and the persistent StickyLineCTA.
export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Listings />
        <HowItWorks />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}