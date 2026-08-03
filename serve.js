// serve.js — Production static server for the Vite SPA.
// Serves dist/ with aggressive caching on /assets/*, no cache on index.html, and
// an SPA fallback so React Router (and the /admin/* section) keeps working after
// a hard refresh. Zero runtime dependencies — uses only Node built-ins.
//
// It also reverse-proxies /api/* to the backend when API_ORIGIN is set. That is
// what makes login work on iPhone: the frontend and backend live on different
// *.up.railway.app subdomains, and `up.railway.app` is a public suffix, so the
// browser treats them as different sites and the session cookie is third-party.
// Safari has blocked third-party cookies outright since 2020 — SameSite=None
// does not exempt it — so iPhone users could never stay logged in while Chrome
// was fine. Proxying puts the API on the page's own origin, which makes the
// cookie first-party and the problem disappears.
//
// Health check: GET /health → "ok" (Railway uptime / monitoring)
// Run: node serve.js   (PORT env, defaults to 3000)

import http  from 'node:http'
import https from 'node:https'
import fs    from 'node:fs'
import path  from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST      = path.join(__dirname, 'dist')
const INDEX     = path.join(DIST, 'index.html')
const PORT      = Number(process.env.PORT) || 3000

// e.g. https://room-match-api-production.up.railway.app — no trailing slash.
// Unset → no proxying (the SPA must then be built with VITE_API_BASE).
const API_ORIGIN = (process.env.API_ORIGIN || '').replace(/\/+$/, '')
const API_URL    = API_ORIGIN ? new URL(API_ORIGIN) : null
// Uploads can be slow on mobile data; well above the API's own 8s default.
const PROXY_TIMEOUT_MS = Number(process.env.API_PROXY_TIMEOUT_MS) || 60_000

const MIME = {
  '.html':  'text/html; charset=utf-8',
  '.js':    'application/javascript; charset=utf-8',
  '.mjs':   'application/javascript; charset=utf-8',
  '.css':   'text/css; charset=utf-8',
  '.svg':   'image/svg+xml',
  '.png':   'image/png',
  '.jpg':   'image/jpeg',
  '.jpeg':  'image/jpeg',
  '.webp':  'image/webp',
  '.avif':  'image/avif',
  '.ico':   'image/x-icon',
  '.json':  'application/json; charset=utf-8',
  '.txt':   'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
  '.map':   'application/json; charset=utf-8',
}

/** Resolve a request path to a static file in dist/. Returns null if none. */
function resolveStatic(reqPath) {
  // Strip leading slashes, block path traversal
  const safe = path.normalize(reqPath).replace(/^[/\\]+/, '')
  if (!safe || safe.includes('..')) return null
  const full = path.join(DIST, safe)
  // Pin to dist/
  if (!full.startsWith(DIST)) return null
  try {
    const st = fs.statSync(full)
    if (st.isFile()) return full
  } catch { /* not found */ }
  return null
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers)
  res.end(body)
}

function serveFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase()
  const headers = { 'Content-Type': MIME[ext] || 'application/octet-stream' }
  if (ext === '.html') {
    headers['Cache-Control'] = 'no-cache'
  } else if (filePath.includes(`${path.sep}assets${path.sep}`)) {
    // Hashed Vite assets — content-addressed by filename
    headers['Cache-Control'] = 'public, max-age=31536000, immutable'
  }
  fs.readFile(filePath, (err, data) => {
    if (err) return send(res, 404, 'Not found', { 'Content-Type': 'text/plain' })
    send(res, 200, data, headers)
  })
}

/**
 * Reverse-proxy one request to API_ORIGIN, streaming both ways so large photo
 * uploads and .xlsx downloads never buffer in memory.
 */
function proxyApi(req, res) {
  const upstream = https.request(
    {
      protocol: API_URL.protocol,
      hostname: API_URL.hostname,
      port:     API_URL.port || 443,
      method:   req.method,
      path:     req.url,
      headers: {
        ...req.headers,
        // Must match the upstream vhost/TLS SNI, not our own hostname.
        host: API_URL.host,
        // Let the API keep seeing the real client and scheme behind us.
        'x-forwarded-host':  req.headers.host,
        'x-forwarded-proto': 'https',
        'x-forwarded-for':   req.socket.remoteAddress || '',
      },
    },
    (up) => {
      const headers = { ...up.headers }
      // Drop CORS headers: the response is same-origin now, and a stale
      // Access-Control-Allow-Origin naming the old API host only confuses things.
      for (const h of Object.keys(headers)) {
        if (h.toLowerCase().startsWith('access-control-')) delete headers[h]
      }
      // Strip Domain= from Set-Cookie so every session cookie binds to THIS
      // host. Without it the API's COOKIE_DOMAIN would scope cookies to its own
      // subdomain and the browser would refuse to store them here — the exact
      // failure we are fixing, just moved one step down.
      if (headers['set-cookie']) {
        headers['set-cookie'] = headers['set-cookie'].map((c) =>
          c.replace(/;\s*Domain=[^;]*/i, ''))
      }
      res.writeHead(up.statusCode || 502, headers)
      up.pipe(res)
    },
  )

  upstream.setTimeout(PROXY_TIMEOUT_MS, () => upstream.destroy(new Error('upstream timeout')))
  upstream.on('error', (err) => {
    console.error('[proxy]', req.method, req.url, err.message)
    if (!res.headersSent) send(res, 502, 'Bad gateway', { 'Content-Type': 'text/plain' })
    else res.destroy()
  })
  // If the client hangs up mid-upload, don't leave the upstream request open.
  req.on('aborted', () => upstream.destroy())
  req.pipe(upstream)
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)

  // Liveness probe (Railway / uptime monitors)
  if (url.pathname === '/health') {
    return send(res, 200, 'ok', { 'Content-Type': 'text/plain' })
  }

  // API — proxied so the session cookie stays first-party (see header comment).
  if (API_URL && (url.pathname === '/api' || url.pathname.startsWith('/api/'))) {
    return proxyApi(req, res)
  }

  // Static asset?
  const file = resolveStatic(url.pathname)
  if (file) return serveFile(res, file)

  // SPA fallback — every other path serves index.html so React Router can take over.
  serveFile(res, INDEX)
})

server.listen(PORT, () => {
  console.log(`🚀 Room Match frontend on http://localhost:${PORT}`)
  console.log(API_ORIGIN
    ? `   /api/* → ${API_ORIGIN} (same-origin proxy)`
    : '   /api/* NOT proxied — API_ORIGIN is unset')
})
