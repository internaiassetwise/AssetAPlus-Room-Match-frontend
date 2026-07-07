import { useState } from 'react'
import { ChevronDown } from './icons.jsx'
import { FAQS } from '../data/content.js'

export default function FAQ() {
  const [open, setOpen] = useState(0)

  return (
    <section id="faq" className="section bg-white">
      <div className="container-page max-w-3xl">
        <div className="text-center mb-12">
          <span className="eyebrow">คำถามที่พบบ่อย</span>
          <h2 className="mt-4 font-bold text-navy-700 text-4xl sm:text-5xl tracking-tight">
            มีคำถาม? <span className="text-ember-600">เรามีคำตอบ</span>
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((item, i) => {
            const isOpen = open === i
            return (
              <div
                key={item.q}
                className={`rounded-xl border transition-colors ${
                  isOpen ? 'border-navy-200 bg-white shadow-soft' : 'border-line bg-white hover:border-navy-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-navy-700 text-lg">{item.q}</span>
                  <span
                    className={`w-9 h-9 rounded-full grid place-items-center border transition-all flex-shrink-0 ${
                      isOpen ? 'bg-navy-700 text-white border-navy-700 rotate-180' : 'bg-white text-navy-700 border-line'
                    }`}
                  >
                    <ChevronDown size={18} />
                  </span>
                </button>
                <div
                  className={`grid transition-all duration-200 ease-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 text-muted text-[15px] leading-relaxed">
                      {item.a}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}