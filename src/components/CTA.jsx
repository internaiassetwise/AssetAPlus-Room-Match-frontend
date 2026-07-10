import { Phone, LineChat, ArrowRight, BadgeCheck } from './icons.jsx'
import { Link } from 'react-router-dom'

export default function CTA() {
  return (
    <section id="cta" className="section bg-navy-700 text-white relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-30"
        style={{ backgroundImage: 'radial-gradient(circle at 80% 0%, rgba(249,115,22,0.20), transparent 60%)' }}
      />

      <div className="container-page relative">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 text-white px-4 py-1.5 text-sm font-semibold border border-white/15">
            <BadgeCheck size={16} className="text-ember-400" /> ติดต่อแอดมิน
          </span>

          <h2 className="mt-6 font-bold text-white text-4xl sm:text-5xl lg:text-[60px] leading-[1.2] tracking-tight">
            ทุกเรื่อง ติดต่อ
            <br />
            <span className="text-ember-400">ผ่านแอดมิน</span>
          </h2>

          <p className="mt-6 text-white/75 text-lg sm:text-xl max-w-xl mx-auto leading-relaxed">
            ไม่ว่าจะถามรายละเอียดห้อง นัดชมห้อง ลงประกาศ หรือแก้ไขรายละเอียด
            แอดมินพร้อมดูแลผ่านทุกช่องทาง
          </p>

          <div className="mt-9 flex flex-wrap gap-3 justify-center">
            <a
              href="https://line.me/R/ti/p/@973rjazt"
              target="_blank"
              rel="noreferrer noopener"
              className="btn bg-[#06C755] text-white px-7 py-3.5 font-semibold rounded-xl hover:bg-[#05b34c] text-[17px]"
            >
              <LineChat size={18} /> แชท Line @973rjazt
            </a>
            <a href="tel:021680000" className="btn bg-white text-navy-700 px-7 py-3.5 font-semibold rounded-xl hover:bg-cream-50 text-[17px]">
              <Phone size={18} /> 02-168-0000
            </a>
            <Link to="/contact-admin" className="btn bg-white/10 text-white border border-white/20 px-7 py-3.5 font-semibold rounded-xl hover:bg-white/15 text-[17px]">
              ดูช่องทางติดต่อทั้งหมด <ArrowRight size={18} />
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-2.5 text-white/85 text-base">
            <span className="inline-flex items-center gap-2"><BadgeCheck size={16} className="text-ember-400" /> ไม่มีค่าลงทะเบียน</span>
            <span className="inline-flex items-center gap-2"><BadgeCheck size={16} className="text-ember-400" /> ตอบกลับภายใน 1 วัน</span>
            <span className="inline-flex items-center gap-2"><BadgeCheck size={16} className="text-ember-400" /> สัญญามาตรฐาน</span>
          </div>
        </div>
      </div>
    </section>
  )
}