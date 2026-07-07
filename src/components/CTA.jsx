import { useState } from 'react'
import { Phone, LineChat, ArrowRight, BadgeCheck } from './icons.jsx'
import { api } from '../api/client.js'

export default function CTA() {
  const [contact, setContact] = useState({ name: '', phone: '' })
  const [status, setStatus] = useState('idle')

  async function onSubmit(e) {
    e.preventDefault()
    if (!contact.name.trim() || !contact.phone.trim()) return
    setStatus('sending')
    try {
      await api.submitContact(contact)
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

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
            <BadgeCheck size={16} className="text-ember-400" /> เริ่มวันนี้
          </span>

          <h2 className="mt-6 font-bold text-white text-4xl sm:text-5xl lg:text-[60px] leading-[1.2] tracking-tight">
            ฝากห้องให้เรา
            <br />
            <span className="text-ember-400">ดูแลรายได้</span>
          </h2>

          <p className="mt-6 text-white/75 text-lg sm:text-xl max-w-xl mx-auto leading-relaxed">
            กรอกข้อมูลสั้นๆ ทีมงานจะติดต่อกลับภายใน 24 ชม.
            หรือโทร/แชทหาเราได้เลยตอนนี้
          </p>

          <div className="mt-9 flex flex-wrap gap-3 justify-center">
            <a href="tel:021680000" className="btn bg-white text-navy-700 px-7 py-3.5 font-semibold rounded-xl hover:bg-cream-50 text-[17px]">
              <Phone size={18} /> 02-168-0000
            </a>
            <a
              href="https://line.me/R/ti/p/@assetaplus"
              target="_blank"
              rel="noreferrer noopener"
              className="btn bg-[#06C755] text-white px-7 py-3.5 font-semibold rounded-xl hover:bg-[#05b34c] text-[17px]"
            >
              <LineChat size={18} /> @assetaplus
            </a>
          </div>

          {/* Quick form — cleaner card */}
          <form
            onSubmit={onSubmit}
            className="mt-9 bg-white border border-white/10 rounded-2xl shadow-lift p-3 sm:p-4 flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto"
          >
            <input
              className="input flex-1"
              placeholder="ชื่อ-นามสกุล"
              value={contact.name}
              onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))}
              aria-label="ชื่อ-นามสกุล"
              required
            />
            <input
              className="input flex-1"
              placeholder="เบอร์โทรติดต่อกลับ"
              value={contact.phone}
              onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
              inputMode="tel"
              aria-label="เบอร์โทร"
              required
            />
            <button
              type="submit"
              disabled={status === 'sending'}
              className="btn btn-primary btn-lg disabled:opacity-60"
            >
              {status === 'sent' ? 'ส่งแล้ว ✓' : status === 'sending' ? 'กำลังส่ง…' : <>ติดต่อกลับ <ArrowRight size={16} /></>}
            </button>
          </form>
          {status === 'error' && (
            <div className="mt-3 text-white/80 text-sm">ส่งไม่สำเร็จ กรุณาลองใหม่อีกครั้ง</div>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-2.5 text-white/85 text-base">
            <span className="inline-flex items-center gap-2"><BadgeCheck size={16} className="text-ember-400" /> ไม่มีค่าลงทะเบียน</span>
            <span className="inline-flex items-center gap-2"><BadgeCheck size={16} className="text-ember-400" /> สำเร็จค่อยจ่าย</span>
            <span className="inline-flex items-center gap-2"><BadgeCheck size={16} className="text-ember-400" /> สัญญามาตรฐาน</span>
          </div>
        </div>
      </div>
    </section>
  )
}