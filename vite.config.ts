import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base = '/scormly/' для деплою на GitHub Pages (https://<user>.github.io/scormly/),
// '/' для локальної розробки.
export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/scormly/' : '/',
  plugins: [react(), tailwindcss()],
})
