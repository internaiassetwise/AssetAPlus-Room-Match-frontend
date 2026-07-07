import { Phone, LineChat, Sparkles, Bolt, Shield, Heart, ArrowRight } from './icons.jsx'

const PERKS = [
  { icon: Sparkles, title: 'ถ่ายรูปห้องมืออาชีพ', desc: 'ภาพสวย ตรงปก ดึงดูดผู้เช่าเร็วขึ้น 3 เท่า' },
  { icon: Bolt,     title: 'ลงประกาศ 10+ ช่องทาง',   desc: 'Facebook, Line, เว็บพันธมิตร เข้าถึงผู้เช่าทุกกลุ่ม' },
  { icon: Shield,   title: 'คัดกรองผู้เช่า',         desc: 'ตรวจเอกสาร สัญญามาตรฐาน ประกันค่าเช่า' },
  { icon: Heart,    title: 'ดูแลต่อเนื่อง',         desc: 'รายงานทุกเดือน ช่วยเหลือตลอดสัญญา' },
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
            ฝากห้องไว้กับเรา
            <br />
            <span className="text-ember-400">รายได้ต่อเนื่อง</span>
          </h2>
          <p className="mt-5 text-white/75 max-w-md text-lg leading-relaxed">
            เราดูแลครบวงจร ตั้งแต่วันแรกจนผู้เช่าเข้าอยู่
            เจ้าของห้องแค่นั่งดูรายได้เข้าทุกเดือน
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
            <a href="#cta" className="btn btn-ember btn-lg">
              เริ่มฝากห้องวันนี้ <ArrowRight size={18} />
            </a>
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