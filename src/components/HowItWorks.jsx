// src/components/HowItWorks.jsx — Tenant-only 3-step flow.
//
// On the landing page we already dedicate the rest of the page to "find a
// room". The landlord equivalent (list a room, admin sets it up) lives on
// /contact-admin and the dashboard. So this section no longer needs a tab
// switcher — it's one straight flow for the hyperlocal tenant.

import { Home, Sparkles, Key } from './icons.jsx'

const STEPS = [
  { num: '01', title: 'เลือกห้องที่ถูกใจ', desc: 'กรองตามย่าน งบประมาณ ขนาดห้อง — หรือเปิดแผนที่ดูรอบๆ ที่อยู่คุณ', icon: Sparkles },
  { num: '02', title: 'นัดชมห้องกับแอดมิน', desc: 'ดูวันที่แอดมินเปิดให้นัดชม แล้วทัก Line เพื่อยืนยันวัน-เวลา',          icon: Home    },
  { num: '03', title: 'ทำสัญญา เข้าอยู่',     desc: 'สัญญามาตรฐาน เซ็นพร้อมเจ้าของห้อง รับกุญแจได้เลย',                       icon: Key     },
]

export default function HowItWorks() {
  return (
    <section id="how" className="section bg-white">
      <div className="container-page">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="eyebrow-navy">วิธีการ</span>
          <h2 className="mt-4 font-bold text-navy-700 text-4xl sm:text-5xl tracking-tight">
            เริ่มต้นง่ายๆ ใน 3 ขั้นตอน
          </h2>
          <p className="mt-5 text-muted text-lg leading-relaxed">
            ตั้งแต่เปิดดูห้องจนเซ็นสัญญา แอดมินดูแลทุกขั้นตอนให้
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map(({ num, title, desc, icon: Icon }) => (
            <div key={num} className="card card-hover p-7 relative">
              <div className="flex items-center justify-between mb-6">
                <span className="font-semibold text-sm text-muted tracking-wider">
                  ขั้นตอนที่ {num}
                </span>
                <div className="w-12 h-12 rounded-lg bg-navy-50 grid place-items-center text-navy-600">
                  <Icon size={22} strokeWidth={1.75} />
                </div>
              </div>
              <h3 className="font-bold text-navy-700 text-xl mb-3">{title}</h3>
              <p className="text-muted text-[15px] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}