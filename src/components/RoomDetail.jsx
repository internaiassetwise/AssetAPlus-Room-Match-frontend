import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'
import { MapPin, Bed, Bath, Ruler, Phone, LineChat, ArrowRight, Sparkles, Home, ChevronRight, Shield } from './icons.jsx'
import { useApi } from '../hooks/useApi.js'
import { api } from '../api/client.js'
import { LINE_OA_DISPLAY, LINE_OA_URL } from '../config/line.js'
import Lightbox from './Lightbox.jsx'

export default function RoomDetail() {
  const navigate = useNavigate()
  const { id: idParam } = useParams()
  const id = Number(idParam)
  const { data: room, loading, error } = useApi(
    () => api.getRoom(id),
    [id],
  )
  const [lightboxIndex, setLightboxIndex] = useState(null)
  // Only show the room's REAL photos — no mock/fallback images.
  const photos = Array.isArray(room?.photos) && room.photos.length
    ? room.photos
    : (room?.image ? [room.image] : [])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-cream-50">
        {/* Breadcrumb */}
        <div className="container-page pt-7">
          <nav className="flex items-center gap-1.5 text-sm text-muted">
            <button onClick={() => navigate('/')} className="hover:text-navy-700">หน้าแรก</button>
            <ChevronRight size={14} />
            <button onClick={() => navigate('/#listings')} className="hover:text-navy-700">ห้องว่าง</button>
            <ChevronRight size={14} />
            <span className="font-medium text-navy-700 truncate">{room?.title || '…'}</span>
          </nav>
        </div>

        {loading && (
          <div className="container-page py-24 text-center text-muted">กำลังโหลดข้อมูลห้อง…</div>
        )}

        {error && (
          <div className="container-page py-24 text-center">
            <div className="font-bold text-navy-700 text-xl">โหลดข้อมูลไม่สำเร็จ</div>
            <div className="text-muted text-base mt-2">กรุณาลองใหม่อีกครั้ง</div>
            <button onClick={() => navigate('/')} className="btn btn-outline mt-6">กลับหน้าแรก</button>
          </div>
        )}

        {room && (
          <article className="container-page py-10 grid lg:grid-cols-[1.4fr_1fr] gap-10 items-start">
            {/* Left: images + content */}
            <div>
              {photos.length > 0 ? (
              <div className="grid grid-cols-[3fr_2fr] grid-rows-2 gap-2 rounded-3xl overflow-hidden h-[340px] sm:h-[460px]">
                {/* Cover photo — left column, full height */}
                <button
                  type="button"
                  onClick={() => setLightboxIndex(0)}
                  className="row-span-2 relative group cursor-zoom-in bg-cream-100"
                >
                  <img
                    src={photos[0]}
                    alt={room.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    decoding="async"
                  />
                  {photos.length > 3 && (
                    <span className="sm:hidden absolute bottom-3 left-3 inline-flex items-center gap-1 text-xs font-semibold text-white bg-navy-900/65 backdrop-blur px-3 py-1.5 rounded-full">
                      📷 {photos.length}
                    </span>
                  )}
                </button>
                {/* Right column — up to 2 thumbnails stacked vertically */}
                {photos.slice(1, 3).map((src, i) => {
                  const isLast = i === Math.min(photos.length - 2, 1)
                  const showOverlay = isLast && photos.length > 3
                  return (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setLightboxIndex(i + 1)}
                      className="relative group cursor-zoom-in bg-cream-100"
                    >
                      <img
                        src={src}
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        loading="lazy"
                        decoding="async"
                      />
                      {showOverlay && (
                        <div className="absolute inset-0 bg-navy-900/60 grid place-items-center group-hover:bg-navy-900/45 transition-colors">
                          <span className="text-white font-bold text-lg flex items-center gap-1.5">
                            📷 {photos.length}
                          </span>
                        </div>
                      )}
                    </button>
                  )
                })}
                {/* Fill empty right-side slots with placeholder if < 3 photos */}
                {photos.length === 1 && (
                  <div className="bg-navy-50 grid place-items-center text-navy-200">
                    <Home size={32} />
                  </div>
                )}
              </div>
              ) : (
                <div className="aspect-[4/3] rounded-3xl bg-navy-50 grid place-items-center text-navy-200">
                  <Home size={64} />
                </div>
              )}

              <div className="mt-7">
                <div className="inline-flex items-center gap-1.5 text-sm font-medium text-muted">
                  <MapPin size={14} /> {room.zone}
                </div>
                <h1 className="mt-2 font-bold text-navy-700 text-3xl sm:text-4xl tracking-tight">
                  {room.title}
                </h1>
                {room.projectName && room.roomCode && (
                  <p className="mt-1 text-muted text-sm">
                    {room.projectName} · ห้อง {room.roomCode}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {room.badge && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-ember-50 text-ember-700 border border-ember-200">
                      {room.badge}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full bg-navy-50 text-navy-700 border border-navy-200">
                    <Home size={12} /> {room.propertyType || 'คอนโด'}
                  </span>
                </div>
              </div>

              <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Spec icon={Bed}   label="ห้องนอน" value={`${room.beds} ห้อง`} />
                <Spec icon={Bath}  label="ห้องน้ำ"  value={`${room.baths} ห้อง`} />
                <Spec icon={Ruler} label="ขนาด"     value={`${room.sqm} ตร.ม.`} />
                <Spec icon={Home}  label="ประเภทห้อง" value={room.roomType || room.propertyType || '—'} />
                {room.building && <Spec icon={Home} label="ตึก" value={room.building} />}
                {room.floor != null && <Spec icon={Home} label="ชั้น" value={`${room.floor}`} />}
                {room.viewType && <Spec icon={Home} label="วิว" value={
                  room.viewType === 'pool' ? 'วิวสระ' : room.viewType === 'garden' ? 'วิวสวน' : 'วิวนอกโครงการ'
                } />}
              </div>

              {room.description && (
                <section className="mt-8">
                  <h2 className="font-bold text-navy-700 text-xl">รายละเอียด</h2>
                  <p className="mt-3 text-navy-700 text-[15px] leading-relaxed whitespace-pre-wrap">{room.description}</p>
                </section>
              )}

              {room.amenities && room.amenities.length > 0 && (
                <section className="mt-8">
                  <h2 className="font-bold text-navy-700 text-xl">สิ่งอำนวยความสะดวก</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {room.amenities.map((a) => (
                      <span key={a} className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-700 bg-navy-50 border border-navy-100 rounded-full px-3 py-1.5">
                        <Sparkles size={12} className="text-ember-500" /> {a}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              <section className="mt-10 rounded-2xl border border-line bg-white p-7">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-navy-50 grid place-items-center text-navy-600 shrink-0">
                    <Shield size={22} />
                  </div>
                  <div>
                    <div className="font-bold text-navy-700 text-base">AssetWise ดูแลให้</div>
                    <p className="mt-1.5 text-muted text-[15px] leading-relaxed">
                      นัดชมห้องฟรี ตรวจเอกสารผู้เช่า ทำสัญญามาตรฐาน
                      และรายงานสถานะห้องทุกเดือนให้เจ้าของห้อง
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* Right: sticky CTA card */}
            <aside className="lg:sticky lg:top-28">
              <div className="card p-7 shadow-lift space-y-5">
                <div>
                  <div className="font-bold text-navy-700 text-3xl sm:text-4xl tabular-nums">
                    ฿{Number(room.price).toLocaleString()}
                    <span className="text-base font-medium text-muted"> / เดือน</span>
                  </div>
                  <div className="mt-1 text-sm text-muted">ค่าเช่ารายเดือน ไม่รวมค่าน้ำค่าไฟ</div>
                  {room.availableFrom && (
                    <div className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5">
                      พร้อมให้เช่าวันที่ {new Date(room.availableFrom).toLocaleDateString('th-TH', { dateStyle: 'long' })}
                    </div>
                  )}
                </div>

                <div className="border-t border-line pt-4 space-y-3">
                  <a href="tel:021680000" className="btn btn-outline w-full">
                    <Phone size={16} /> โทร 02-168-0000
                  </a>
                  <a
                    href={LINE_OA_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="btn w-full bg-[#06C755] text-white hover:bg-[#05b34c]"
                  >
                    <LineChat size={16} /> แชท Line {LINE_OA_DISPLAY}
                  </a>
                  <button onClick={() => navigate('/contact-admin?intent=list-a-room')} className="btn btn-ghost w-full">
                    อยากลงประกาศห้อง? <ArrowRight size={16} />
                  </button>
                </div>

                <div className="pt-4 border-t border-line space-y-2 text-sm text-muted">
                  <div className="flex items-center gap-2">
                    <Shield size={14} className="text-navy-600" /> ไม่มีค่าลงทะเบียน
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield size={14} className="text-navy-600" /> สำเร็จค่อยจ่าย
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield size={14} className="text-navy-600" /> สัญญามาตรฐาน
                  </div>
                </div>
              </div>
            </aside>
          </article>
        )}
      </main>

      <Footer />
      <Lightbox
        images={photos}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onIndex={setLightboxIndex}
      />
    </div>
  )
}

function Spec({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl bg-white border border-line p-4">
      <div className="flex items-center gap-2 text-muted text-sm font-medium">
        <Icon size={16} className="text-navy-600" /> {label}
      </div>
      <div className="mt-1.5 font-bold text-navy-700 text-lg tabular-nums">{value}</div>
    </div>
  )
}