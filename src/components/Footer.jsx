import { Phone, LineChat, ArrowRight } from './icons.jsx'
import { Link } from 'react-router-dom'
import Logo from './Logo.jsx'

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-white">
      <div className="container-page py-16 sm:py-20">
        <div className="grid md:grid-cols-4 gap-10 items-start">
          <div className="md:col-span-2">
            <div className="mb-4">
              <Logo onDark className="h-10 w-28" />
            </div>
            <p className="text-white/65 text-[15px] max-w-xs leading-relaxed">
              บริการจับคู่ผู้เช่าและดูแลห้องเช่าโดยทีมงานมืออาชีพ Asset Wise
            </p>

            {/* Middleman-flow entry point — every "talk to a human" question
                ends up here. */}
            <Link
              to="/contact-admin"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-ember-400 hover:text-ember-300"
            >
              <LineChat size={16} /> ติดต่อแอดมินทาง Line
              <ArrowRight size={14} />
            </Link>
          </div>

          <div>
            <div className="font-semibold mb-4 text-base">ติดต่อเรา</div>
            <ul className="space-y-2.5 text-[15px] text-white/70">
              <li className="flex items-center gap-2.5"><Phone size={16} /> <a href="tel:021680000" className="hover:text-white">02-168-0000</a></li>
              <li className="flex items-center gap-2.5"><LineChat size={16} /> <a href="https://line.me/R/ti/p/@973rjazt" target="_blank" rel="noreferrer noopener" className="hover:text-white">@973rjazt</a></li>
              <li>จันทร์–เสาร์ 9:00–18:00</li>
            </ul>
          </div>

          <div>
            <div className="font-semibold mb-4 text-base">เมนู</div>
            <ul className="space-y-2.5 text-[15px] text-white/70">
              <li><a href="/#hero"      className="hover:text-white">หน้าแรก</a></li>
              <li><Link to="/search"    className="hover:text-white">ค้นหาห้อง</Link></li>
              <li><a href="/#how"       className="hover:text-white">วิธีการ</a></li>
              <li><a href="/#listings"  className="hover:text-white">ห้องว่าง</a></li>
              <li><a href="/#landlords" className="hover:text-white">สำหรับเจ้าของห้อง</a></li>
              <li><a href="/#faq"       className="hover:text-white">คำถาม</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-7 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="font-display font-bold tracking-[0.2em] text-white/85 text-base">ASSETWISE</div>
          <div className="text-sm text-white/55">© {new Date().getFullYear()} Asset Wise PCL. All rights reserved.</div>
        </div>
      </div>
    </footer>
  )
}