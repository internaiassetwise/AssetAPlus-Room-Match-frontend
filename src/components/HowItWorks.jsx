import { useState } from 'react'
import { Home, Sparkles, Check, Users, Key } from './icons.jsx'
import { HOW_STEPS } from '../data/content.js'

const TABS = [
  { id: 'landlord', label: 'สำหรับเจ้าของห้อง', icon: Home },
  { id: 'tenant',   label: 'สำหรับผู้เช่า',     icon: Users },
]

const STEPS_BY_TAB = {
  landlord: HOW_STEPS,
  tenant: [
    { num: '01', title: 'ค้นหาห้องที่ใช่',   desc: 'บอกความต้องการ ระบบจะจับคู่ห้องที่เหมาะกับคุณ',         icon: 'sparkles' },
    { num: '02', title: 'นัดชมห้องสะดวก',   desc: 'เลือกวัน-เวลาที่ว่าง ทีมงานพาเข้าชมห้องจริง',         icon: 'home' },
    { num: '03', title: 'เซ็นสัญญาเข้าอยู่', desc: 'สัญญามาตรฐาน ปลอดภัย เข้าอยู่ได้ทันที',              icon: 'key' },
  ],
}

const iconMap = { home: Home, sparkles: Sparkles, check: Check, key: Key }

export default function HowItWorks() {
  const [tab, setTab] = useState('landlord')
  const steps = STEPS_BY_TAB[tab]

  return (
    <section id="how" className="section bg-white">
      <div className="container-page">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="eyebrow-navy">วิธีการ</span>
          <h2 className="mt-4 font-bold text-navy-700 text-4xl sm:text-5xl tracking-tight">
            เริ่มต้นง่ายๆ ใน 3 ขั้นตอน
          </h2>
          <p className="mt-5 text-muted text-lg leading-relaxed">
            เลือกมุมมองที่ตรงกับคุณ เพื่อดูขั้นตอนที่เกี่ยวข้อง
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="inline-flex p-1.5 rounded-xl bg-navy-50 border border-navy-100">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-[15px] font-medium transition-colors ${
                  tab === id
                    ? 'bg-white text-navy-700 shadow-soft'
                    : 'text-muted hover:text-navy-700'
                }`}
              >
                <Icon size={18} /> {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s) => {
            const Icon = iconMap[s.icon] || Home
            return (
              <div key={s.num} className="card card-hover p-7 relative">
                <div className="flex items-center justify-between mb-6">
                  <span className="font-semibold text-sm text-muted tracking-wider">
                    ขั้นตอนที่ {s.num}
                  </span>
                  <div className="w-12 h-12 rounded-lg bg-navy-50 grid place-items-center text-navy-600">
                    <Icon size={22} strokeWidth={1.75} />
                  </div>
                </div>
                <h3 className="font-bold text-navy-700 text-xl mb-3">
                  {s.title}
                </h3>
                <p className="text-muted text-[15px] leading-relaxed">{s.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}