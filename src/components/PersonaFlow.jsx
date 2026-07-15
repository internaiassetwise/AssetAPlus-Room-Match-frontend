// src/components/PersonaFlow.jsx — owns the persona state for the landing
// page's body section. Renders the toggle, the persona-specific HowItWorks,
// the persona-specific listings preview, and the persona-specific form/CTA.
//
// Page Feedback: tenant + landlord arms of the `#landlords` band reverted to
// the previous side-by-side layout (copy + bullets on the left, form/image on
// the right). Background tint still swaps between navy (tenant) and ember/
// cream (landlord).

import { useState } from 'react'
import PersonaToggle from './PersonaToggle.jsx'
import HowItWorksForPersona from './HowItWorksForPersona.jsx'
import ListingsForPersona from './ListingsForPersona.jsx'
import TenantRegistrationForm from './TenantRegistrationForm.jsx'
import LandlordListingsCTA from './LandlordListingsCTA.jsx'
import { HOW_SECTION, LISTINGS_SECTION, PERSONA_THEME } from '../data/content.js'

export default function PersonaFlow() {
  const [persona, setPersona] = useState('tenant')
  const heading = HOW_SECTION[persona]

  return (
    <section
      id="persona-section"
      className={`section transition-colors duration-200 ${
        persona === 'tenant' ? 'bg-navy-50/40' : 'bg-cream-50'
      }`}
    >
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <span className={`eyebrow ${persona === 'tenant' ? '' : 'eyebrow-navy'}`}>
              {heading.eyebrow}
            </span>
            <h2 className="mt-4 font-bold text-navy-700 text-3xl sm:text-4xl tracking-tight">
              {heading.title}
            </h2>
            <p className="mt-4 text-muted text-base sm:text-lg leading-relaxed">
              {heading.lede}
            </p>
          </div>
          <PersonaToggle value={persona} onChange={setPersona} />
        </div>

        <div className="mb-16">
          <HowItWorksForPersona persona={persona} />
        </div>

        <ListingsForPersona
          persona={persona}
          eyebrow={LISTINGS_SECTION[persona].eyebrow}
          titleA={LISTINGS_SECTION[persona].titleA}
          titleAccent={LISTINGS_SECTION[persona].titleAccent}
          titleB={LISTINGS_SECTION[persona].titleB}
          searchLabel={LISTINGS_SECTION[persona].searchLabel}
          lastUpdated={LISTINGS_SECTION[persona].lastUpdated}
        />

        <div className="mt-16 grid lg:grid-cols-[1.05fr_1fr] gap-10 items-start">
          {persona === 'tenant' ? (
            <>
              <div>
                <span className="eyebrow-navy">แจ้งความต้องการ</span>
                <h3 className="mt-4 font-bold text-navy-700 text-3xl sm:text-4xl tracking-tight leading-tight">
                  บอกความต้องการ <br /><span className="text-ember-600">เจ้าหน้าที่ติดต่อกลับ</span>
                </h3>
                <p className="mt-5 text-muted text-base sm:text-lg max-w-md leading-relaxed">
                  กรอกความต้องการของคุณ เจ้าหน้าที่จะคัดสรรห้องที่เหมาะสม
                </p>
                <ul className="mt-7 space-y-3 text-navy-700 text-[15px]">
                  <li className="flex items-start gap-2.5">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-navy-600 flex-shrink-0" />
                    กรอกความต้องการ โซน งบ ประเภทห้องที่อยากได้
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-navy-600 flex-shrink-0" />
                    เจ้าหน้าที่ติดต่อกลับ ภายใน 1-2 วันทำการ
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-navy-600 flex-shrink-0" />
                    รับข้อมูลห้องที่เหมาะ ตรงกับความต้องการของคุณโดยตรง
                  </li>
                </ul>
                </div>
              <TenantRegistrationForm />
            </>
          ) : (
            // Page Feedback: Landlord CTA must span the full width of the
            // parent grid (it already has its own 2-col layout inside).
            // Otherwise it sits in column 1 and column 2 stays blank.
            <div className="lg:col-span-2">
              <LandlordListingsCTA />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}