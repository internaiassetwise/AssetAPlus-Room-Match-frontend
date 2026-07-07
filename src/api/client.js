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
        'Content-Type': 'application/json',
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

async function request(path, opts = {}) {
  let attempt = 0
  let lastErr
  while (attempt <= MAX_RETRIES) {
    try {
      return await rawRequest(path, opts)
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
  submitContact:         (body) => request('/contact',           { method: 'POST', body: JSON.stringify(body) }),

  // Matches
  listMatches:    (params = {}) => request(`/matches${qs(params)}`),
  createMatch:    (body)        => request('/matches',     { method: 'POST', body: JSON.stringify(body) }),
  updateMatch:    (id, body)    => request(`/matches/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  suggestMatches: (tenantId, limit) => request(`/matches/suggest?tenant_id=${tenantId}${qs({ limit })}`),

  // Landlords
  listLandlords:  (params = {}) => request(`/landlords${qs(params)}`),
  getLandlord:    (id)          => request(`/landlords/${id}`),
  updateLandlord: (id, body)    => request(`/landlords/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

  // Admin auth + rooms CRUD (requires session cookie)
  adminLogin:     (body)        => request('/auth/login',  { method: 'POST', body: JSON.stringify(body) }),
  adminLogout:    ()            => request('/auth/logout', { method: 'POST' }),
  adminMe:        ()            => request('/auth/me'),
  createRoom:     (body)        => request('/rooms',       { method: 'POST', body: JSON.stringify(body) }),
  updateRoom:     (id, body)    => request(`/rooms/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteRoom:     (id)          => request(`/rooms/${id}`, { method: 'DELETE' }),

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
  loginPersona:     (persona) => request('/auth/mock/login', { method: 'POST', body: JSON.stringify({ persona }) }),
  googleStartUrl:   (returnTo = '/') => `/api/auth/google/start?return=${encodeURIComponent(returnTo)}`,
  azureStartUrl:    (returnTo = '/') => `/api/auth/azure/start?return=${encodeURIComponent(returnTo)}`,

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
}