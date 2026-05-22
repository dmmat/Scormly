import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Served from the root of the custom domain (scormly.app, via public/CNAME), so
// the base path is '/' everywhere. (It was '/Scormly/' when the site lived at
// <user>.github.io/Scormly/.)
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
})
