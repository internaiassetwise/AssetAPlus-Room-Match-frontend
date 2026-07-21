// src/api/client.js — fetch wrapper with timeout, retry, and structured errors.
//
// Base URL precedence:
//   1. VITE_API_BASE   — explicit backend URL (use in production deploys)
//   2. /api            — Vite dev-server proxy → localhost:4000

const BASE = import.meta.env.VITE_API_BASE || '/api'
const DEFAULT_TIMEOUT_MS = 8_000
const MAX_RETRIES = 1            // one retry on network / 5xx failure

export class ApiError extends Error {
  constructor(status, code, message, details, requestId) {
    super(message)
    this.name      = 'ApiError'
    this.status    = status
    this.code      = code
    this.details   = details
    this.requestId = requestId
  }
}

function uuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'req-' + Math.random().toString(36).slice(2, 10)
}

async function rawRequest(path, opts = {}, { timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  const requestId = uuid()

  try {
    const res = await fetch(`${BASE}${path}`, {
      ...opts,
      signal: controller.signal,
      credentials: 'include',                            // round-trip admin_session cookie
      headers: {
        // FormData bodies: let the browser set Content-Type (with the proper
        // multipart boundary). Hardcoding application/json here would break
        // file uploads — the server's multipart parser would see JSON headers
        // and never decode the parts.
        ...(opts.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        'x-request-id': requestId,
        ...(opts.headers || {}),
      },
    })
    let body = null
    try { body = await res.json() } catch { /* may be empty */ }

    if (!res.ok) {
      // Server gave us a structured { ok:false, error:{...} } payload?
      const err = body?.error
      throw new ApiError(
        res.status,
        err?.code || `HTTP_${res.status}`,
        err?.message || `API ${path} failed (${res.status})`,
        err?.details,
        body?.requestId || requestId,
      )
    }
    return body
  } catch (err) {
    if (err instanceof ApiError) throw err
    // AbortError → timeout; network error → TypeError on fetch
    if (err?.name === 'AbortError') {
      throw new ApiError(0, 'TIMEOUT', `Request to ${path} timed out after ${timeoutMs}ms`, undefined, requestId)
    }
    throw new ApiError(0, 'NETWORK', err?.message || 'Network error', undefined, requestId)
  } finally {
    clearTimeout(timer)
  }
}

async function request(path, opts = {}, requestOpts = {}) {
  let attempt = 0
  let lastErr
  while (attempt <= MAX_RETRIES) {
    try {
      return await rawRequest(path, opts, requestOpts)
    } catch (err) {
      lastErr = err
      const retriable = err instanceof ApiError
        && (err.code === 'NETWORK' || err.code === 'TIMEOUT' || (err.status >= 500 && err.status < 600))
      if (!retriable || attempt === MAX_RETRIES) throw err
      attempt++
      // small back-off with jitter
      await new Promise((r) => setTimeout(r, 200 * attempt + Math.random() * 100))
    }
  }
  throw lastErr
}

const qs = (params) => {
  const usp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue
    usp.set(k, v)
  }
  const s = usp.toString()
  return s ? `?${s}` : ''
}

export const api = {
  listRooms:    (params = {}) => request(`/rooms${qs(params)}`),
  getRoom:      (id)         => request(`/rooms/${id}`),
  listZones:    ()           => request('/zones'),
  listReviews:  ()           => request('/reviews'),
  listStats:    ()           => request('/stats'),
  submitPreference:      (body) => request('/preferences',       { method: 'POST', body: JSON.stringify(body) }),
  submitTenantPreference:(body) => request('/preferences/tenant', { method: 'POST', body: JSON.stringify(body) }),
  submitTenantLead:      (body) => request('/leads/tenant',      { method: 'POST', body: JSON.stringify(body) }),
  submitContact:         (body) => request('/contact',           { method: 'POST', body: JSON.stringify(body) }),

  // Tenant leads Excel export — direct browser download (admin cookie is
  // sent automatically for same-eTLD+1 navigation). Returns an absolute URL
  // so an <a href> download works cross-origin (frontend → API on Railway).
  tenantLeadsXlsxUrl: () => `${BASE}/leads/tenant.xlsx`,

  // Matches
  listMatches:    (params = {}) => request(`/matches${qs(params)}`),
  createMatch:    (body)        => request('/matches',     { method: 'POST', body: JSON.stringify(body) }),
  updateMatch:    (id, body)    => request(`/matches/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  suggestMatches: (tenantId, limit) => request(`/matches/suggest?tenant_id=${tenantId}${qs({ limit })}`),

  // Landlords
  listLandlords:  (params = {}) => request(`/landlords${qs(params)}`),
  getLandlord:    (id)          => request(`/landlords/${id}`),
  updateLandlord: (id, body)    => request(`/landlords/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

  // Tenants (admin-only directory — for the matching panel)
  listTenants:    ()             => request('/tenants'),

  // Admin auth + rooms CRUD (requires session cookie)
  adminLogin:     (body)        => request('/auth/login',  { method: 'POST', body: JSON.stringify(body) }),
  adminLogout:    ()            => request('/auth/logout', { method: 'POST' }),
  adminMe:        ()            => request('/auth/me'),
  createRoom:     (body)        => request('/rooms',       { method: 'POST', body: JSON.stringify(body) }),
  updateRoom:     (id, body)    => request(`/rooms/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteRoom:     (id)          => request(`/rooms/${id}`, { method: 'DELETE' }),

  // Admin room photo manager — multipart upload, one photo per call.
  //   listRoomPhotos(id)          → GET    /rooms/:id/photos   (requireAdmin; rows with id+url)
  //   uploadRoomPhoto(id, file)   → POST   /rooms/:id/photos   (multipart 'photo' field)
  //   deleteRoomPhoto(id, photoId)→ DELETE /rooms/:id/photos/:photoId
  listRoomPhotos:  (id)            => request(`/rooms/${id}/photos`),
  uploadRoomPhoto: (id, file)      => {
    const fd = new FormData()
    fd.append('photo', file)
    return request(`/rooms/${id}/photos`, {
      method: 'POST',
      body: fd,
      // File uploads can legitimately exceed the default 8s timeout on slow
      // mobile uplinks — give them up to 30s.
    }, { timeoutMs: 30_000 })
  },
  deleteRoomPhoto: (id, photoId)   => request(`/rooms/${id}/photos/${photoId}`, { method: 'DELETE' }),

  // Admin viewing-slots manager — open/cancel bookable viewing time-slots.
  //   listRoomSlots(id)       → GET    /rooms/:id/slots   (public; open future slots)
  //   openRoomSlot(id, iso)   → POST   /rooms/:id/slots   (requireAdmin)
  //   cancelRoomSlot(slotId)  → DELETE /rooms/slots/:id   (requireAdmin)
  listRoomSlots:  (id)            => request("/rooms/" + id + "/slots"),
  openRoomSlot:   (id, startsAt)  => request("/rooms/" + id + "/slots", { method:"POST", body: JSON.stringify({ startsAt }) }),
  cancelRoomSlot: (slotId)        => request("/rooms/slots/" + slotId, { method:"DELETE" }),

  // Phase 5 — admin approval of bot-submitted listings
  listPendingListings: ()   => request('/rooms/pending'),
  approveListing:      (id) => request(`/rooms/${id}/approve`, { method: 'POST' }),
  rejectListing:       (id) => request(`/rooms/${id}/reject`,  { method: 'POST' }),

  // Public-user auth (Google OIDC + mock persona login).
  // userMe()      → returns { id, email, name, picture, role: 'tenant' } or throws when not signed in.
  // landlordMe()  → returns { id, name, email, ..., role: 'landlord' } or throws when not signed in.
  // loginPersona(persona) → POST /auth/mock/login { persona } — dev/demo only.
  //   The server gates this on MOCK_AUTH=true and returns 404 in prod. When real
  //   Google OAuth lands, swap this for googleStartUrl() in the UI.
  userMe:           () => request('/auth/user/me'),
  userLogout:       () => request('/auth/user/logout', { method: 'POST' }),
  landlordMe:       () => request('/auth/landlord/me'),
  landlordLogout:   () => request('/auth/landlord/logout', { method: 'POST' }),
  // Auth start URLs are full-page browser redirects (window.location / <a href>),
  // so they MUST be absolute. A relative '/api/auth/...' would resolve against the
  // FRONTEND origin — a separate host in production, where there's no /api route,
  // so the SPA catch-all would swallow it and bounce the user home. BASE already
  // points at the backend (VITE_API_BASE in prod), so prepend it here.
  lineStartUrl:     (role, returnTo = '/') => `${BASE}/auth/line/start?role=${role}&return=${encodeURIComponent(returnTo)}`,
  googleStartUrl:   (returnTo = '/') => `${BASE}/auth/google/start?return=${encodeURIComponent(returnTo)}`,
  azureStartUrl:    (returnTo = '/') => `${BASE}/auth/azure/start?return=${encodeURIComponent(returnTo)}`,

  // Viewings (calendar / วันนัดชมห้อง)
  listViewings:   (params = {}) => request(`/viewings${qs(params)}`),
  createViewing:  (body)        => request('/viewings',         { method: 'POST',  body: JSON.stringify(body) }),
  updateViewing:  (id, body)    => request(`/viewings/${id}`,  { method: 'PATCH', body: JSON.stringify(body) }),

  // Inquiries (tenant → landlord messages)
  listInquiries:  (params = {}) => request(`/inquiries${qs(params)}`),
  createInquiry:  (body)        => request('/inquiries',         { method: 'POST',  body: JSON.stringify(body) }),
  replyInquiry:   (id, body)    => request(`/inquiries/${id}`,  { method: 'PATCH', body: JSON.stringify(body) }),

  // Landlord "my listings" (CRUD scoped to logged-in landlord)
  listMyListings:   ()           => request('/my-listings'),
  getMyListing:     (id)         => request(`/my-listings/${id}`),
  createMyListing:  (body)       => request('/my-listings',         { method: 'POST',  body: JSON.stringify(body) }),
  updateMyListing:  (id, body)   => request(`/my-listings/${id}`,  { method: 'PATCH', body: JSON.stringify(body) }),
  deleteMyListing:  (id)         => request(`/my-listings/${id}`,  { method: 'DELETE' }),

  // Dashboard KPIs
  getDashboard:     ()           => request('/dashboard'),

  // FAQs (admin knowledge base + RAG source for the Line bot)
  listFaqs:        (params = {}) => request(`/faqs${qs(params)}`),
  getFaq:          (id)          => request(`/faqs/${id}`),
  createFaq:       (body)        => request('/faqs',                 { method: 'POST',  body: JSON.stringify(body) }),
  updateFaq:       (id, body)    => request(`/faqs/${id}`,          { method: 'PATCH', body: JSON.stringify(body) }),
  deleteFaq:       (id)          => request(`/faqs/${id}`,          { method: 'DELETE' }),
  regenerateFaqEmbedding: (id)   => request(`/faqs/${id}/regenerate-embedding`, { method: 'POST' }),
  // Phase 2.8 — block editor preview/sample-ask
  previewFaq:      (body)        => request('/faqs/preview',         { method: 'POST',  body: JSON.stringify(body) }),
  sampleAskFaq:    (body)        => request('/faqs/sample-ask',      { method: 'POST',  body: JSON.stringify(body) }),

  // Bot inquiries inbox — questions/intents the bot forwarded to admin.
  //   listBotInquiries({status,limit,offset}) → { items, summary:{open,replied,resolved}, limit, offset }
  //   getBotInquiry(id)                         → single row (full payload)
  //   replyBotInquiry(id, { reply })            → Express pushes the message
  //                                              to the tenant via /api/admin/push
  //                                              on the bot, then marks replied
  //   resolveBotInquiry(id)                     → close without replying
  listBotInquiries:  (params = {}) => request(`/admin/bot-inquiries${qs(params)}`),
  getBotInquiry:     (id)          => request(`/admin/bot-inquiries/${id}`),
  replyBotInquiry:   (id, body)    => request(`/admin/bot-inquiries/${id}/reply`,   { method: 'POST', body: JSON.stringify(body) }),
  resolveBotInquiry: (id)          => request(`/admin/bot-inquiries/${id}/resolve`, { method: 'POST' }),

  // Phase 5 — admin inbox over admin_queue (bot escalations). Reply is pushed
  // to the user's Line in-process by the server (no separate bot hop).
  listAdminQueue:    (params = {}) => request(`/admin/inbox${qs(params)}`),
  getAdminQueue:     (id)          => request(`/admin/inbox/${id}`),
  replyAdminQueue:   (id, body)    => request(`/admin/inbox/${id}/reply`,   { method: 'POST', body: JSON.stringify(body) }),
  resolveAdminQueue: (id)          => request(`/admin/inbox/${id}/resolve`, { method: 'POST' }),
  // Live takeover — mute the bot for this user and chat with them in-thread.
  takeoverAdminQueue:(id)          => request(`/admin/inbox/${id}/takeover`, { method: 'POST' }),
  releaseAdminQueue: (id)          => request(`/admin/inbox/${id}/release`,  { method: 'POST' }),

  // Admin — viewing confirmations (tenant bookings via the bot). A tenant taps a
  // bookable slot in Line → a 'requested' viewing; admin confirms/declines here.
  listAdminViewings: (params = {}) => request(`/admin/viewings${qs(params)}`),
  confirmViewing:    (id)          => request(`/admin/viewings/${id}/confirm`, { method: 'POST' }),
  declineViewing:    (id)          => request(`/admin/viewings/${id}/decline`, { method: 'POST' }),
}