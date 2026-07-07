import Navbar       from './Navbar.jsx'
import Hero         from './Hero.jsx'
import Marquee      from './Marquee.jsx'
import PainPoints   from './PainPoints.jsx'
import MatchForm    from './MatchForm.jsx'
import HowItWorks   from './HowItWorks.jsx'
import Listings     from './Listings.jsx'
import Stats        from './Stats.jsx'
import ForLandlords from './ForLandlords.jsx'
import FAQ          from './FAQ.jsx'
import CTA          from './CTA.jsx'
import Footer       from './Footer.jsx'

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Marquee />
        <PainPoints />
        <MatchForm />
        <HowItWorks />
        <Listings />
        <Stats />
        <ForLandlords />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}