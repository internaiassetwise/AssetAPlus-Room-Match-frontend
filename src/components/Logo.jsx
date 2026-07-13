// src/components/Logo.jsx — Brand wordmark (RoomMatch).
//
// The source PNG is the "RoomMatch" wordmark on a TRANSPARENT background (the
// cream canvas was keyed out), so it composites cleanly over any page colour —
// light (Navbar) or dark (Footer). The wordmark sits in a wide horizontal band
// centred in a square canvas, so we crop to that band via `object-cover`
// (`object-center`) instead of letterboxing the whole square. Size is set by
// the caller through `className` (give it a wide box, e.g. "h-10 w-28").

export default function Logo({ className = 'h-9 w-28' }) {
  return (
    <img
      src="/logo-roommatch.png"
      alt="RoomMatch"
      draggable={false}
      className={['object-cover object-center select-none', className]
        .join(' ')
        .trim()}
    />
  )
}
