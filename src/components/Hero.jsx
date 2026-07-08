import { Phone, LineChat, ArrowRight, Shield, Clock, Users, BadgeCheck } from './icons.jsx'
import { Link } from 'react-router-dom'

const TRUST = [
  { num: '2,500+', label: 'ห้องที่ดูแล' },
  { num: '7 วัน',  label: 'เฉลี่ยหาผู้เช่าได้' },
  { num: '98%',    label: 'ความพึงพอใจ' },
]

export default function Hero() {
  return (
    <section id="hero" className="relative bg-gradient-to-b from-white to-cream-50 overflow-hidden">
      <div
        aria-hidden
        className="absolute -top-10 -right-10 w-[480px] h-[480px] opacity-50 bg-dot-soft"
        style={{ backgroundSize: '28px 28px', maskImage: 'radial-gradient(circle at center, black, transparent 70%)' }}
      />

      <div className="container-page py-20 sm:py-24 lg:py-28 grid lg:grid-cols-[1.25fr_0.85fr] gap-12 lg:gap-16 items-center relative">
        <div>
          <div className="eyebrow">
            <BadgeCheck size={16} />
            ฝากห้องกับมืออาชีพ Asset A Plus
          </div>

          <h1 className="mt-6 font-bold text-navy-700 leading-[1.2] text-[44px] sm:text-5xl lg:text-[56px] xl:text-[64px] tracking-tight">
            <span className="block">ฝากห้องให้เราดูแล</span>
            <span className="block text-ember-600">ไม่ต้องลงประกาศเอง</span>
          </h1>

          <p className="mt-7 text-muted text-lg sm:text-xl max-w-xl leading-relaxed">
            มีฐานผู้เช่าคุณภาพพร้อม Match กับห้องว่างของคุณ
            ลดเวลาห้องร้าง เพิ่มรายได้ ด้วยทีมงานมืออาชีพที่ดูแลครบทุกขั้นตอน
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/search" className="btn btn-primary btn-lg">
              ดูห้องว่าง <ArrowRight size={18} />
            </Link>
            <Link to="/contact-admin?intent=list-a-room" className="btn bg-[#06C755] text-white hover:bg-[#05b34c] btn-lg">
              <LineChat size={18} /> พูดคุยกับแอดมินทาง Line
            </Link>
          </div>

          <div className="mt-3 text-sm text-muted">
            หรือโทร <a href="tel:021680000" className="font-medium text-navy-700 hover:underline">02-168-0000</a> · จันทร์–เสาร์ 9:00–18:00
          </div>

          <div className="mt-12 grid grid-cols-3 gap-6 max-w-lg">
            {TRUST.map((t) => (
              <div key={t.label}>
                <div className="font-bold text-3xl text-navy-700 tabular-nums">{t.num}</div>
                <div className="text-sm text-muted mt-1.5 leading-tight">{t.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="card p-7 sm:p-8 shadow-lift">
            <div className="flex items-center justify-between pb-5 border-b border-line">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-lg bg-navy-50 grid place-items-center text-navy-600">
                  <Shield size={20} />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                    บริการจับคู่ผู้เช่า & ดูแลห้อง
                  </div>
                  <div className="font-bold text-navy-700 text-xl mt-1">
                    Asset A Plus
                  </div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> พร้อมดูแล
              </span>
            </div>

            <ul className="mt-6 space-y-3.5">
              {[
                'ช่วยหาผู้เช่า',
                'นัดพาชมห้อง',
                'ประสานงานผู้เช่าให้ครบ',
                'ดูแลห้องก่อนส่งมอบ',
                'ช่วยลดระยะเวลาห้องว่าง',
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-navy-700 text-[15px]">
                  <BadgeCheck size={20} className="text-navy-600 mt-0.5 flex-shrink-0" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>

            <div className="mt-7 pt-6 border-t border-line">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm text-muted">สนใจให้เราดูแล ติดต่อ</div>
                  <a href="tel:021680000" className="block text-navy-700 font-semibold text-xl mt-1">
                    02-168-0000
                  </a>
                  <div className="text-sm text-muted mt-1">
                    หรือ Line: <span className="font-medium text-navy-700">@assetaplus</span>
                  </div>
                </div>
                <a href="#cta" className="btn btn-line">
                  <LineChat size={18} /> แชทเลย
                </a>
              </div>
            </div>
          </div>

          <div className="absolute -top-5 -left-5 hidden sm:flex card p-3.5 shadow-lift gap-2.5 items-center">
            <div className="w-9 h-9 rounded-full bg-emerald-50 grid place-items-center">
              <Clock size={18} className="text-emerald-600" />
            </div>
            <div className="text-sm">
              <div className="font-semibold text-navy-700">เฉลี่ย 7 วัน</div>
              <div className="text-muted">ได้ผู้เช่าใหม่</div>
            </div>
          </div>

          <div className="absolute -bottom-5 -right-5 hidden sm:flex card p-3.5 shadow-lift gap-2.5 items-center">
            <div className="w-9 h-9 rounded-full bg-navy-50 grid place-items-center">
              <Users size={18} className="text-navy-600" />
            </div>
            <div className="text-sm">
              <div className="font-semibold text-navy-700">2,500+ เจ้าของห้อง</div>
              <div className="text-muted">ไว้วางใจเรา</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}