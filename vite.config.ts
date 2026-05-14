import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Same paths are rewritten on Vercel / Netlify so the browser never hits cross-origin APIs.
      '/api/jolpica': {
        target: 'https://api.jolpi.ca',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/jolpica/, ''),
      },
      '/api/wiki': {
        target: 'https://en.wikipedia.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/wiki/, ''),
      },
    },
  },
})
