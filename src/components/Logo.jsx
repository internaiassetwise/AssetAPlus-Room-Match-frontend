// src/components/Logo.jsx — Brand wordmark (RoomMatch).
//
// The source PNG is a SQUARE canvas with the "RoomMatch" wordmark centered on a
// white background, so to show the wordmark legibly we crop to a wide band via
// `object-cover` (object-center) instead of letterboxing the whole square. Size
// is controlled by the caller through `className` (give it a wide box, e.g.
// "h-10 w-28"). On dark backgrounds pass `onDark` — the logo's own white
// background then reads as an intentional white chip.

export default function Logo({ className = 'h-9 w-28', onDark = false }) {
  return (
    <img
      src="/logo-roommatch.png"
      alt="RoomMatch"
      draggable={false}
      className={[
        'object-cover object-center select-none',
        onDark ? 'rounded-lg bg-white px-2 py-1' : '',
        className,
      ].join(' ').trim()}
    />
  )
}
