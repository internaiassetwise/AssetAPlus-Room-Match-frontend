// serve.js — Production static server for the Vite SPA.
// Serves dist/ with aggressive caching on /assets/*, no cache on index.html, and
// an SPA fallback so React Router (and the /admin/* section) keeps working after
// a hard refresh. Zero runtime dependencies — uses only Node built-ins.
//
// Health check: GET /health → "ok" (Railway uptime / monitoring)
// Run: node serve.js   (PORT env, defaults to 3000)

import http from 'node:http'
import fs   from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST      = path.join(__dirname, 'dist')
const INDEX     = path.join(DIST, 'index.html')
const PORT      = Number(process.env.PORT) || 3000

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

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)

  // Liveness probe (Railway / uptime monitors)
  if (url.pathname === '/health') {
    return send(res, 200, 'ok', { 'Content-Type': 'text/plain' })
  }

  // Static asset?
  const file = resolveStatic(url.pathname)
  if (file) return serveFile(res, file)

  // SPA fallback — every other path serves index.html so React Router can take over.
  serveFile(res, INDEX)
})

server.listen(PORT, () => {
  console.log(`🚀 Room Match frontend on http://localhost:${PORT}`)
})
