// Central Line OA configuration.
//
// Change the OA handle / display name ONCE here — every component, CTA, and
// content link picks it up. Supports VITE_LINE_OA_URL / VITE_LINE_OA_DISPLAY
// env vars for no-redeploy swaps on Railway/Netlify.

const OA_URL = import.meta.env.VITE_LINE_OA_URL || 'https://line.me/R/ti/p/@422pxplb'
const OA_DISPLAY = import.meta.env.VITE_LINE_OA_DISPLAY || '@aswroommatch'

/** Base friend URL (no query string). */
export const LINE_OA_URL = OA_URL

/** Display handle shown in UI text (the @name users see in the chat header). */
export const LINE_OA_DISPLAY = OA_DISPLAY

/** Build a friend URL with a pre-filled message. */
export function lineUrlWithMessage(message) {
  return `${OA_URL}?text=${encodeURIComponent(message)}`
}
