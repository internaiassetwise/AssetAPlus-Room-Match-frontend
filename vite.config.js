import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// VITE_API_BASE — leave unset in dev to use the /api proxy (below).
// Set to a full URL in production (e.g. https://api.yourapp.com/api).
export default defineConfig(({ mode }) => {
  const apiBase = process.env.VITE_API_BASE
  // npm workspaces hoists some deps to the root node_modules. Vite's dep
  // optimizer does not walk up the tree, so we alias the ones we use.
  const root = fileURLToPath(new URL('..', import.meta.url))
  const alias = {
    react:            `${root}/node_modules/react`,
    'react-dom':      `${root}/node_modules/react-dom`,
    'react-router-dom': `${root}/node_modules/react-router-dom`,
    'react-router':   `${root}/node_modules/react-router`,
    scheduler:        `${root}/node_modules/scheduler`,
  }

  return {
    plugins: [react()],
    base: './',                         // safe for subpath deploys (Netlify, GH Pages)
    resolve: { alias },
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