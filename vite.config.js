import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// VITE_API_BASE — leave unset in dev to use the /api proxy (below).
// Set to a full URL in production (e.g. https://api.yourapp.com/api).
export default defineConfig(({ mode }) => {
  const apiBase = process.env.VITE_API_BASE
  // No alias needed: this is now a standalone repo, so bare specifiers
  // (react, react-dom, react-router-dom, etc.) resolve from
  // ./node_modules normally. The previous aliases pointed one directory up
  // to the old monorepo root — fine locally, but Railway's build container
  // only sees this directory, so the aliases pointed at non-existent paths
  // and Vite emitted bare specifiers in the bundle, breaking the production
  // build with ERR_NAME_NOT_RESOLVED in the browser.

  return {
    plugins: [react()],
    base: '/',                          // absolute paths so deep-link hard refreshes work
    server: {
      port: 5173,
      // Only proxy in dev. When VITE_API_BASE is set we assume prod deploy.
      proxy: apiBase ? undefined : { '/api': 'http://localhost:4000' },
    },
    build: {
      sourcemap: mode !== 'production',
    },
  }
})