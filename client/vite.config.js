import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:8787',
      // Preview iframe loads vendored libs from /vendor (served by the server).
      // Without this, the live preview 404s in dev and renders blank.
      '/vendor': 'http://localhost:8787',
    },
  },
})
