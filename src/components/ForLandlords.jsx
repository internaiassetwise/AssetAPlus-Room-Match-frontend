import { Phone, LineChat, Sparkles, Bolt, Shield, Heart, ArrowRight } from './icons.jsx'
import { Link } from 'react-router-dom'

const PERKS = [
  { icon: Sparkles, title: 'แอดมินลงประกาศให้', desc: 'บอกรายละเอียดห้องทาง Line แอดมินจัดการลงประกาศและดูแลรูปภาพให้' },
  { icon: Bolt,     title: 'เข้าถึงผู้เช่าคุณภาพ',   desc: 'ฐานผู้เช่าที่ผ่านการคัดกรอง พร้อมเช่า' },
  { icon: Shield,   title: 'ตรวจเอกสารผู้เช่า',       desc: 'สัญญามาตรฐาน ประกันค่าเช่า' },
  { icon: Heart,    title: 'ดูแลต่อเนื่อง',           desc: 'รายงานทุกเดือน ช่วยเหลือตลอดสัญญา' },
]

export default function ForLandlords() {
  return (
    <section id="landlords" className="section bg-navy-700 text-white relative overflow-hidden">
      <div
        aria-hidden
        className="absolute -bottom-20 -left-20 w-[480px] h-[480px] opacity-10 bg-dot-soft"
        style={{ backgroundSize: '28px 28px', maskImage: 'radial-gradient(circle at center, black, transparent 70%)' }}
      />

      <div className="container-page relative grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-20 items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 text-white px-4 py-1.5 text-sm font-semibold tracking-wide border border-white/15">
            สำหรับเจ้าของห้อง
          </span>
          <h2 className="mt-5 font-bold text-4xl sm:text-5xl lg:text-[48px] leading-[1.2] tracking-tight">
            ฝากห้องผ่าน Line
            <br />
            <span className="text-ember-400">แอดมินดูแลให้</span>
          </h2>
          <p className="mt-5 text-white/75 max-w-md text-lg leading-relaxed">
            ติดต่อแอดมินทาง Line เพื่อลงประกาศห้อง แก้ไขรายละเอียด
            และอัปโหลดรูปภาพ เจ้าของห้องแค่นั่งดูรายได้เข้าทุกเดือน
          </p>

          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            {PERKS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl bg-white/5 border border-white/10 p-5 hover:bg-white/10 transition-colors">
                <div className="w-11 h-11 rounded-lg bg-ember-500/90 grid place-items-center mb-4">
                  <Icon size={20} />
                </div>
                <div className="font-bold text-white text-base">{title}</div>
                <div className="text-[15px] text-white/70 mt-2 leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/contact-admin?intent=list-a-room" className="btn btn-line btn-lg">
              <LineChat size={18} /> ลงประกาศผ่าน Line
            </Link>
            <a href="tel:021680000" className="btn bg-white/10 text-white border border-white/20 btn-lg hover:bg-white/15">
              <Phone size={18} /> 02-168-0000
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="aspect-square rounded-3xl bg-white/5 border border-white/10 overflow-hidden">
            <img
              src="/images/hero-pool.jpg"
              alt="Asset A Plus"
              className="w-full h-full object-cover opacity-90"
              loading="lazy"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          </div>
          <div className="absolute -bottom-5 -right-3 sm:-right-6 bg-white rounded-2xl px-6 py-4 shadow-lift">
            <div className="font-bold text-3xl text-navy-700 tabular-nums">+45%</div>
            <div className="text-xs font-medium text-muted uppercase tracking-wider mt-0.5">รายได้เฉลี่ย</div>
          </div>
        </div>
      </div>
    </section>
  )
}