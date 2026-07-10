// src/pages/MyListings.jsx — Landlord's own room gallery.
//
// Under the middleman flow the landlord only sees this page to:
//   1. View how their rooms look publicly (hero photo + admin-approved
//      description + key specs)
//   2. Open the public room page to double-check
//   3. Send more photos to admin via Line
//
// There is no in-app edit (description is admin-only) and no in-app delete
// (admin handles the lifecycle). Action buttons collapse into two Line CTAs
// per room: "อัปโหลดรูปภาพเพิ่มเติม" and "ดูหน้าห้องสาธารณะ".
//
// Layout: compact 1/2/3-column grid so multiple rooms are visible without
// long scrolling. Each card is small but keeps the admin-approved
// description visible (truncated to 3 lines) — that description is the
// primary thing the landlord wants to verify.

import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import DevMockBanner from '../components/DevMockBanner.jsx'
import ContactAdminLineCTA from '../components/ContactAdminLineCTA.jsx'
import { useApi } from '../hooks/useApi.js'
import { api } from '../api/client.js'
import { useUserAuth } from '../contexts/UserAuthContext.jsx'
import { Home, Eye, MapPin, Shield, LineChat } from '../components/icons.jsx'

const STATUS_LABEL = {
  available: 'ว่าง',
  reserved:  'จองแล้ว',
  matched:   'แมตช์แล้ว',
  inactive:  'ปิด',
}
const STATUS_STYLES = {
  available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  reserved:  'bg-amber-50 text-amber-700 border-amber-200',
  matched:   'bg-navy-50 text-navy-700 border-navy-200',
  inactive:  'bg-rose-50 text-rose-700 border-rose-200',
}

const FALLBACK_IMG = '/images/room-navy.jpg'

export default function MyListings() {
  const { user, loading } = useUserAuth()
  const { data: rooms, loading: rmLoading, error } = useApi(
    () => api.listMyListings(),
    []
  )

  if (loading) return null  // Wait for auth check before redirecting.

  return (
    <>
      <DevMockBanner />
      <Navbar />
      <main className="container-page py-10">
        <header className="mb-7">
          <span className="eyebrow-navy"><Home size={14} /> ห้องของฉัน</span>
          <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-navy-700">
            ห้องที่คุณ<span className="text-ember-600"> ปล่อยเช่า</span>
          </h1>
          <p className="mt-2 text-muted text-sm sm:text-base">
            ดูรูปภาพและรายละเอียดที่แอดมินเขียนให้ หากต้องการเปลี่ยนแปลงหรือเพิ่มรูป ติดต่อแอดมินทาง Line
          </p>
        </header>

        {rmLoading && <div className="text-muted text-center py-10">กำลังโหลด…</div>}
        {error && <div className="card p-6 text-ember-700">{error.message}</div>}
        {rooms && rooms.length === 0 && <EmptyState />}
        {rooms && rooms.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rooms.map((r) => (
              <RoomCard key={r.id} room={r} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}

function EmptyState() {
  return (
    <div className="card p-10 text-center">
      <div className="w-16 h-16 rounded-full bg-navy-50 grid place-items-center mx-auto">
        <Home size={28} className="text-navy-600" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-navy-700">ยังไม่มีห้องในระบบ</h3>
      <p className="mt-2 text-muted max-w-sm mx-auto">
        การลงประกาศห้องทำผ่านแอดมินทาง Line เท่านั้น ติดต่อแอดมินเพื่อเริ่มลงประกาศห้องแรกของคุณ
      </p>
      <div className="mt-6 flex justify-center">
        <ContactAdminLineCTA
          intent="list-a-room"
          variant="bare"
          showPhone={false}
          label="ติดต่อแอดมินทาง Line"
        />
      </div>
    </div>
  )
}

/**
 * Compact card. Shows at a glance:
 *   - small thumbnail image + status badge
 *   - title + zone + price
 *   - compact spec strip (นอน / น้ำ / ตร.ม.)
 *   - description preview (3 lines, line-clamp) with "เขียนโดยแอดมิน" badge
 *   - two icon-style buttons: ดูห้อง + อัปโหลดรูป (Line)
 */
function RoomCard({ room }) {
  const status = STATUS_STYLES[room.status] || ''
  const imgSrc = room.image || FALLBACK_IMG

  return (
    <article className="card overflow-hidden flex flex-col">
      {/* Thumbnail */}
      <div className="aspect-[4/3] bg-cream-100 relative overflow-hidden">
        <img
          src={imgSrc}
          alt={room.title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => { e.currentTarget.src = FALLBACK_IMG }}
        />
        {room.status && (
          <span className={`absolute top-2.5 left-2.5 inline-flex items-center text-[10px] font-semibold uppercase tracking-wider border rounded-full px-2 py-0.5 bg-white/90 backdrop-blur-sm ${status}`}>
            {STATUS_LABEL[room.status] || room.status}
          </span>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        {/* Title + zone */}
        <h2 className="font-bold text-navy-700 text-base leading-snug truncate">
          {room.title}
        </h2>
        {room.zone && (
          <div className="mt-1 inline-flex items-center gap-1 text-xs text-muted truncate">
            <MapPin size={12} /> {room.zone}
          </div>
        )}

        {/* Price + spec row */}
        <div className="mt-3 flex items-baseline justify-between gap-2">
          <div className="font-bold text-navy-700 text-lg tabular-nums">
            ฿{Number(room.price || 0).toLocaleString()}
            <span className="text-xs font-normal text-muted"> / ด</span>
          </div>
          <div className="text-[11px] text-muted tabular-nums">
            {room.beds ?? '-'}น · {room.baths ?? '-'}น้ำ · {room.sqm != null ? `${Number(room.sqm).toFixed(0)} ตร.ม.` : '-'}
          </div>
        </div>

        {/* Description preview — admin-written, read-only, line-clamped */}
        <div className="mt-3 pt-3 border-t border-line">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-navy-700 uppercase tracking-wider">รายละเอียด</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              <Shield size={10} /> แอดมิน
            </span>
          </div>
          {room.description ? (
            <p className="text-[13px] text-navy-700 leading-snug line-clamp-3">
              {room.description}
            </p>
          ) : (
            <p className="text-[13px] text-muted italic">
              ยังไม่มีรายละเอียด — แอดมินจะช่วยเขียนให้เมื่อยืนยันห้อง
            </p>
          )}
        </div>

        {/* Actions — compact icon buttons */}
        <div className="mt-auto pt-4 flex items-center gap-2">
          <Link
            to={`/rooms/${room.id}`}
            className="btn btn-outline btn-sm flex-1 justify-center"
            title="ดูหน้าห้องสาธารณะ"
          >
            <Eye size={14} /> ดูห้อง
          </Link>
          <a
            href={`https://line.me/R/ti/p/@973rjazt?text=${encodeURIComponent(
              room.title
                ? `สวัสดีค่ะ จะส่งรูปภาพเพิ่มเติมให้ห้อง "${room.title}" (รหัส ${room.id}) ค่ะ`
                : `สวัสดีค่ะ จะส่งรูปภาพเพิ่มเติมให้ห้องพักค่ะ`
            )}`}
            target="_blank"
            rel="noreferrer noopener"
            className="btn btn-sm flex-1 justify-center bg-[#06C755] text-white hover:bg-[#05b34c]"
            title="อัปโหลดรูปภาพเพิ่มเติมผ่าน Line"
          >
            <LineChat size={14} /> อัปโหลดรูป
          </a>
        </div>
      </div>
    </article>
  )
}