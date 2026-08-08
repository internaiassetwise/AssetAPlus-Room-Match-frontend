import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'
import { MapPin, Bed, Bath, Ruler, Phone, LineChat, ArrowRight, Sparkles, Home, ChevronRight, Shield } from './icons.jsx'
import { useApi } from '../hooks/useApi.js'
import { api } from '../api/client.js'
import { LINE_OA_DISPLAY, LINE_OA_URL } from '../config/line.js'
import Lightbox from './Lightbox.jsx'
import { useContent } from '../i18n/useContent.js'
import { useLang } from '../i18n/LanguageContext.jsx'

export default function RoomDetail() {
  const { UI } = useContent()
  const { lang } = useLang()
  const navigate = useNavigate()
  const { id: idParam } = useParams()
  const id = Number(idParam)
  const { state } = useLocation()
  // Seed data handed over from the listing card via router state. Lets the page
  // render instantly on click-through — no empty "loading" screen flashing the
  // footer up before the room arrives. The fetch still runs to fill in the full
  // photo gallery and any field the card didn't carry.
  const seed = state?.room && state.room.id === id ? state.room : null
  const { data, loading, error } = useApi(
    () => api.getRoom(id),
    [id],
  )
  const room = data || seed

  // The room-specific LINE link. Null while loading or when LINE isn't
  // configured; the button falls back to the plain OA link in both cases.
  const { data: ask } = useApi(() => api.getRoomAskLink(id).catch(() => null), [id])
  const askLink = ask?.available ? ask.url : null
  // Land at the top of the detail page. Without this, navigating from a
  // scrolled-down listing keeps the old scroll offset, which reads as a jump.
  useEffect(() => { window.scrollTo(0, 0) }, [id])
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
            <button onClick={() => navigate('/')} className="hover:text-navy-700">{UI.rdHome}</button>
            <ChevronRight size={14} />
            <button onClick={() => navigate('/#listings')} className="hover:text-navy-700">{UI.rdRooms}</button>
            <ChevronRight size={14} />
            <span className="font-medium text-navy-700 truncate">{room?.title || '…'}</span>
          </nav>
        </div>

        {loading && !room && (
          <div className="container-page min-h-[60vh] grid place-items-center text-center text-muted">{UI.rdLoading}</div>
        )}

        {error && !room && (
          <div className="container-page min-h-[60vh] grid place-items-center text-center"><div>
            <div className="font-bold text-navy-700 text-xl">{UI.rdLoadFailed}</div>
            <div className="text-muted text-base mt-2">{UI.rdTryAgain}</div>
            <button onClick={() => navigate('/')} className="btn btn-outline mt-6">{UI.rdBackHome}</button>
          </div></div>
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
                  <MapPin size={14} /> {lang === 'en' ? (room.zoneEn || room.zone) : room.zone}
                </div>
                <h1 className="mt-2 font-bold text-navy-700 text-3xl sm:text-4xl tracking-tight">
                  {room.title}
                </h1>
                {/* Room number (roomCode) is intentionally NOT shown on the public
                    site — it's an internal identifier used by admins and the LINE bot. */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {room.badge && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-ember-50 text-ember-700 border border-ember-200">
                      {room.badge}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full bg-navy-50 text-navy-700 border border-navy-200">
                    <Home size={12} /> {room.propertyType || UI.rdCondo}
                  </span>
                </div>
              </div>

              <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Spec icon={Bed}   label={UI.rdBedrooms} value={`${room.beds} ${UI.rdUnitRooms}`.trim()} />
                <Spec icon={Bath}  label={UI.rdBathrooms} value={`${room.baths} ${UI.rdUnitRooms}`.trim()} />
                <Spec icon={Ruler} label={UI.rdSize} value={`${room.sqm} ${UI.rdUnitSqm}`} />
                <Spec icon={Home}  label={UI.rdRoomType} value={room.roomType || room.propertyType || '—'} />
                {room.building && <Spec icon={Home} label={UI.rdBuilding} value={room.building} />}
                {room.floor != null && <Spec icon={Home} label={UI.rdFloor} value={`${room.floor}`} />}
                {room.viewType && <Spec icon={Home} label={UI.rdView} value={
                  room.viewType === 'pool' ? UI.rdViewPool : room.viewType === 'garden' ? UI.rdViewGarden : UI.rdViewOutside
                } />}
              </div>

              {room.description && (
                <section className="mt-8">
                  <h2 className="font-bold text-navy-700 text-xl">{UI.rdDetails}</h2>
                  <p className="mt-3 text-navy-700 text-[15px] leading-relaxed whitespace-pre-wrap">{room.description}</p>
                </section>
              )}

              {room.amenities && room.amenities.length > 0 && (
                <section className="mt-8">
                  <h2 className="font-bold text-navy-700 text-xl">{UI.rdAmenities}</h2>
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
                    <div className="font-bold text-navy-700 text-base">{UI.rdManagedTitle}</div>
                    <p className="mt-1.5 text-muted text-[15px] leading-relaxed">
                      {UI.rdManagedBody}
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
                    <span className="text-base font-medium text-muted"> {UI.rdPerMonth}</span>
                  </div>
                  <div className="mt-1 text-sm text-muted">{UI.rdRentNote}</div>
                  {room.availableFrom && (
                    <div className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5">
                      {UI.rdAvailableFrom} {new Date(room.availableFrom).toLocaleDateString(lang === 'en' ? 'en-GB' : 'th-TH', { dateStyle: 'long' })}
                    </div>
                  )}
                </div>

                <div className="border-t border-line pt-4 space-y-3">
                  <a href="tel:021680000" className="btn btn-outline w-full">
                    <Phone size={16} /> {UI.rdCall} 02-168-0000
                  </a>
                  {/* Opens LINE with the question already typed, carrying a
                      signed tag for THIS room — so admin picks the chat up
                      knowing which room it's about instead of having to ask.
                      Falls back to the plain OA link if the server can't mint
                      one (LINE unconfigured), never to a dead button. */}
                  <a
                    href={askLink || LINE_OA_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="btn w-full bg-[#06C755] text-white hover:bg-[#05b34c]"
                  >
                    <LineChat size={16} /> {askLink ? UI.lineAskAboutRoom : `${UI.lineChat} ${LINE_OA_DISPLAY}`}
                  </a>
                  <button onClick={() => navigate('/contact-admin?intent=list-a-room')} className="btn btn-ghost w-full">
                    {UI.rdWantToList} <ArrowRight size={16} />
                  </button>
                </div>

                <div className="pt-4 border-t border-line space-y-2 text-sm text-muted">
                  <div className="flex items-center gap-2">
                    <Shield size={14} className="text-navy-600" /> {UI.rdTrustNoFee}
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield size={14} className="text-navy-600" /> {UI.rdTrustPayOnSuccess}
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield size={14} className="text-navy-600" /> {UI.rdTrustStandardContract}
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