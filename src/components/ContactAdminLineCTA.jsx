// src/components/ContactAdminLineCTA.jsx — Reusable Line + phone CTA card.
//
// Renders a small card with a primary "แชท Line" button. The
// `intent` prop picks a Thai-language message that's pre-filled into the Line
// chat when the user opens the URL. `room` optionally enriches the message
// with the room title + id so admin can identify the request quickly.
//
// Used standalone on the ContactAdmin page, nested inside AvailableViewingDates
// on RoomDetail, and rendered as a sticky bar at the bottom of every page.

import { Link } from 'react-router-dom'
import { LineChat, Phone } from './icons.jsx'
import { LINE_OA_DISPLAY, LINE_OA_URL } from '../config/line.js'

const LINE_BASE = LINE_OA_URL

/**
 * Build the prefilled Thai message for each intent.
 * Keep the wording friendly and explicit about which room + id admin should
 * look up.
 */
const MESSAGES = {
  'ask-about-room': (room) =>
    room
      ? `สวัสดีค่ะ มีคำถามเกี่ยวกับห้อง "${room.title}" (รหัส ${room.id}) ค่ะ`
      : `สวัสดีค่ะ มีคำถามเกี่ยวกับห้องพักค่ะ`,
  'view-a-room': (room) =>
    room
      ? `สวัสดีค่ะ สนใจนัดชมห้อง "${room.title}" (รหัส ${room.id}) ค่ะ`
      : `สวัสดีค่ะ สนใจนัดชมห้องพักค่ะ`,
  'list-a-room': () =>
    `สวัสดีค่ะ อยากลงประกาศห้องให้เช่าค่ะ`,
  'edit-description': (room) =>
    room
      ? `สวัสดีค่ะ อยากแก้ไขรายละเอียดห้อง "${room.title}" (รหัส ${room.id}) ค่ะ`
      : `สวัสดีค่ะ อยากแก้ไขรายละเอียดห้องค่ะ`,
  'upload-photos': (room) =>
    room
      ? `สวัสดีค่ะ จะส่งรูปภาพเพิ่มเติมให้ห้อง "${room.title}" (รหัส ${room.id}) ค่ะ`
      : `สวัสดีค่ะ จะส่งรูปภาพเพิ่มเติมให้ห้องพักค่ะ`,
}

function lineUrl(intent, room) {
  const fn    = MESSAGES[intent] || (() => `สวัสดีค่ะ`)
  const text  = encodeURIComponent(fn(room))
  return `${LINE_BASE}?text=${text}`
}

/**
 * @param {object} props
 * @param {'ask-about-room'|'view-a-room'|'list-a-room'|'edit-description'|'upload-photos'} [props.intent='ask-about-room']
 * @param {object} [props.room]     Optional room object — picks up `title` + `id`.
 * @param {string}  [props.label]   Override the button label (defaults to "แชท Line {@aswroommatch}").
 * @param {string}  [props.note]    Optional descriptive line above the button.
 * @param {boolean} [props.showPhone=true]
 * @param {'card'|'row'|'bare'} [props.variant='card']
 *
 * Variants:
 *   - 'card': bordered navy card (default, used inline on RoomDetail sidebar and /contact-admin).
 *   - 'row':  inline-block, no border (used by StickyLineCTA).
 *   - 'bare': just the Line button, no card wrapper (used inside ReadonlyField).
 */
export default function ContactAdminLineCTA({
  intent       = 'ask-about-room',
  room,
  label        = `แชท Line ${LINE_OA_DISPLAY}`,
  note,
  showPhone    = true,
  variant      = 'card',
}) {
  const url = lineUrl(intent, room)
  const phone = 'tel:021680000'

  if (variant === 'bare') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer noopener"
        className="btn bg-[#06C755] text-white hover:bg-[#05b34c]"
      >
        <LineChat size={16} /> {label}
      </a>
    )
  }

  if (variant === 'row') {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <a
          href={url}
          target="_blank"
          rel="noreferrer noopener"
          className="btn bg-[#06C755] text-white hover:bg-[#05b34c] btn-sm"
        >
          <LineChat size={16} /> {label}
        </a>
        {showPhone && (
          <a href={phone} className="btn btn-outline btn-sm">
            <Phone size={16} /> 02-168-0000
          </a>
        )}
      </div>
    )
  }

  return (
    <div className="card p-5 space-y-3 border-navy-200">
      {note && <p className="text-sm text-navy-700 leading-relaxed">{note}</p>}
      <div className="flex flex-wrap gap-2">
        <a
          href={url}
          target="_blank"
          rel="noreferrer noopener"
          className="btn bg-[#06C755] text-white hover:bg-[#05b34c]"
        >
          <LineChat size={16} /> {label}
        </a>
        {showPhone && (
          <a href={phone} className="btn btn-outline">
            <Phone size={16} /> โทร 02-168-0000
          </a>
        )}
      </div>
    </div>
  )
}