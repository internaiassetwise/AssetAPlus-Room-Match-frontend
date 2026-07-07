// src/components/SignInPrompt.jsx — "Sign in with Google" CTA card.
//
// Shown when a logged-out user clicks the หาห้อง (tenant) tab on MatchForm.
// The button is a plain <a href> — server handles the entire OAuth dance
// and 302-redirects back. No JS SDK, no onClick plumbing.

import { Google, ShieldCheck } from './icons.jsx'

export default function SignInPrompt({ googleStartUrl, returnTo }) {
  return (
    <div className="card p-7 sm:p-8 text-center">
      <div className="w-14 h-14 rounded-full bg-navy-50 grid place-items-center mx-auto">
        <ShieldCheck size={28} className="text-navy-700" />
      </div>
      <h2 className="mt-5 font-bold text-navy-700 text-xl sm:text-2xl tracking-tight">
        เข้าสู่ระบบเพื่อฝากความต้องการ
      </h2>
      <p className="mt-3 text-muted text-sm sm:text-base leading-relaxed">
        เพื่อให้ทีมงานจับคู่ห้องกับคุณได้แม่นยำ
        เราจำเป็นต้องรู้จักตัวคุณก่อน
      </p>

      <a
        href={googleStartUrl}
        className="btn btn-primary btn-lg w-full mt-6"
      >
        <Google size={20} />
        ดำเนินการต่อด้วย Google
      </a>

      <p className="mt-4 text-xs text-muted">
        กดปุ่มเพื่อยอมรับนโยบายความเป็นส่วนตัวของเรา
      </p>

      <div className="mt-6 pt-5 border-t border-line text-left">
        <div className="text-sm font-semibold text-navy-700">ทำไมต้องลงชื่อเข้าใช้?</div>
        <ul className="check-list mt-3 text-sm">
          <li>แมตช์ห้องที่ใช่กับคุณได้แม่นยำกว่า</li>
          <li>ทีมงานติดต่อกลับผ่านช่องทางที่คุณเลือก</li>
          <li>ข้อมูลของคุณถูกเก็บเป็นความลับ ไม่แชร์ต่อ</li>
        </ul>
      </div>
    </div>
  )
}