import { Star } from './icons.jsx'
import { useApi } from '../hooks/useApi.js'
import { api } from '../api/client.js'

const FALLBACK_STATS = [
  { num: '2,500+', label: 'ห้องที่ดูแล' },
  { num: '7 วัน',  label: 'เฉลี่ยหาผู้เช่าได้' },
  { num: '98%',    label: 'ความพึงพอใจ' },
  { num: '24/7',   label: 'ทีมงานพร้อมดูแล' },
]

function formatStat(s) {
  if (!s) return []
  return [
    { num: (s.rooms_total ?? 0).toLocaleString() + '+', label: 'ห้องที่ดูแล' },
    { num: '7 วัน',                                       label: 'เฉลี่ยหาผู้เช่าได้' },
    { num: (s.rooms_available ?? 0).toLocaleString(),     label: 'ห้องว่างตอนนี้' },
    { num: Number(s.avg_rating ?? 4.8).toFixed(1) + '★',  label: 'คะแนนเฉลี่ย' },
  ]
}

function initials(name = '') {
  return name
    .replace(/คุณ|นาย|นาง|นางสาว/g, '')
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'A'
}

export default function Stats() {
  const { data: stats } = useApi(() => api.listStats(), [])
  const { data: reviews } = useApi(() => api.listReviews(), [])

  const display = formatStat(stats)
  const items = display.length ? display : FALLBACK_STATS

  return (
    <section className="section bg-white">
      <div className="container-page">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="eyebrow">ความเชื่อมั่น</span>
          <h2 className="mt-4 font-bold text-navy-700 text-4xl sm:text-5xl tracking-tight">
            ตัวเลขที่พูดแทนเรา
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {items.map((s) => (
            <div key={s.label} className="card card-hover p-7 sm:p-8 text-center">
              <div className="font-bold text-4xl sm:text-5xl text-navy-700 tabular-nums">
                {s.num}
              </div>
              <div className="mt-3 text-sm text-muted">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {reviews && reviews.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6">
            {reviews.slice(0, 3).map((r) => (
              <div key={r.name + r.role} className="card card-hover p-7">
                <div className="flex items-center gap-1 text-ember-500 mb-4" aria-label={`คะแนน ${r.rating} จาก 5`}>
                  {Array.from({ length: r.rating || 5 }).map((_, i) => (
                    <Star key={i} size={18} />
                  ))}
                </div>
                <p className="text-navy-700 text-[15px] leading-relaxed">"{r.text}"</p>
                <div className="mt-5 pt-5 border-t border-line flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-navy-50 grid place-items-center font-semibold text-base text-navy-700">
                    {initials(r.name)}
                  </div>
                  <div>
                    <div className="font-bold text-navy-700 text-base">{r.name}</div>
                    <div className="text-sm text-muted">{r.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}