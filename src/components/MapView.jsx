// src/components/MapView.jsx — Leaflet map with room markers + optional click handler.
//
// Tiles: OpenStreetMap (free, no API key) — attribution is required by the
// OSM ToS and is rendered automatically by react-leaflet <TileLayer/>.
// Marker icons: Leaflet's default icon path breaks under bundlers — we wire
// the URL explicitly via the bundled asset (import.meta.url → asset URL).

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { Link } from 'react-router-dom'
import { MapPin } from './icons.jsx'

// Default Leaflet icon URLs are broken under Vite — point them at the bundled
// assets. (Same trick used in most Leaflet + Vite projects.)
import iconUrl     from 'leaflet/dist/images/marker-icon.png'
import iconRetina  from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl   from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl: iconRetina,
  shadowUrl,
  iconSize:    [25, 41],
  iconAnchor:  [12, 41],
  popupAnchor: [1, -34],
  shadowSize:  [41, 41],
})

/** Programmatic viewport sync (used for "fit to rooms" + bounds-change reporting). */
function MapEffect({ rooms, onBoundsChange, fitToRooms, center, zoom }) {
  const map = useMap()

  // Fit-to-rooms on first render (or when rooms change significantly).
  useEffect(() => {
    if (!fitToRooms || !rooms?.length) return
    const pts = rooms.filter((r) => r.lat != null && r.lng != null).map((r) => [r.lat, r.lng])
    if (pts.length) map.fitBounds(pts, { padding: [40, 40], maxZoom: 14 })
  }, [fitToRooms, rooms, map])

  // Apply explicit center/zoom on prop change.
  useEffect(() => {
    if (!center) return
    map.setView(center, zoom ?? map.getZoom())
  }, [center?.[0], center?.[1], zoom, map])

  // Report viewport bounds upward (debounced via useMapEvents).
  useMapEvents({
    moveend: () => onBoundsChange?.(map.getBounds()),
    zoomend: () => onBoundsChange?.(map.getBounds()),
  })

  return null
}

export default function MapView({
  rooms = [],
  center = [13.7563, 100.5018],   // Bangkok center
  zoom   = 11,
  height = 420,
  onMarkerClick,
  onBoundsChange,
  fitToRooms = false,
  pickupMode = false,            // when true, click sets lat/lng on the parent
  onPick,
}) {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-line shadow-card" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom
        className="h-full w-full"
        style={{ background: '#EEF2F7' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEffect
          rooms={rooms}
          center={center}
          zoom={zoom}
          onBoundsChange={onBoundsChange}
          fitToRooms={fitToRooms}
        />

        {/* Picker mode: click anywhere to set location */}
        {pickupMode && <PickHandler onPick={onPick} />}

        {rooms.map((r) => {
          if (r.lat == null || r.lng == null) return null
          return (
            <Marker
              key={r.id}
              position={[r.lat, r.lng]}
              icon={DefaultIcon}
              eventHandlers={{ click: () => onMarkerClick?.(r) }}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold text-navy-700">{r.title}</div>
                  <div className="text-muted mt-0.5">{r.zone_name_th || r.zone_slug}</div>
                  <div className="mt-1.5 text-navy-700 font-semibold">
                    ฿{Number(r.monthly_rent).toLocaleString()}/ด
                  </div>
                  <Link
                    to={`/rooms/${r.id}`}
                    className="mt-2 inline-flex items-center gap-1 text-navy-600 font-medium hover:text-navy-700"
                  >
                    ดูรายละเอียด <MapPin size={12} />
                  </Link>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      {/* Always-visible attribution fallback (Leaflet's own attribution control
          handles this, but we add a sticky Thai caption for first-impression.) */}
      <div className="pointer-events-none absolute bottom-2 left-2 z-[400] text-[10px] text-navy-700/70 bg-white/80 rounded px-2 py-0.5">
        แผนที่โดย OpenStreetMap
      </div>
    </div>
  )
}

/** Sub-component that handles "click to set location" for the room form. */
function PickHandler({ onPick }) {
  useMapEvents({
    click: (e) => onPick?.({ lat: e.latlng.lat, lng: e.latlng.lng }),
  })
  return null
}