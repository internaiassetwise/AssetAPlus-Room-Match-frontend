// src/components/admin/AdminInbox.jsx — Admin Inbox (chat only).
//
// Every conversation a customer has had with the bot, with the ones waiting on a
// human floated to the top. The contact directory used to live here as a second
// tab; it is its own page now (/admin/contacts) because the two are separate
// jobs — answering someone who is waiting vs. looking a person up — and burying
// the directory behind a tab made it invisible on a phone.

import InboxQueue from './InboxQueue.jsx'

export default function AdminInbox() {
  return (
    <section>
      <div className="mb-5 sm:mb-6">
        <span className="eyebrow-navy">แอดมิน</span>
        <h1 className="mt-3 font-bold text-navy-700 text-2xl sm:text-4xl tracking-tight">
          Inbox · ข้อความ
        </h1>
        <p className="mt-2 text-muted max-w-2xl text-sm sm:text-base">
          ทุกแชทของลูกค้าที่คุยกับน้องห้อง — แชทที่รอแอดมินตอบจะอยู่บนสุด
          กด <b>รับเรื่อง</b> เพื่อเข้าไปคุยเองได้เลย
        </p>
      </div>

      <InboxQueue />
    </section>
  )
}
