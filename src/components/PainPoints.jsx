import { Key, Search, Shield } from './icons.jsx'
import { PAIN_POINTS } from '../data/content.js'

const iconMap = { key: Key, search: Search, shield: Shield }

export default function PainPoints() {
  return (
    <section className="section bg-white">
      <div className="container-page">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="eyebrow">ปัญหาของเจ้าของห้อง</span>
          <h2 className="mt-4 font-bold text-navy-700 text-4xl sm:text-5xl tracking-tight">
            ปล่อยห้องทิ้งไว้
            <br className="sm:hidden" />
            <span className="text-ember-600"> เสียของฟรี</span>
          </h2>
          <p className="mt-5 text-muted text-lg leading-relaxed">
            ทุกวันที่ห้องว่าง คือรายได้ที่หายไป ค่าใช้จ่ายที่ยังต้องจ่าย และความยุ่งยากที่สะสม
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {PAIN_POINTS.map((p) => {
            const Icon = iconMap[p.icon] || Key
            return (
              <div key={p.title} className="card card-hover p-7">
                <div className="w-14 h-14 rounded-xl bg-navy-50 grid place-items-center text-navy-600 mb-6">
                  <Icon size={26} strokeWidth={1.75} />
                </div>
                <h3 className="font-semibold text-navy-700 text-xl mb-3">
                  {p.title}
                </h3>
                <p className="text-muted text-[15px] leading-relaxed">{p.desc}</p>
              </div>
            )
          })}
        </div>

        {/* Solution intro — calmer than before */}
        <div className="mt-12 max-w-2xl mx-auto rounded-2xl border border-navy-100 bg-navy-50/50 p-7 sm:p-10 text-center">
          <span className="inline-block bg-navy-700 text-white text-xs font-semibold tracking-wider uppercase px-3 py-1.5 rounded">
            ทางออก
          </span>
          <p className="mt-4 font-semibold text-navy-700 text-2xl sm:text-3xl">
            Asset A Plus ดูแลครบทุกขั้นตอน
          </p>
          <p className="mt-3 text-muted text-lg">
            ตั้งแต่ถ่ายรูป ลงประกาศ คัดกรองผู้เช่า จนเซ็นสัญญา
          </p>
        </div>
      </div>
    </section>
  )
}