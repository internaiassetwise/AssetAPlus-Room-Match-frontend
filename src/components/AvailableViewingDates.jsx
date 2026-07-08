// src/components/AvailableViewingDates.jsx — Read-only list of admin-set
// viewing dates for a single room. No booking action: the tenant must
// contact admin via Line to request a slot.
//
// Public read — does NOT require auth. Backend endpoint:
//   GET /api/viewings?roomId=<id>&public=1
//
// Used in the RoomDetail sidebar under the price block.

import { useApi } from '../hooks/useApi.js'
import { api } from '../api/client.js'
import { Calendar } from './icons.jsx'
import ContactAdminLineCTA from './ContactAdminLineCTA.jsx'

/** Format an ISO string into a friendly Thai-style date chip: "เสาร์ 12 ก.ค." */
function fmtDate(iso) {
  const d = new Date(iso)
  const days = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.']
  const monthsShort = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
  ]
  return `${days[d.getDay()]} ${d.getDate()} ${monthsShort[d.getMonth()]}`
}

/** Format a viewing's `scheduled_for` as HH:MM (24h). Falls back to the raw input. */
function fmtTime(iso) {
  const m = String(iso).match(/T(\d{2}):(\d{2})/)
  return m ? `${m[1]}:${m[2]}` : ''
}

export default function AvailableViewingDates({ roomId, room }) {
  const { data: items, loading, error } = useApi(
    () => api.listViewings({ roomId, public: 1 }),
    [roomId],
  )

  const dates = items || []

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 text-sm font-semibold text-navy-700">
        <Calendar size={16} /> วันที่เปิดให้นัดชมห้อง
      </div>

      {loading && (
        <div className="text-xs text-muted py-2">กำลังโหลดวันนัดชมห้อง…</div>
      )}

      {!loading && error && (
        <div className="text-xs text-muted py-2">ไม่สามารถโหลดวันนัดชมห้องได้</div>
      )}

      {!loading && !error && dates.length === 0 && (
        <p className="text-sm text-muted leading-relaxed">
          ยังไม่มีวันนัดชมห้องที่กำลังจะมาถึง<br />
          หากสนใจ กรุณาติดต่อแอดมินทาง Line เพื่อนัดวัน
        </p>
      )}

      {!loading && !error && dates.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {dates.map((v) => (
            <li key={v.id}>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full bg-navy-50 text-navy-700 border border-navy-200">
                <Calendar size={12} className="text-navy-600" />
                {fmtDate(v.scheduled_for)}
                {fmtTime(v.scheduled_for) && (
                  <span className="text-navy-500 font-normal">· {fmtTime(v.scheduled_for)} น.</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-muted">
        ต้องการนัดชมห้อง? กรุณาติดต่อแอดมินทาง Line — แอดมินจะช่วยยืนยันวันและเวลาให้
      </p>

      <ContactAdminLineCTA
        intent="view-a-room"
        room={room}
        variant="bare"
      />
    </div>
  )
}